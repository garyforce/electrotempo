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
import { getLdvTotalDailyDemandFromNumEvs } from "./LdvTotalDailyDemandChart";
import {
  NumChargersNeededData,
  getNumChargersNeededFromDemandData,
} from "./NumChargersNeededChart";
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

export type ChargerInvestmentRequiredData = {
  workplaceL2Investment: number;
  workplaceDcfcInvestment: number;
  publicDcfcInvestment: number;
};

export function getChargerInvestmentRequiredFromNumChargersNeeded(
  numChargersNeededData: NumChargersNeededData,
  pricePerLevel2Charger: number,
  pricePerDcFastCharger: number
): ChargerInvestmentRequiredData {
  return {
    workplaceL2Investment:
      numChargersNeededData.numL2WorkplaceChargersNeeded *
      pricePerLevel2Charger,
    workplaceDcfcInvestment:
      numChargersNeededData.numDcfcWorkplaceChargersNeeded *
      pricePerDcFastCharger,
    publicDcfcInvestment:
      numChargersNeededData.numDcfcPublicChargersNeeded * pricePerDcFastCharger,
  };
}

export type ChargerInvestmentRequiredChartProps = {
  vehicleClass?: VehicleClass;
  workplaceFractionServedByDcfc: number;
  pricePerLevel2Charger: number;
  pricePerDcFastCharger: number;
  suggestedMax?: number;
};

export default function ChargerInvestmentRequiredChart({
  vehicleClass,
  workplaceFractionServedByDcfc,
  pricePerLevel2Charger,
  pricePerDcFastCharger,
  suggestedMax,
}: ChargerInvestmentRequiredChartProps) {
  const options: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: `${new Date().getFullYear()} US Dollars (Billions)`,
        },
        ticks: {
          callback: function (value, index, ticks) {
            return `$${Number(value) / 1e9}`;
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
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumSignificantDigits: 10,
              }).format(context.parsed.y);
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
        demandData: getLdvTotalDailyDemandFromNumEvs(e.numEvs),
      };
    });
    const numChargersNeededData = demandData.map((e) => {
      return getNumChargersNeededFromDemandData(
        e.demandData,
        workplaceFractionServedByDcfc
      );
    });
    const chargerInvestmentRequiredData = numChargersNeededData.map((e) => {
      return getChargerInvestmentRequiredFromNumChargersNeeded(
        e,
        pricePerLevel2Charger,
        pricePerDcFastCharger
      );
    });

    data = {
      labels: demandData.map((yearData) => yearData.year),
      datasets: [
        {
          label: "Workplace L2",
          data: chargerInvestmentRequiredData.map(
            (e) => e.workplaceL2Investment
          ),
          borderColor: "rgb(5, 194, 204)",
          backgroundColor: "rgb(5, 194, 204, 0.5)",
          fill: true,
        },
        {
          label: "Public DCFC",
          data: chargerInvestmentRequiredData.map(
            (e) => e.publicDcfcInvestment
          ),
          borderColor: "rgb(255, 99, 255)",
          backgroundColor: "rgba(255, 99, 255, 0.5)",
          fill: "-1",
        },
        {
          label: "Workplace DCFC",
          data: chargerInvestmentRequiredData.map(
            (e) => e.workplaceDcfcInvestment
          ),
          borderColor: "rgb(253, 190, 2)",
          backgroundColor: "rgba(253, 190, 2, 0.5)",
          fill: "-1",
        },
      ],
    };
  }

  return <Chart type={"line"} options={options} data={data} />;
}
