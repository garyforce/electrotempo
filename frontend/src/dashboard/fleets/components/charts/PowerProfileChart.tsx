import { Box, Stack, Typography } from "@mui/material";
import { FleetElectrificationScenario } from "types/fleet-electrification-scenario";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  PointElement,
  LineElement,
  Filler,
  Legend,
  ChartOptions,
  ChartDataset,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import Color from "colorjs.io";
import { getPaletteColor } from "utils/color";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type PowerProfileChartProps = {
  scenario?: FleetElectrificationScenario;
};

export function PowerProfileChart({ scenario }: PowerProfileChartProps) {
  let datasets: ChartDataset<"line", number[]>[] = [];
  if (scenario) {
    datasets = scenario.vehiclePurchaseSuggestions.map((suggestion, i) => {
      const borderColor = new Color(getPaletteColor(i));
      const backgroundColor = new Color(borderColor);
      backgroundColor.alpha = 0.2;
      const data = suggestion.powerDemandProfile.map((powerDemand) => {
        return powerDemand.powerDemandKw;
      });
      const dataset: ChartDataset<"line", number[]> = {
        type: "line",
        label: suggestion.referenceMakeModel,
        data: data,
        borderColor: borderColor.toString(),
        backgroundColor: backgroundColor.toString(),
        fill: i === 0 ? true : "-1",
      };
      return dataset;
    });
  }
  const options: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: { text: "Hours of Day", display: true },
        grid: {
          display: false,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        title: { text: "kWh", display: true },
        grid: {
          display: false,
          drawOnChartArea: false,
          drawTicks: true,
        },
        stacked: true,
      },
    },
    maintainAspectRatio: false,
  };

  const data = {
    labels: Array.from(Array(24).keys()),
    datasets,
  };

  return (
    <Stack>
      <Typography variant="controlTitle" sx={{ fontWeight: "bold" }}>
        Power Use Profile <Typography component="span">(cumulative)</Typography>
      </Typography>

      <Box sx={{ height: 250 }}>
        <Chart type={"line"} options={options} data={data} />
      </Box>
    </Stack>
  );
}
