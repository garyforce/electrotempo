import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  BarElement,
  BarController,
  Legend,
  ChartOptions,
  ChartDataset,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { FleetElectrificationScenario } from "types/fleet-electrification-scenario";
import { Box, Grid, Stack, Typography } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

const colors = {
  vehicle: "#05C2CC",
  charger: "#FFEDCC",
  fuel: "#6D7675",
  insurance: "#BEC4C2",
  downtime: "#E6D5E9",
  maintenance: "#A3C6DD",
  other: "#A3E0D5",
  labor: "#F6B4B0",
};

function getTotalVehicleCosts(
  fleetElectrificationScenario: FleetElectrificationScenario
) {
  return fleetElectrificationScenario.vehiclePurchaseSuggestions.reduce(
    (acc, suggestion) => {
      return acc + suggestion.totalCapexUsd;
    },
    0
  );
}

function getTotalChargerCosts(
  fleetElectrificationScenario: FleetElectrificationScenario
) {
  return fleetElectrificationScenario.chargerPurchaseSuggestions.reduce(
    (acc, suggestion) => {
      return acc + suggestion.totalCapexUsd;
    },
    0
  );
}

function createDatasetFromFleetElectrificationScenario(
  fleetElectificationScenario: FleetElectrificationScenario
): ChartDataset<"bar", number[]>[] {
  const datasets: ChartDataset<"bar", number[]>[] = [
    {
      label: "Vehicle Costs",
      data: [getTotalVehicleCosts(fleetElectificationScenario)],
      borderColor: "#000000",
      backgroundColor: colors.vehicle,
      borderWidth: 1,
    },
    {
      label: "Charger Costs",
      data: [getTotalChargerCosts(fleetElectificationScenario)],
      borderColor: "#000000",
      backgroundColor: colors.charger,
      borderWidth: 1,
    },
    {
      label: "Fuel Costs",
      data: [fleetElectificationScenario.fuelCostUsd],
      borderColor: "#000000",
      backgroundColor: colors.fuel,
      borderWidth: 1,
    },
    {
      label: "Insurance Costs",
      data: [fleetElectificationScenario.insuranceCostUsd],
      borderColor: "#000000",
      backgroundColor: colors.insurance,
      borderWidth: 1,
    },
    {
      label: "Maintenance Costs",
      data: [fleetElectificationScenario.maintenanceCostUsd],
      borderColor: "#000000",
      backgroundColor: colors.maintenance,
      borderWidth: 1,
    },
    {
      label: "Downtime Costs",
      data: [fleetElectificationScenario.downtimeCostUsd],
      borderColor: "#000000",
      backgroundColor: colors.downtime,
      borderWidth: 1,
    },
    {
      label: "Other O&M Costs",
      data: [fleetElectificationScenario.otherOAndMCostUsd],
      borderColor: "#000000",
      backgroundColor: colors.other,
      borderWidth: 1,
    },
    {
      label: "Labor Costs",
      data: [fleetElectificationScenario.laborCostUsd],
      borderColor: "#000000",
      backgroundColor: colors.labor,
      borderRadius: 15,
      borderWidth: 1,
    },
  ];

  return datasets;
}

function formatMoney(amount: number) {
  return `$${Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export type TcoBarChartProps = {
  fleetElectificationScenario?: FleetElectrificationScenario;
  disableXaxis?: boolean;
  title: string;
  suggestedMax?: number;
};

export default function TcoBarChart({
  fleetElectificationScenario: fleetElectrificationScenario,
  title,
  disableXaxis,
  suggestedMax,
}: TcoBarChartProps) {
  const labels = [""]; // without labels, no data appears
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        align: "start",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const cost = context.parsed.x as number;
            const totalCostStr = formatMoney(cost);
            const costPerMileStr = formatMoney(
              cost /
                ((fleetElectrificationScenario?.annualMilesDriven ?? 0) * 10) // 10 years of miles because costs are amortized over 10 years
            );
            return `${context.dataset.label}: ${totalCostStr} (${costPerMileStr} per mile) `;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        suggestedMax: suggestedMax,
        ticks: {
          display: disableXaxis,
          callback: function (value, index, ticks) {
            return formatMoney(value as number);
          },
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
      },
    },
  };

  const datasets =
    fleetElectrificationScenario !== undefined
      ? createDatasetFromFleetElectrificationScenario(
          fleetElectrificationScenario
        )
      : [];

  const data = {
    labels,
    datasets,
  };

  return (
    <Box sx={{ height: "200px" }}>
      <Chart type="bar" options={options} data={data} />
    </Box>
  );
}

export function TcoLegend() {
  return (
    <Box sx={{ padding: "2em" }}>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        rowGap={1}
      >
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.vehicle,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Vehicle</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.downtime,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Downtime</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.charger,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Charger</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.maintenance,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Maintenance</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.fuel,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Fuel</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.other,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Other O&M</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.insurance,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Insurance</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Stack direction={"row"} spacing={1}>
            <Box
              sx={{
                height: 20,
                width: 20,
                backgroundColor: colors.labor,
                border: 0.3,
                borderRadius: 1,
              }}
            ></Box>
            <Typography>Labor</Typography>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
