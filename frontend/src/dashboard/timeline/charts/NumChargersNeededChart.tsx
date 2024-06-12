import React from "react";

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
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { VehicleClass } from "types/vehicle-class";
import {
  LdvTotalDailyDemandData,
  getLdvTotalDailyDemandFromNumEvs,
} from "./LdvTotalDailyDemandChart";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type NumChargersNeededData = {
  numL2HomeChargersNeeded: number;
  numL2WorkplaceChargersNeeded: number;
  numDcfcWorkplaceChargersNeeded: number;
  numDcfcPublicChargersNeeded: number;
};

export function getNumChargersNeededFromDemandData(
  demandData: LdvTotalDailyDemandData,
  workplaceFractionServedByDcfc: number
): NumChargersNeededData {
  return {
    numL2HomeChargersNeeded: Math.round(
      demandData.dailyHomeDemandKwh / 24 / (17 * 0.1)
    ),
    numL2WorkplaceChargersNeeded: Math.round(
      (demandData.dailyWorkplaceDemandKwh *
        (1 - workplaceFractionServedByDcfc)) /
        24 /
        (17 * 0.1)
    ),
    numDcfcWorkplaceChargersNeeded: Math.round(
      (demandData.dailyWorkplaceDemandKwh * workplaceFractionServedByDcfc) /
        24 /
        (150 * 0.1)
    ),
    numDcfcPublicChargersNeeded: Math.round(
      demandData.dailyPublicDemandKwh / 24 / (150 * 0.1)
    ),
  };
}

export type NumChargersNeededChartProps = {
  vehicleClass?: VehicleClass;
  workplaceFractionServedByDcfc: number;
  suggestedMax?: number;
};

export default function NumChargersNeededChart({
  vehicleClass,
  workplaceFractionServedByDcfc,
  suggestedMax,
}: NumChargersNeededChartProps) {
  const options: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: "Chargers (thousands)",
        },
        ticks: {
          callback: function (value, index, ticks) {
            return (Number(value) / 1000).toLocaleString();
          },
        },
        suggestedMax: suggestedMax,
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
        demandData: getLdvTotalDailyDemandFromNumEvs(e.numEvs),
      };
    });
    const numChargersNeededData = demandData.map((e) => {
      return getNumChargersNeededFromDemandData(
        e.demandData,
        workplaceFractionServedByDcfc
      );
    });
    data = {
      labels: demandData.map((yearData) => yearData.year),
      datasets: [
        {
          label: "Home L2",
          data: numChargersNeededData.map((e) => e.numL2HomeChargersNeeded),
          borderColor: "rgb(5, 194, 204)",
          backgroundColor: "rgb(5, 194, 204, 0.5)",
          fill: true,
        },
        {
          label: "Workplace L2",
          data: numChargersNeededData.map(
            (e) => e.numL2WorkplaceChargersNeeded
          ),
          borderColor: "rgb(255, 99, 255)",
          backgroundColor: "rgba(255, 99, 255, 0.5)",
          fill: "-1",
        },
        {
          label: "Workplace DCFC",
          data: numChargersNeededData.map(
            (e) => e.numDcfcWorkplaceChargersNeeded
          ),
          borderColor: "rgb(253, 190, 2)",
          backgroundColor: "rgba(253, 190, 2, 0.5)",
          fill: "-1",
        },
        {
          label: "Public DCFC",
          data: numChargersNeededData.map((e) => e.numDcfcPublicChargersNeeded),
          borderColor: "rgb(5, 255, 132)",
          backgroundColor: "rgba(5, 255, 132, 0.5)",
          fill: "-1",
        },
      ],
    };
  }

  return <Chart options={options} data={data} type={"line"} />;
}
