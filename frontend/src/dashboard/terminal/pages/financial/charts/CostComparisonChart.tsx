import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";

import {
  BubbleDataPoint,
  ChartData,
  ChartOptions,
  ScatterDataPoint,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { CostComparisonData } from "types/terminal-financial";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.unregister(ChartDataLabels);

export type CostComparisonChartProps = {
  dataSets: CostComparisonData;
  baseVehicleEngineType: string;
};

const CostComparisonChart = ({
  dataSets,
  baseVehicleEngineType,
}: CostComparisonChartProps) => {
  const {
    chargerCostsData,
    vehicleCostsData,
    batteryCostsData,
    iceOnlyCostsData,
    fuelAndMaintenanceCostsData,
    evOpportunityChargingCostsData,
    evOptimizedChargingCostsData,
  } = dataSets;

  const sumICEOnlyCostsData = iceOnlyCostsData?.reduce((a, b) => a + b, 0);
  const sumEVOpportunityChargingCostsData =
    evOpportunityChargingCostsData?.reduce((a, b) => a + b, 0);
  const sumEVOptimizedChargingCostsData = evOptimizedChargingCostsData?.reduce(
    (a, b) => a + b,
    0
  );
  const sums = [
    sumICEOnlyCostsData ?? 0,
    sumEVOpportunityChargingCostsData ?? 0,
    sumEVOptimizedChargingCostsData ?? 0,
  ];

  const options: ChartOptions = {
    indexAxis: "y",
    plugins: {
      datalabels: {
        formatter(value, context) {
          if (context.datasetIndex === 2) {
            return (sums[context.dataIndex] / 1000000).toFixed(2);
          }
          return "";
        },
        display: true,
        font: {
          weight: "bold",
        },
        color: "#000",
        align: "start",
        offset: -2,
        anchor: "end",
        clamp: true,
        padding: 3,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            return (
              tooltipItem.dataset.label +
              ": $" +
              Math.round(Number(tooltipItem.raw))
            );
          },
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Total expenses for planning horizon (in millions of Y1 USD)",
        },
        stacked: true,
        ticks: {
          display: true,
          callback: function (value) {
            return "$" + (Number(value) <= 1 ? "-" : Number(value) / 1000000);
          },
        },
        grid: {
          display: true,
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
          drawOnChartArea: false,
          drawTicks: false,
        },
      },
    },
  };

  let chartData: ChartData<
    "bar",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
    datasets: [],
  };

  chartData = {
    labels: [
      `${baseVehicleEngineType} Only`,
      "EV - Reference Case",
      "EV - Optimized Charging",
    ],
    datasets: [
      {
        label: "Charger Capital Expense",
        data: chargerCostsData ?? [],
        backgroundColor: "#818589",
      },
      {
        label: "Vehicle Costs",
        data: vehicleCostsData ?? [],
        backgroundColor: "#05C2CC",
      },
      {
        label: "Battery Replacement Costs",
        data: batteryCostsData ?? [],
        backgroundColor: "#EE6C4D",
      },
      {
        label: "Fuel and Maintenance Expense",
        data: fuelAndMaintenanceCostsData ?? [],
        backgroundColor: "#FDBE02",
      },
    ],
  };

  return (
    <Chart
      type={"bar"}
      options={options}
      data={chartData}
      plugins={[ChartDataLabels]}
    />
  );
};

export default CostComparisonChart;
