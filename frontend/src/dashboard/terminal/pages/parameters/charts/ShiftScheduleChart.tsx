import { ChartData, Chart as ChartJS, ChartOptions } from "chart.js";
import {
  MatrixController,
  MatrixDataPoint,
  MatrixElement,
} from "chartjs-chart-matrix";
import { Chart } from "react-chartjs-2";
import { ShiftScheduleStates } from "types/shift-schedule-states";
ChartJS.register(MatrixController, MatrixElement);

type ShiftScheduleChartProps = {
  shiftSchedule: number[] | undefined;
};

type ModifiedMatrixDataPoint = MatrixDataPoint & { break: boolean };

type ShiftScheduleChartData = {
  [key: string]: ModifiedMatrixDataPoint[];
};

type CustomChartOptions = {
  data: ModifiedMatrixDataPoint[];
  label: string;
  borderWidth: number;
  backgroundColor: string | ((context: any) => string);
  borderColor: string | ((context: any) => string);
  width: (context: { chart: ChartJS }) => number;
  height: (context: { chart: ChartJS }) => number;
};

const getPaletteColor = (isBreak: boolean) => {
  return isBreak ? "#FDBE02" : "#05C2CC";
};

const ShiftScheduleChart = ({ shiftSchedule }: ShiftScheduleChartProps) => {
  let data: ChartData<"matrix", (ModifiedMatrixDataPoint | null)[], unknown> = {
    datasets: [],
  };
  const customShiftScheduleChartData: ShiftScheduleChartData = {};
  const customChartData: CustomChartOptions[] = [];
  const customLabels: ShiftScheduleStates[] = ["ACTIVE", "BREAK"];

  const options: ChartOptions = {
    plugins: {
      title: {
        display: false,
        text: "Shift Schedule",
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
              `Shift: ${element?.y}`,
              `Status: ${customLabels[element.break ? 1 : 0]}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hour",
        },
        beginAtZero: true,
        min: "12AM",
        suggestedMax: 23,
        ticks: {
          stepSize: 1,
          autoSkip: false,
          callback(tickValue: any) {
            const hour = Number(tickValue) % 12 || 12;
            const period = Number(tickValue) >= 12 ? "PM" : "AM";
            return `${hour}${period}`;
          },
          align: "start",
          maxRotation: 30,
        },
        grid: {
          display: true,
          offset: true,
          drawOnChartArea: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Shift Id",
        },
        offset: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          display: false,
        },
      },
    },
  };
  let counter = 1;
  shiftSchedule?.forEach((schedule, index) => {
    const isBreak = schedule === 2;
    if (isBreak || schedule === 1) {
      const hour = index % 24;
      if (
        customShiftScheduleChartData[customLabels[isBreak ? 1 : 0]] ===
        undefined
      ) {
        customShiftScheduleChartData[customLabels[isBreak ? 1 : 0]] = [];
      }
      customShiftScheduleChartData[customLabels[isBreak ? 1 : 0]]?.push({
        x: hour,
        y: counter,
        break: isBreak,
      });
    }
    if (index % 24 === 23) {
      counter++;
    }
  });
  Object.keys(customShiftScheduleChartData).forEach((key) => {
    customChartData.push({
      data: customShiftScheduleChartData[key],
      label: key.toUpperCase(),
      borderWidth: 1,
      backgroundColor(context: any) {
        return getPaletteColor(context.dataset.data[context.dataIndex].break);
      },
      borderColor(context: any) {
        return getPaletteColor(context.dataset.data[context.dataIndex].break);
      },
      width: ({ chart }: { chart: ChartJS }) =>
        chart.chartArea?.width / (chart.scales?.x.ticks.length - 1),
      height: ({ chart }: { chart: ChartJS }) =>
        chart.chartArea?.height / chart.scales?.y.ticks.length,
    });
  });

  data = {
    labels: customLabels,
    datasets: customChartData,
  };

  return <Chart type="matrix" options={options} data={data} />;
};

export default ShiftScheduleChart;
