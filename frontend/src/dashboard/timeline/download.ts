import { GrowthScenario } from "types/growth-scenario";
import { ChartControlValues } from "./TimelinePage";
import { downloadCsv } from "utils/file";
import {
  getDailyTotalMhdDemandKwhForVehicleClass,
  isLightDutyVehicleClass,
} from "./charts/utils";
import { getLdvTotalDailyDemandFromNumEvs } from "./charts/LdvTotalDailyDemandChart";
import { getNumChargersNeededFromDemandData } from "./charts/NumChargersNeededChart";
import { getChargerInvestmentRequiredFromNumChargersNeeded } from "./charts/ChargerInvestmentRequiredChart";

type DataRow = {
  year: number;
  "Vehicle Class": string;
  "EV Fraction of Sales": number;
  "EV Saturation Fraction": number;
  "Number of EVs": number;
  "Total Daily Charging Demand kWh": number;
  "Daily Home Demand kWh": number;
  "Daily Workplace Demand kWh": number;
  "Daily Public Demand kWh": number;
  "Number of Home L2 Chargers Needed": number;
  "Number of Workplace L2 Chargers Needed": number;
  "Number of Workplace DC Fast Chargers Needed": number;
  "Number of Public DC Fast Chargers Needed": number;
  "Workplace L2 Charger Investment Needed (USD)": number;
  "Workplace DC Fast Charger Investment Needed (USD)": number;
  "Public DC Fast Charger Investment Needed (USD)": number;
  "Number of Remaining ICE Vehicles": number;
};

export function download(
  filename: string,
  growthScenario: GrowthScenario,
  chartControlValues: ChartControlValues
) {
  const formattedData: DataRow[] = [];
  growthScenario?.vehicleClasses.forEach((vehicleClass) => {
    vehicleClass.annualData?.forEach((annualDatum) => {
      let totalDailyChargingDemandKwh = 0;
      let dailyHomeDemandKwh = 0;
      let dailyWorkplaceDemandKwh = 0;
      let dailyPublicDemandKwh = 0;
      let numL2HomeChargersNeeded = 0;
      let numL2WorkplaceChargersNeeded = 0;
      let numDcfcWorkplaceChargersNeeded = 0;
      let numDcfcPublicChargersNeeded = 0;
      let workplaceL2Investment = 0;
      let workplaceDcfcInvestment = 0;
      let publicDcfcInvestment = 0;

      if (isLightDutyVehicleClass(vehicleClass)) {
        const demandData = getLdvTotalDailyDemandFromNumEvs(annualDatum.numEvs);
        const numChargers = getNumChargersNeededFromDemandData(
          demandData,
          chartControlValues.workplaceFractionServedByDcfc
        );
        const chargerInvestment =
          getChargerInvestmentRequiredFromNumChargersNeeded(
            numChargers,
            chartControlValues.pricePerLevel2Charger,
            chartControlValues.pricePerDcFastCharger
          );

        dailyHomeDemandKwh = demandData.dailyHomeDemandKwh;
        dailyWorkplaceDemandKwh = demandData.dailyWorkplaceDemandKwh;
        dailyPublicDemandKwh = demandData.dailyPublicDemandKwh;
        totalDailyChargingDemandKwh =
          dailyHomeDemandKwh + dailyWorkplaceDemandKwh + dailyPublicDemandKwh;

        numL2HomeChargersNeeded = numChargers.numL2HomeChargersNeeded;
        numL2WorkplaceChargersNeeded = numChargers.numL2WorkplaceChargersNeeded;
        numDcfcWorkplaceChargersNeeded =
          numChargers.numDcfcWorkplaceChargersNeeded;
        numDcfcPublicChargersNeeded = numChargers.numDcfcPublicChargersNeeded;

        workplaceL2Investment = chargerInvestment.workplaceL2Investment;
        workplaceDcfcInvestment = chargerInvestment.workplaceDcfcInvestment;
        publicDcfcInvestment = chargerInvestment.publicDcfcInvestment;
      } else {
        totalDailyChargingDemandKwh = getDailyTotalMhdDemandKwhForVehicleClass(
          annualDatum.numEvs,
          vehicleClass.name
        );
      }

      const formatted = {
        year: annualDatum.year,
        "Vehicle Class": vehicleClass.name,
        "EV Fraction of Sales": annualDatum.evFractionOfSales,
        "EV Saturation Fraction": annualDatum.evFractionOfAllVehicles,
        "Number of EVs": annualDatum.numEvs,
        "Total Daily Charging Demand kWh": totalDailyChargingDemandKwh,
        "Daily Home Demand kWh": dailyHomeDemandKwh,
        "Daily Workplace Demand kWh": dailyWorkplaceDemandKwh,
        "Daily Public Demand kWh": dailyPublicDemandKwh,
        "Number of Home L2 Chargers Needed": numL2HomeChargersNeeded,
        "Number of Workplace L2 Chargers Needed": numL2WorkplaceChargersNeeded,
        "Number of Workplace DC Fast Chargers Needed":
          numDcfcWorkplaceChargersNeeded,
        "Number of Public DC Fast Chargers Needed": numDcfcPublicChargersNeeded,
        "Workplace L2 Charger Investment Needed (USD)": workplaceL2Investment,
        "Workplace DC Fast Charger Investment Needed (USD)":
          workplaceDcfcInvestment,
        "Public DC Fast Charger Investment Needed (USD)": publicDcfcInvestment,
        "Number of Remaining ICE Vehicles": annualDatum.numOfRemainingIce,
        "NOX Emission Per Year (Grams)": annualDatum.emissions.nox,
        "VOC Emission Per Year (Grams)": annualDatum.emissions.voc,
        "PM-10 Emission Per Year (Grams)": annualDatum.emissions.pm10,
        "PM-2.5 Emission Per Year (Grams)": annualDatum.emissions.pm25,
        "SOX Emission Per Year (Grams)": annualDatum.emissions.sox,
        "CO2 Emission Per Year (Kg)": annualDatum.emissions.co2,
      };
      formattedData.push(formatted);
    });
  });
  downloadCsv(formattedData, filename);
}
