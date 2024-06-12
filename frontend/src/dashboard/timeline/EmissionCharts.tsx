import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";

import { GrowthScenario } from "types/growth-scenario";
import { VehicleClass, VehicleClassAnnualDatum } from "types/vehicle-class";
import { ChartLayout } from "./ChartLayout";
import EmissionsOfICEVehiclesChart from "./charts/EmissionOfICEVehiclesChart";
import RemainingIceVehiclesChart from "./charts/RemainingIceVehiclesChart";

function maximumNumRemainingIce(
  growthScenario: GrowthScenario | undefined
): number {
  if (!growthScenario) {
    return 0;
  }

  let max = 0;

  for (
    let i = 0;
    i < growthScenario.vehicleClasses[0].annualData!.length;
    i++
  ) {
    let sum = 0;
    for (let j = 0; j < growthScenario.vehicleClasses.length; j++) {
      sum += growthScenario.vehicleClasses[j].annualData![i].numOfRemainingIce;
    }
    max = Math.max(max, sum);
  }
  return max;
}

type EmissionChartsSingleViewProps = {
  growthScenario?: GrowthScenario;
  suggestedMax?: number;
};

function EmissionChartsSingleView({
  growthScenario,
  suggestedMax,
}: EmissionChartsSingleViewProps) {
  return (
    <Paper
      elevation={4}
      sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
    >
      <Typography variant="h2">Remaining ICE Vehicles</Typography>
      <Box sx={{ height: "18rem" }}>
        <RemainingIceVehiclesChart
          growthScenario={growthScenario}
          suggestedMax={suggestedMax}
        />
      </Box>
    </Paper>
  );
}

export type EmissionChartsProps = {
  growthScenario?: GrowthScenario;
  comparisonGrowthScenario?: GrowthScenario;
  comparisonMode?: boolean;
};

export default function EmissionCharts({
  growthScenario,
  comparisonGrowthScenario,
  comparisonMode,
}: EmissionChartsProps) {
  const emissionsData: any[] = [];
  const emissionsCompData: any[] = [];
  const emissionTypes: string[] = ["nox", "voc", "pm10", "pm25", "sox", "co2"];

  emissionTypes.forEach((emissionType) => {
    const type: any = {
      name: emissionType,
      data: [],
    };

    growthScenario?.vehicleClasses?.forEach((item: VehicleClass) => {
      const vehicleData: VehicleClassAnnualDatum[] = item.annualData || [];
      const emissionValues = vehicleData.map(
        (data: VehicleClassAnnualDatum) => {
          return { year: data.year, value: data.emissions[emissionType] };
        }
      );
      type.data.push({
        vehicleType: item.name,
        emissionValues,
      });
    });

    emissionsData.push(type);
  });

  if (comparisonMode) {
    const suggestedMax = Math.max(
      maximumNumRemainingIce(growthScenario),
      maximumNumRemainingIce(comparisonGrowthScenario)
    );

    emissionTypes.forEach((emissionType) => {
      const type: any = {
        name: emissionType,
        data: [],
      };

      comparisonGrowthScenario?.vehicleClasses?.forEach(
        (item: VehicleClass) => {
          const vehicleData: VehicleClassAnnualDatum[] = item.annualData || [];
          const emissionValues = vehicleData.map(
            (data: VehicleClassAnnualDatum) => {
              return { year: data.year, value: data.emissions[emissionType] };
            }
          );
          type.data.push({
            vehicleType: item.name,
            emissionValues,
          });
        }
      );

      emissionsCompData.push(type);
    });

    return (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="space-between"
        alignItems={"center"}
        spacing={2}
      >
        <Grid container justifyContent={"space-evenly"} rowGap={3}>
          {emissionsData.map((emission, index) => (
            <Grid item key={index}>
              <ChartLayout variant="horizontal">
                <EmissionsOfICEVehiclesChart
                  emissionRates={emission}
                  type={emission.name}
                />
              </ChartLayout>
            </Grid>
          ))}
        </Grid>
        <Grid container justifyContent={"space-evenly"} rowGap={3}>
          {emissionsCompData.map((emission, index) => (
            <Grid item key={index}>
              <ChartLayout variant="horizontal">
                <EmissionsOfICEVehiclesChart
                  emissionRates={emission}
                  type={emission.name}
                />
              </ChartLayout>
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Grid container spacing={2}>
      {/* TODO : Restore the remaining ice graph with more analysis
      https://electrotempo.atlassian.net/browse/CORE-2803 */}
      {/* <Grid item>
        <ChartLayout variant="horizontal">
          <EmissionChartsSingleView growthScenario={growthScenario} />
        </ChartLayout>
      </Grid> */}
      {emissionsData.map((emission, index) => (
        <Grid item key={index}>
          <ChartLayout variant="horizontal">
            <EmissionsOfICEVehiclesChart
              emissionRates={emission}
              type={emission.name}
            />
          </ChartLayout>
        </Grid>
      ))}
    </Grid>
  );
}
