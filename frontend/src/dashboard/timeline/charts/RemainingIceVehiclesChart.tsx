import {
  BubbleDataPoint,
  CategoryScale,
  ChartData,
  ChartDataset,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  ScatterDataPoint,
  Title,
  Tooltip,
} from "chart.js";
import Color from "colorjs.io";
import { Chart } from "react-chartjs-2";
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

export type RemainingIceVehiclesChartProps = {
  growthScenario?: GrowthScenario;
  suggestedMax?: number;
};

export default function RemainingIceVehiclesChart({
  growthScenario,
  suggestedMax,
}: RemainingIceVehiclesChartProps) {
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
  const vehicleClasses = growthScenario?.vehicleClasses || [];
  const vehicleClassWithData = getFirstVehicleClassWithData(vehicleClasses);
  let labels: string[] = [];
  if (vehicleClassWithData !== undefined) {
    getYearsWithData(vehicleClassWithData).forEach((e) =>
      labels.push(e.toString())
    );
  }

  let data: ChartData<
    "line",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
    labels: labels,
    datasets: vehicleClasses.map((vehicleClass, index) => {
      const color = getChartColorForVehicleClass(vehicleClass);
      const fillColor = new Color(color);
      fillColor.alpha = 0.5;

      const dataset: ChartDataset<"line"> = {
        type: "line",
        label: vehicleClass.name,
        data: [],
        borderColor: color.toString(),
        backgroundColor: fillColor.toString(),
        fill: index === 0 ? true : "-1",
      };

      if (vehicleClass.annualData !== undefined) {
        dataset.data = vehicleClass.annualData.map((e) => e.numOfRemainingIce);
      }
      return dataset;
    }),
  };
  return <Chart options={options} data={data} type={"line"} />;
}
