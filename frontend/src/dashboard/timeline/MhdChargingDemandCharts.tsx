import { Alert, Box, Divider, Paper, Stack, Typography } from "@mui/material";
import {
  GrowthScenario,
  getMhdVehicleClasses,
  growthScenarioHasMhdVehicleClass,
} from "types/growth-scenario";
import { ChartControlValues } from "./TimelinePage";
import { ChartLayout } from "./ChartLayout";
import MhdTotalDailyDemandChart from "./charts/MhdTotalDailyDemandChart";
import { getDailyTotalMhdDemandKwhForVehicleClass } from "./charts/utils";

function maximumTotalDailyChargingDemand(
  growthScenario: GrowthScenario | undefined
): number {
  if (!growthScenario) {
    return 0;
  }

  if (!growthScenarioHasMhdVehicleClass(growthScenario)) {
    return 0;
  }

  let max = 0;

  for (
    let i = 0;
    i < growthScenario.vehicleClasses[0].annualData!.length;
    i++
  ) {
    let sum = 0;
    const mhdVehicleClasses = getMhdVehicleClasses(growthScenario);
    mhdVehicleClasses.forEach((vehicleClass) => {
      sum += getDailyTotalMhdDemandKwhForVehicleClass(
        vehicleClass.annualData![i].numEvs,
        vehicleClass.name
      );
    });
    max = Math.max(max, sum);
  }
  return max;
}

type MhdChargingDemandChartsSingleViewProps = {
  growthScenario?: GrowthScenario;
  variant?: "horizontal" | "vertical";
  totalDailyChargingDemandSuggestedMax?: number;
};

function MhdChargingDemandChartsSingleView({
  growthScenario,
  variant,
  totalDailyChargingDemandSuggestedMax,
}: MhdChargingDemandChartsSingleViewProps) {
  const hasMhdVehicleClass =
    growthScenario !== undefined
      ? growthScenarioHasMhdVehicleClass(growthScenario)
      : undefined;

  let alert = !hasMhdVehicleClass ? (
    // sans box the alert will grow to fill the full height of the container
    <Box>
      <Alert severity="warning">
        The currently selected growth scenario does not include a medium/heavy
        duty vehicle class. Please choose another growth scenario.
      </Alert>
    </Box>
  ) : null;
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {alert}
      <ChartLayout variant={variant}>
        <Box>
          <Paper
            elevation={4}
            sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
          >
            <Typography variant="h2">
              Average Daily EV Energy Consumption
            </Typography>
            <Box sx={{ height: "18rem" }}>
              <MhdTotalDailyDemandChart
                growthScenario={growthScenario}
                suggestedMax={totalDailyChargingDemandSuggestedMax}
              />
            </Box>
          </Paper>
        </Box>
      </ChartLayout>
    </Stack>
  );
}

export type MhdChargingDemandChartsProps = {
  growthScenario?: GrowthScenario;
  chartControlValues?: ChartControlValues;
  setChartControlValues?: (chartControlValues: ChartControlValues) => void;
  comparisonMode?: boolean;
  comparisonGrowthScenario?: GrowthScenario;
  comparisonChartControlValues?: ChartControlValues;
  setComparisonChartControlValues?: (
    comparisonChartControlValues: ChartControlValues
  ) => void;
};

export default function MhdChargingDemandCharts({
  growthScenario,
  chartControlValues,
  setChartControlValues,
  comparisonMode,
  comparisonGrowthScenario,
  comparisonChartControlValues,
  setComparisonChartControlValues,
}: MhdChargingDemandChartsProps) {
  if (comparisonMode) {
    const totalDailyChargingDemandSuggestedMax = Math.max(
      maximumTotalDailyChargingDemand(growthScenario),
      maximumTotalDailyChargingDemand(comparisonGrowthScenario)
    );

    return (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="center"
        spacing={2}
      >
        <MhdChargingDemandChartsSingleView
          growthScenario={growthScenario}
          variant={"vertical"}
          totalDailyChargingDemandSuggestedMax={
            totalDailyChargingDemandSuggestedMax
          }
        />
        <MhdChargingDemandChartsSingleView
          growthScenario={comparisonGrowthScenario}
          variant={"vertical"}
          totalDailyChargingDemandSuggestedMax={
            totalDailyChargingDemandSuggestedMax
          }
        />
      </Stack>
    );
  }
  return (
    <MhdChargingDemandChartsSingleView
      growthScenario={growthScenario}
      variant={"horizontal"}
    />
  );
}
