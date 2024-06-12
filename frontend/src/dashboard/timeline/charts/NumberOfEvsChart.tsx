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
import { GrowthScenario } from "types/growth-scenario";
import {
  getChartColorForVehicleClass,
  getFirstVehicleClassWithData,
  getYearsWithData,
} from "./utils";
import Color from "colorjs.io";
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

export type NumberOfEvsChartProps = {
  growthScenario?: GrowthScenario;
  suggestedMax?: number;
};

export default function NumberOfEvsChart({
  growthScenario,
  suggestedMax,
}: NumberOfEvsChartProps) {
  const options: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: "Number of Vehicles (millions)",
        },
        ticks: {
          callback: function (value, index, ticks) {
            return (Number(value) / 1e6).toLocaleString();
          },
        },
        suggestedMax: suggestedMax,
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
    }

    datasets = vehicleClasses.map((vehicleClass, index) => {
      const color = getChartColorForVehicleClass(vehicleClass);
      const fillColor = new Color(color);
      fillColor.alpha = 0.5;

      const dataset: ChartDataset<"line", number[]> = {
        type: "line",
        label: vehicleClass.name,
        data: [],
        borderColor: color.toString(),
        backgroundColor: fillColor.toString(),
        fill: index === 0 ? true : "-1",
      };

      if (vehicleClass.annualData !== undefined) {
        dataset.data = vehicleClass.annualData.map((e) => e.numEvs);
      }
      return dataset;
    });
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
