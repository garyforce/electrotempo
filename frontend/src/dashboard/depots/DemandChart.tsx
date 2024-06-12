import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import { ElectricDemand } from "types/electric-demand";

ChartJS.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function fillMissingDemandData(data: ElectricDemand[]): ElectricDemand[] {
  const filledData: ElectricDemand[] = [];
  // for every hour from 0-23, if there is no data, add a row of 0s
  for (let i = 0; i < 24; i++) {
    // data has midnight as 24; we use 0.
    const hourData = data.find((row) => row.hourid % 24 === i);
    if (!hourData) {
      filledData.push({
        hourid: i,
        energy_demand_kwh_summer: 0,
        energy_demand_kwh_winter: 0,
        energy_demand_kwh_shoulder: 0,
        power_demand_kw_summer: 0,
        power_demand_kw_winter: 0,
        power_demand_kw_shoulder: 0,
      });
    } else {
      filledData.push(hourData);
    }
  }

  return filledData;
}

export type DemandChartProps = {
  data?: ElectricDemand[];
  variant: "power" | "energy";
};

export default function DemandChart({ data, variant }: DemandChartProps) {
  const yAxisTitle = variant === "power" ? "Power kW" : "Energy kWh";

  const filledData = fillMissingDemandData(data ?? []);
  const datasets =
    variant === "power"
      ? [
          {
            label: "Summer",
            data: filledData?.map((d) => d.power_demand_kw_summer),
            borderColor: "#fdbe02",
            backgroundColor: "rgba(253, 190, 2, 0.5)",
            fill: false,
          },
          {
            label: "Winter",
            data: filledData?.map((d) => d.power_demand_kw_winter),
            borderColor: "#05C2CC",
            backgroundColor: "rgba(5, 194, 204, 0.5)",
            fill: false,
          },
          {
            label: "Shoulder",
            data: filledData?.map((d) => d.power_demand_kw_shoulder),
            borderColor: "rgba(220, 130, 130)",
            backgroundColor: "rgba(220, 130, 130, 0.5)",
            fill: false,
          },
        ]
      : [
          {
            label: "Summer",
            data: filledData?.map((d) => d.energy_demand_kwh_summer),
            borderColor: "#fdbe02",
            backgroundColor: "rgba(253, 190, 2, 0.5)",
            fill: false,
          },
          {
            label: "Winter",
            data: filledData?.map((d) => d.energy_demand_kwh_winter),
            borderColor: "#05C2CC",
            backgroundColor: "rgba(5, 194, 204, 0.5)",
            fill: false,
          },
          {
            label: "Shoulder",
            data: filledData?.map((d) => d.energy_demand_kwh_shoulder),
            borderColor: "rgba(220, 130, 130)",
            backgroundColor: "rgba(220, 130, 130, 0.5)",
            fill: false,
          },
        ];

  return (
    <Chart
      type="line"
      data={{
        labels: filledData?.map((_: any, i: number) => i),
        datasets: datasets,
      }}
      options={{
        scales: {
          x: {
            title: {
              display: true,
              text: "Hour",
            },
          },
          y: {
            title: {
              display: true,
              text: yAxisTitle,
            },
            min: 0,
            suggestedMax: 100,
          },
        },
      }}
    />
  );
}
