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
  LineController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import Color from "colorjs.io";
import { GrowthScenario, getMhdVehicleClasses } from "types/growth-scenario";
import {
  getChartColorForVehicleClass,
  getDailyTotalMhdDemandKwhForVehicleClass,
  getFirstVehicleClassWithData,
  getYearsWithData,
} from "./utils";
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

const unit = "MWh";
const unitScaleFromKwh = 0.001;

export type LdvTotalDailyDemandChartProps = {
  growthScenario?: GrowthScenario;
  suggestedMax?: number;
};

export default function LdvTotalDailyDemandChart({
  growthScenario,
  suggestedMax,
}: LdvTotalDailyDemandChartProps) {
  const options: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: unit,
        },
        ticks: {
          callback: function (value, index, ticks) {
            return (Number(value) * unitScaleFromKwh).toLocaleString();
          },
        },
        suggestedMax: suggestedMax,
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
              const scaledValue = context.parsed.y * unitScaleFromKwh;
              label +=
                scaledValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) + ` ${unit}`;
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
    const mhdVehicleClasses = getMhdVehicleClasses(growthScenario);
    const vehicleClassWithData =
      getFirstVehicleClassWithData(mhdVehicleClasses);
    if (vehicleClassWithData !== undefined) {
      getYearsWithData(vehicleClassWithData).forEach((e) =>
        labels.push(e.toString())
      );
    }

    datasets = mhdVehicleClasses.map((vehicleClass, index) => {
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
        dataset.data = vehicleClass.annualData.map((e) =>
          getDailyTotalMhdDemandKwhForVehicleClass(e.numEvs, vehicleClass.name)
        );
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

  return <Chart options={options} data={data} type="line" />;
}
