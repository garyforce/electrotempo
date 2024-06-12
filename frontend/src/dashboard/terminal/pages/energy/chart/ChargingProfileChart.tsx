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
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

export type DemandChartProps = {
  variant: "power" | "energy";
  data?: number[];
  utilityConstraint?: number;
};

const ChargingProfileChart = ({
  variant,
  data,
  utilityConstraint,
}: DemandChartProps) => {
  // Add the first element to the end of the array to make the chart loop
  data?.push(data[0]);

  const chartProperties = {
    chartTitle: "Power Demand Profile",
    yAxisTitle: "Power Demand (kW)",
    toolTipTitle: "Power Demand",
    units: "kW",
  };

  if (variant === "energy") {
    chartProperties.chartTitle = "Energy Consumption Profile";
    chartProperties.yAxisTitle = "Energy Consumption (kWh)";
    chartProperties.toolTipTitle = "Energy Consumption";
    chartProperties.units = "kWh";
  }

  const options: ChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label(tooltipItem) {
            return (
              tooltipItem.dataset.label +
              ": " +
              tooltipItem.formattedValue +
              " " +
              chartProperties.units
            );
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: chartProperties.chartTitle,
      },
      annotation: {
        annotations: utilityConstraint
          ? [
              {
                type: "line", // Utility energy threshold line
                yMin: utilityConstraint,
                yMax: utilityConstraint,
                borderColor: "#ff0000",
                borderDash: [5, 5], // Configures the line as a dotted line
                borderWidth: 1,
              },
              {
                type: "label",
                xValue: 12,
                yValue: utilityConstraint
                  ? utilityConstraint * 1.05
                  : undefined,
                backgroundColor: "transparent",
                content: [`Utility threshold`],
                font: {
                  size: 12,
                },
              },
            ]
          : [],
      },
    },
    scales: {
      x: {
        title: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          callback(tickValue: any) {
            if (tickValue % 6 === 0) {
              return this.getLabelForValue(tickValue);
            } else {
              return "";
            }
          },
        },
      },
      y: {
        title: {
          display: true,
          text: chartProperties.yAxisTitle,
        },
        min: 0,
        ticks: {
          display: true,
        },
      },
    },
  };

  let chartData: ChartData<
    "line",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
    datasets: [],
  };

  chartData = {
    labels: [
      "12am",
      "1am",
      "2am",
      "3am",
      "4am",
      "5am",
      "6am",
      "7am",
      "8am",
      "9am",
      "10am",
      "11am",
      "12pm",
      "1pm",
      "2pm",
      "3pm",
      "4pm",
      "5pm",
      "6pm",
      "7pm",
      "8pm",
      "9pm",
      "10pm",
      "11pm",
      "12am",
    ],
    datasets: [
      {
        label: chartProperties.toolTipTitle,
        data: data ?? [],
        borderColor: "#05C2CC",
        backgroundColor: "#b4edf0",
        fill: true,
      },
    ],
  };

  return <Chart type={"line"} options={options} data={chartData} />;
};

export default ChargingProfileChart;
