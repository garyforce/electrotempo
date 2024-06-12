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

function getChartColorForVehicleClass(vehicleClass: string) {
  switch (vehicleClass) {
    case "Cars":
      return new Color("rgb(5, 194, 204)");
    case "Light Trucks":
      return new Color("rgb(255, 99, 255)");
    case "Straight Trucks":
      return new Color("rgb(253, 190, 2)");
    case "Tractors":
      return new Color("rgb(5, 255, 132)");
    default:
      return new Color("rgb(255, 99, 132)");
  }
}

type EmissionRates = {
  name: string;
  data: {
    year: number;
    value: number;
  }[];
};

export type EmissionGeneratedChartProps = {
  xAxisTitle?: string;
  yAxisTitle?: string;
  emissionRates: EmissionRates | undefined;
};

const EmissionGeneratedChart = ({
  xAxisTitle,
  yAxisTitle,
  emissionRates,
}: EmissionGeneratedChartProps) => {
  const options: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisTitle,
        },
      },
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: yAxisTitle,
        },
      },
    },
    maintainAspectRatio: false,
  };

  let labels: string[] = [];
  let datasets: ChartDataset<"line", number[]>[] = [];

  emissionRates?.data.forEach((item: any) =>
    item.emissionValues.forEach(
      (values: { year: { toString: () => string } }) => {
        if (!labels.includes(values.year.toString())) {
          labels.push(values.year.toString());
        }
      }
    )
  );

  emissionRates?.data.forEach((item: any, index: number) => {
    const color = getChartColorForVehicleClass(item.vehicleType);
    const fillColor = new Color(color);
    fillColor.alpha = 0.5;

    datasets.push({
      type: "line",
      label: item.vehicleType,
      data: item.emissionValues.map((values: { value: any }) => values.value),
      borderColor: color.toString(),
      backgroundColor: fillColor.toString(),
      fill: index === 0 ? true : "-1",
    });
  });

  let data: ChartData<
    "line",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
    labels: labels,
    datasets: datasets,
  };

  return <Chart options={options} data={data} type={"line"} />;
};

export default EmissionGeneratedChart;
