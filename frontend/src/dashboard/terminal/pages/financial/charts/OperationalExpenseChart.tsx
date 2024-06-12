import {
  BarElement,
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

import { Chart } from "react-chartjs-2";
// import { OperationalExpense } from "types/operational-expense";
import { OperationalExpense } from "types/terminal-financial";
import Colors from "utils/colors";

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

export type OperationalExpenseChartProps = {
  chartTitle: string;
  datasets: OperationalExpense[][];
};

const OperationalExpenseChart = ({
  chartTitle,
  datasets,
}: OperationalExpenseChartProps) => {
  const customDatasets: ChartDataset<"bar", number[]>[] = [];
  const chartYaxis: number[] = [];
  const customLabels: string[] = [];
  const operationalDatasets: number[][] = [];
  const barColors: string[] = Colors;

  datasets.forEach((element, index) => {
    const capitalExpense = element as OperationalExpense[];
    const innerOperationalDataset: number[] = [];

    capitalExpense.forEach((item) => {
      if (!chartYaxis.includes(item.year)) {
        chartYaxis.push(item.year);
      }

      if (!customLabels.includes(item.type)) {
        customLabels.push(item.type);
      }

      innerOperationalDataset.push(Number(item.costUsd.toFixed(2)));
    });

    operationalDatasets.push(innerOperationalDataset);

    customDatasets.push({
      label: `${
        customLabels[index].charAt(0).toUpperCase() +
        customLabels[index].slice(1)
      } Costs`,
      data: operationalDatasets[index],
      backgroundColor: barColors[index],
    });
  });

  const options: ChartOptions = {
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label(tooltipItem) {
            return (
              tooltipItem.dataset.label + ": $" + tooltipItem.formattedValue
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
          text: chartTitle,
        },
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Millions of Y1 USD",
        },
        stacked: true,
        min: 0,
        ticks: {
          display: true,
          callback(tickValue: any) {
            // show value in units of millions of Y1 USD
            const scaledValue = tickValue / 1000000;
            return Number(this.getLabelForValue(scaledValue)).toFixed(2);
          },
        },
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
    },
  };

  let data: ChartData<
    "bar",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
    datasets: [],
  };

  data = {
    labels: chartYaxis,
    datasets: customDatasets,
  };

  return <Chart type={"bar"} options={options} data={data} />;
};

export default OperationalExpenseChart;
