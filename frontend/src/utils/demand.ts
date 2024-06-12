import { VehicleClassAnnualDatum } from "types/vehicle-class";
import { getLdvTotalDailyDemandFromNumEvs } from "dashboard/timeline/charts/LdvTotalDailyDemandChart";
import { isEmptyObject } from "./object";

export function scaleDemandByGrowthScenarioYear(
  vehicleClassAnnualData: VehicleClassAnnualDatum[],
  year: number,
  demand: any,
  demandSum: number,
  demandTypes: string[]
) {
  if (
    !vehicleClassAnnualData ||
    !demand ||
    isEmptyObject(vehicleClassAnnualData) ||
    isEmptyObject(demand)
  )
    return;
  const growthScenarioDatum = vehicleClassAnnualData.find(
    (dataYear: VehicleClassAnnualDatum) => dataYear.year === year
  );

  if (growthScenarioDatum === undefined) {
    throw new TypeError(
      `Growth scenario data for the year ${year} was not found.`
    );
  }

  const { dailyHomeDemandKwh, dailyWorkplaceDemandKwh, dailyPublicDemandKwh } =
    getLdvTotalDailyDemandFromNumEvs(growthScenarioDatum.numEvs);
  let totalDailyDemandKwh = 0;
  if (demandTypes.includes("Home")) {
    totalDailyDemandKwh += dailyHomeDemandKwh;
  }
  if (demandTypes.includes("Office")) {
    totalDailyDemandKwh += dailyWorkplaceDemandKwh;
  }
  if (demandTypes.includes("Public")) {
    totalDailyDemandKwh += dailyPublicDemandKwh;
  }

  const scaledDemand: any = {};
  for (const blockGroup in demand) {
    const demandScaleFactor = Number(totalDailyDemandKwh / demandSum);
    scaledDemand[blockGroup] = demandScaleFactor * demand[blockGroup];
  }
  return scaledDemand;
}
