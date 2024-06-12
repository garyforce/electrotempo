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
import { ArrivalsVehicleHourlyData } from "types/hub-scenario-data";
import Colors from "utils/colors";
import Color from "colorjs.io";

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

export type TrafficProfileChartProps = {
  truckHourlyArrivalsData: ArrivalsVehicleHourlyData[];
  trailerHourlyArrivalsData: ArrivalsVehicleHourlyData[];
};

const TrafficProfileChart = ({
  truckHourlyArrivalsData,
  trailerHourlyArrivalsData,
}: TrafficProfileChartProps) => {
  const chartProperties = {
    yAxisTitle: "Number of EV arrivals",
    toolTipTitle: "Daily traffic",
  };

  const options: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hour",
        },
        ticks: {
          autoSkip: true,
          callback(tickValue: any) {
            if (tickValue % 2 === 0) {
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
        stacked: true,
      },
    },
  };

  let chartData: ChartData<
    "line",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  > = {
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
    datasets: [],
  };

  // Prepare background colors for each dataset
  const backgroundColors = [];
  for (let i = 0; i < Colors.length; i++) {
    const color = new Color(Colors[i]);
    color.alpha = 0.2;
    backgroundColors.push(color.toString());
  }

  const publicTruckArrivals = truckHourlyArrivalsData.map(
    ({ hour, public_arrivals }) => ({
      x: hour,
      y: public_arrivals,
    })
  );

  const subscriptionTruckArrivals = truckHourlyArrivalsData.map(
    ({ hour, subscription_arrivals }) => ({
      x: hour,
      y: subscription_arrivals,
    })
  );

  const publicTrailerArrivals = trailerHourlyArrivalsData.map(
    ({ hour, public_arrivals }) => ({
      x: hour,
      y: public_arrivals,
    })
  );

  const subscriptionTrailerArrivals = trailerHourlyArrivalsData.map(
    ({ hour, subscription_arrivals }) => ({
      x: hour,
      y: subscription_arrivals,
    })
  );

  // Append the first data point to the end for "12am"
  publicTruckArrivals.push(publicTruckArrivals[0]);
  subscriptionTruckArrivals.push(subscriptionTruckArrivals[0]);
  publicTrailerArrivals.push(publicTrailerArrivals[0]);
  subscriptionTrailerArrivals.push(subscriptionTrailerArrivals[0]);

  chartData.datasets.push(
    {
      label: `Straight Trucks (Public)`,
      data: publicTruckArrivals,
      borderColor: Colors[0],
      backgroundColor: backgroundColors[0],
      fill: true,
    },
    {
      label: `Straight Trucks (Private)`,
      data: subscriptionTruckArrivals,
      borderColor: Colors[1],
      backgroundColor: backgroundColors[1],
      fill: 0,
    },
    {
      label: `Tractor-Trailers (Public)`,
      data: publicTrailerArrivals,
      borderColor: Colors[2],
      backgroundColor: backgroundColors[2],
      fill: 1,
    },
    {
      label: `Tractor-Trailers (Private)`,
      data: subscriptionTrailerArrivals,
      borderColor: Colors[3],
      backgroundColor: backgroundColors[3],
      fill: 2,
    }
  );

  return <Chart type={"line"} options={options} data={chartData} />;
};

export default TrafficProfileChart;
