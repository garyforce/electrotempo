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
  LineController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { VehicleClass } from "types/vehicle-class";
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

export type LdvTotalDailyDemandData = {
  dailyHomeDemandKwh: number;
  dailyWorkplaceDemandKwh: number;
  dailyPublicDemandKwh: number;
};

export function getLdvTotalDailyDemandFromNumEvs(
  numEvs: number
): LdvTotalDailyDemandData {
  return {
    dailyHomeDemandKwh: numEvs * 8.12099,
    dailyWorkplaceDemandKwh: numEvs * 2.45278,
    dailyPublicDemandKwh: numEvs * 0.7775,
  };
}

export type LdvTotalDailyDemandChartProps = {
  vehicleClass?: VehicleClass;
  suggestedMax?: number;
};

export default function LdvTotalDailyDemandChart({
  vehicleClass,
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

  let data: ChartData<
    "line",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
    datasets: [],
  };
  if (vehicleClass?.annualData !== undefined) {
    const demandData = vehicleClass.annualData.map((e) => {
      return {
        year: e.year,
        ...getLdvTotalDailyDemandFromNumEvs(e.numEvs),
      };
    });
    data = {
      labels: demandData.map((yearData) => yearData.year),
      datasets: [
        {
          label: "Home",
          data: demandData.map((e) => e.dailyHomeDemandKwh),
          borderColor: "rgb(5, 194, 204)",
          backgroundColor: "rgb(5, 194, 204, 0.5)",
          fill: true,
        },
        {
          label: "Workplace",
          data: demandData.map((e) => e.dailyWorkplaceDemandKwh),
          borderColor: "rgb(255, 99, 255)",
          backgroundColor: "rgba(255, 99, 255, 0.5)",
          fill: "-1",
        },
        {
          label: "Public",
          data: demandData.map((e) => e.dailyPublicDemandKwh),
          borderColor: "rgb(253, 190, 2)",
          backgroundColor: "rgba(253, 190, 2, 0.5)",
          fill: "-1",
        },
      ],
    };
  }

  return <Chart options={options} data={data} type="line" />;
}
