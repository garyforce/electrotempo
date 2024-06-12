import { ChartData, Chart as ChartJS, ChartOptions } from "chart.js";
import {
  MatrixController,
  MatrixDataPoint,
  MatrixElement,
} from "chartjs-chart-matrix";
import { Chart } from "react-chartjs-2";
import { VehicleStatus } from "types/vehicle-status";

ChartJS.register(MatrixController, MatrixElement);

const getPaletteColor = (status: string) => {
  if (status.toUpperCase() === "CHARGING") {
    return "#05C2CC";
  } else if (status.toUpperCase() === "IDLE") {
    return "#FDBE02";
  } else if (status.toUpperCase() === "ON-SHIFT") {
    return "#EE6C4D";
  } else if (status.toUpperCase() === "PARTIAL-CHARGING") {
    return "#4CAF50";
  } else {
    return "#5B5B5B";
  }
};

const convertFleetDataToChartData = (
  fleetSchedule?: VehicleStatus[][]
): ChartData<"matrix"> => {
  const customFleetScheduleChartData: FleetScheduleChartData = {};
  const labels: VehicleStatus[] = [];
  const datasets: CustomChartOptions[] = [];
  if (fleetSchedule === undefined) {
    return {
      labels: [],
      datasets: [],
    };
  }
  fleetSchedule.forEach((vehicle, vehicleIndex) => {
    vehicle.forEach((status, statusIndex) => {
      if (customFleetScheduleChartData[status.status] === undefined) {
        customFleetScheduleChartData[status.status] = [];
        labels.push(status);
      }
      customFleetScheduleChartData[status.status]?.push({
        x: statusIndex,
        y: vehicleIndex + 1,
        status: status.status[0].toUpperCase() + status.status.slice(1),
      });
    });
  });

  Object.keys(customFleetScheduleChartData).forEach((key) => {
    datasets.push({
      label: key[0].toUpperCase() + key.slice(1),
      data: customFleetScheduleChartData[key],
      borderWidth: 1,
      backgroundColor(context: any) {
        return getPaletteColor(context.dataset.data[context.dataIndex].status);
      },
      borderColor(context: any) {
        return getPaletteColor(context.dataset.data[context.dataIndex].status);
      },
      height: ({ chart }: { chart: ChartJS }) =>
        chart.chartArea?.height / chart.scales.y.ticks.length,
      width: ({ chart }: { chart: ChartJS }) =>
        chart.chartArea?.width / chart.scales.x.ticks.length,
    });
  });

  return { labels, datasets };
};

type FleetScheduleChartProps = {
  variant: "charger" | "vehicle";
  fleetSchedule?: VehicleStatus[][];
};

type ModifiedMatrixDataPoint = MatrixDataPoint & { status: string };

type CustomChartOptions = {
  data: ModifiedMatrixDataPoint[];
  label: string;
  borderWidth: number;
  backgroundColor: string | ((context: any) => string);
  borderColor: string | ((context: any) => string);
  width: (context: { chart: ChartJS }) => number;
  height: (context: { chart: ChartJS }) => number;
};

type FleetScheduleChartData = {
  [key: string]: ModifiedMatrixDataPoint[];
};

const FleetScheduleChart = ({
  variant = "vehicle",
  fleetSchedule,
}: FleetScheduleChartProps) => {
  let chartProperties = {
    yAxisTitle: "Vehicle ID",
  };

  if (variant === "charger") {
    chartProperties.yAxisTitle = "Charger ID";
  }

  const options: ChartOptions = {
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          title() {
            return "";
          },
          label(context: any) {
            const element = context.dataset.data[context.dataIndex];
            const currentHour = Math.floor(element?.x);
            const nextHour = (currentHour + 1) % 24;

            const formatHour = (hour: number) => {
              if (hour === 0) {
                return "12AM";
              } else if (hour === 12) {
                return "12PM";
              } else if (hour < 12) {
                return `${hour}AM`;
              } else {
                return `${hour - 12}PM`;
              }
            };

            return [
              `Hour: ${formatHour(currentHour)} to ${formatHour(nextHour)}`,
              `${chartProperties.yAxisTitle}: ${element?.y}`,
              `Status: ${element?.status}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hour of day",
        },
        ticks: {
          stepSize: 1,
          autoSkip: false,
          callback(tickValue) {
            const hour = Number(tickValue) % 12 || 12;
            const period = Number(tickValue) >= 12 ? "PM" : "AM";
            return `${hour}${period}`;
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: chartProperties.yAxisTitle,
        },
        offset: true,
        ticks: {
          stepSize: 1,
          autoSkip: false,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const data = convertFleetDataToChartData(fleetSchedule);
  const chartHeight = fleetSchedule
    ? 200 + fleetSchedule.length * 5 + "px"
    : "200px";
  return (
    <Chart
      key={chartHeight}
      height={chartHeight}
      type="matrix"
      options={options}
      data={data}
    />
  );
};

export default FleetScheduleChart;
