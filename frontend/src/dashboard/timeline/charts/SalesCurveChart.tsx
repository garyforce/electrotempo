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
  ChartOptions,
  ChartData,
  ScatterDataPoint,
  BubbleDataPoint,
  ChartDataset,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import Color from "colorjs.io";
import { GrowthScenario } from "types/growth-scenario";
import {
  getChartColorForVehicleClass,
  getFirstVehicleClassWithData,
  getYearsWithData,
} from "./utils";
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

export type SalesCurveChartProps = {
  growthScenario?: GrowthScenario;
};

export default function SalesCurveChart({
  growthScenario,
}: SalesCurveChartProps) {
  const options: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value, index, ticks) {
            return value + "%";
          },
        },
        max: 100,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y != null) {
              label += context.parsed.y.toFixed(2) + "%";
            }
            return label;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  let labels: string[] = [];
  let datasets: ChartDataset<"line", number[]>[] = [];
  if (growthScenario !== undefined) {
    const vehicleClasses = growthScenario.vehicleClasses;
    const vehicleClassWithData = getFirstVehicleClassWithData(vehicleClasses);
    if (vehicleClassWithData !== undefined) {
      getYearsWithData(vehicleClassWithData).forEach((e) =>
        labels.push(e.toString())
      );
      datasets = vehicleClasses.map((vehicleClass) => {
        const color = getChartColorForVehicleClass(vehicleClass);
        const fillColor = new Color(color);
        fillColor.alpha = 0.5;

        const dataset: ChartDataset<"line", number[]> = {
          type: "line",
          label: vehicleClass.name,
          data: [],
          borderColor: color.toString(),
          backgroundColor: fillColor.toString(),
        };

        if (vehicleClass.annualData !== undefined) {
          dataset.data = vehicleClass.annualData.map(
            (e) => e.evFractionOfSales * 100
          );
        }
        return dataset;
      });
    }
  }

  let data: ChartData<
    "line",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
    labels: labels,
    datasets: datasets,
  };

  return <Chart options={options} data={data} type={"line"} />;
}
