import { Box } from "@mui/material";
import {
  BarController,
  BarElement,
  CategoryScale,
  ChartDataset,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { CapitalExpense } from "types/capital-expense";
import { OperationalExpense } from "types/operational-expense";
import Colors from "utils/colors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

const getColor = (index: number) => {
  return Colors[index];
};

const capitalizeFirstLetter = (str: string) => {
  let capitalWord = "";
  str.split(" ").forEach((word) => {
    capitalWord += word.charAt(0).toUpperCase() + word.slice(1) + " ";
  });
  return capitalWord;
};

const getChartTitle = (type: string) => {
  return type === "capital"
    ? "Capital costs (in millions of Y1 USD)"
    : "Operational costs (in millions of Y1 USD)";
};

export type FinancialExpenseChartProps = {
  type: "capital" | "operational";
  chartData: CapitalExpense[][] | OperationalExpense[][];
  year: number;
};

const FinancialExpenseChart = ({
  type,
  chartData,
  year,
}: FinancialExpenseChartProps) => {
  const labels = [year];
  const datasets: ChartDataset<"bar", number[]>[] = [];

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
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
    scales: {
      x: {
        title: {
          display: true,
          text: getChartTitle(type),
        },
        stacked: true,
        min: 0,
        ticks: {
          display: true,
          callback(tickValue: any) {
            if (type === "capital") {
              // show value in units of millions of Y1 USD
              const scaledValue = tickValue / 1000000;
              return Number(this.getLabelForValue(scaledValue)).toFixed(2);
            } else {
              // show value in units of millions of USD
              const scaledValue = tickValue / 1000000;
              return Number(scaledValue).toFixed(2);
            }
          },
        },
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Year",
        },
        stacked: true,
        grid: {
          display: false,
        },
      },
    },
  };
  let counter = 0;

  chartData.forEach((nestedArray: (CapitalExpense | OperationalExpense)[]) => {
    nestedArray.forEach((item: CapitalExpense | OperationalExpense) => {
      if ("numPurchased" in item) {
        datasets.push({
          label: `${capitalizeFirstLetter(item.type)}`,
          data: [Math.round(item.pricePerEach)],
          borderColor: getColor(counter),
          backgroundColor: getColor(counter),
          borderWidth: 1,
        });
      } else {
        datasets.push({
          label: `${capitalizeFirstLetter(item.type)}`,
          data: [Math.round(item.costUsd)],
          borderColor: getColor(counter),
          backgroundColor: getColor(counter),
          borderWidth: 1,
        });
      }
      counter++;
    });
  });

  const data = {
    labels,
    datasets,
  };

  return (
    <Box sx={{ height: "200px" }}>
      <Chart type="bar" options={options} data={data} />
    </Box>
  );
};

export default FinancialExpenseChart;
