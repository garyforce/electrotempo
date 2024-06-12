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

import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "react-chartjs-2";
import { CapitalExpense } from "types/capital-expense";
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

export type CapitalExpenseChartProps = {
  chartTitle: string;
  datasets: CapitalExpense[][];
};

const CapitalExpenseChart = ({
  chartTitle,
  datasets,
}: CapitalExpenseChartProps) => {
  const customDatasets: ChartDataset<"bar", number[]>[] = [];
  const chartYaxis: number[] = [];
  const customLabels: string[] = [];
  const capitalDatasets: number[][] = [];
  const customDataLabels: string[][] = [];
  const barColors: string[] = Colors;
  datasets.forEach((element, index) => {
    const capitalExpense = element as CapitalExpense[];
    const innerDataLabels: string[] = [];
    const innerCapitalDataset: number[] = [];
    capitalExpense.forEach((item, itemIndex) => {
      if (!chartYaxis.includes(item.year)) {
        chartYaxis.push(item.year);
      }

      if (!customLabels.includes(item.type)) {
        customLabels.push(item.type);
      }
      // only display the number of items purchased for itemized capital expenses
      if (item.itemized) {
        innerDataLabels.push(String(item.numPurchased));
      } else {
        innerDataLabels.push("");
      }

      innerCapitalDataset.push(item.numPurchased * item.pricePerEach);
    });

    customDataLabels.push(innerDataLabels);
    capitalDatasets.push(innerCapitalDataset);

    customDatasets.push({
      label: `${
        customLabels[index].charAt(0).toUpperCase() +
        customLabels[index].slice(1)
      } Costs`,
      data: capitalDatasets[index],
      backgroundColor: barColors[index],
    });
  });

  const options: ChartOptions = {
    plugins: {
      datalabels: {
        display: true,
        font: {
          weight: "bold",
        },
        color: "#000",
        align: "center",
        anchor: "center",
        formatter(value: number, context: any) {
          return customDataLabels[context.datasetIndex][context.dataIndex];
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label(tooltipItem) {
            return (
              tooltipItem.dataset.label +
              ": $" +
              Number(tooltipItem.raw).toFixed(2)
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

  return (
    <Chart
      type={"bar"}
      options={options}
      data={data}
      plugins={[ChartDataLabels]}
    />
  );
};

export default CapitalExpenseChart;
