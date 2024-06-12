import { Decimal } from "@prisma/client/runtime/library";

import {
  calcCapitalExpenses,
  calcOperationalExpenses,
  CapitalExpenses,
  OperationalExpenses,
} from "./financial/expenses";
import {
  calcFinancialInformation,
  FinancialInformation,
} from "./financial/financial-information";
import {
  calcCostComparisonData,
  CostComparisonTableData,
  transformCostComparisonTableData,
  transformCostComparisonChartData,
  CostComparisonChartData,
} from "./financial/cost-comparison";
import { UtilityRate } from "../utility-rate";

const INVESTMENT_STRATEGY_UPFRONT = "upfront";

// Default financial inputs
export const DEFAULT_FUEL_COST_GROWTH_RATE = 0.05;
export const DEFAULT_DISCOUNT_RATE = 0.04;
export const DEFAULT_PPA_RATE = 0.4;
export const DEFAULT_INVESTMENT_STRATEGY: InvestmentStrategy =
  INVESTMENT_STRATEGY_UPFRONT;

// These constants are specifically for the Port of VA
const WORKING_DAYS_PER_YEAR = 300;

const DOWNTIME_DAYS_PER_VEHICLE_PER_YEAR = 24;
const DRIVER_DOWNTIME_COMP_PER_DAY = 150;
const MAINTENANCE_COST_PER_MILE = 0.23;
const INSURANCE_PER_VEHICLE_PER_YEAR = 20000;
const ASSUMED_MILES_DRIVEN_PER_VEHICLE_PER_YEAR = 50000;
const DRIVER_SALARY_PER_YEAR = 0;

const ICE_FUEL_COST_PER_GALLON = 4.0;
const ICE_DOWNTIME_DAYS_PER_YEAR = 78;
const ICE_MAINTENANCE_COST_PER_MILE = 0.44;
const AVG_MILES_PER_GALLON_STRAIGHT_TRUCK = 6.5;
const ICE_REPLACEMENT_LIFECYCLE_YEARS = 8;
export const DEFAULT_VEHICLE_MAINTENANCE_COST_PERCENTAGE = 0.05;
export const DEFAULT_CHARGER_MAINTENANCE_COST_PERCENTAGE = 0.05;
export const DEFAULT_VEHICLE_REPLACEMENT_LIFECYCLE_YEARS = 12;
export const DEFAULT_BATTERY_REPLACEMENT_LIFECYCLE_YEARS = 6;
export const DEFAULT_CHARGER_REPLACEMENT_LIFECYCLE_YEARS = 12;

// https://electrotempo.atlassian.net/browse/CORE-3195
const BATTERY_PRICE_PER_KWH_BY_YEAR = {
  2023: 139,
  2024: 126,
  2025: 113,
  2026: 107,
  2027: 100,
  2028: 93,
  2029: 85,
  2030: 80,
  2031: 77,
  2032: 75,
  2033: 73,
  2034: 72,
  2035: 72,
  2036: 71,
  2037: 70,
  2038: 69,
  2039: 69,
  2040: 68,
  2041: 68,
  2042: 67,
  2043: 67,
  2044: 66,
  2045: 66,
  2046: 65,
  2047: 65,
  2048: 65,
  2049: 64,
  2050: 64,
};

export type InvestmentStrategy = "upfront" | "uniform";

interface EnergyDemandDatapoint {
  id: number;
  energyDemandKwh: Decimal;
  powerDemandKw: Decimal;
}

export interface FinancialData {
  financialControls: FinancialControls;
  capitalExpenses: CapitalExpenses;
  operationalExpenses: OperationalExpenses;
  financialInformation: FinancialInformation;
  costComparisonData: CostComparisonChartData;
  costComparisonTableData: CostComparisonTableData;
  maxEnergyDemand: MaxEnergyDemand;
  assumptionParameters: AssumptionParameters;
}

export interface FinancialCalculationInputs {
  planningHorizonYears: number;
  numVehicles: number;
  numICEVehicles: number;
  shiftSchedule: number[];
  vehiclesPerShift: number;
  iceReferenceCostUsd: number;
  iceFuelConsumption: number;
  iceDowntimePct: number;
  evDowntimePct: number;
  evReserve: number;
  numChargers: number;
  chargerChargeRateKw: number;
  chargerPrice: number;
  vehiclePrice: number;
  vehicleBatteryCapacityKwh: number;
  vehicleBatteryMaxChargeRateKw: number;
  vehicleMaintenanceCostPct: number;
  chargerMaintenanceCostPct: number;
  batteryReplacementLifecycleYears: number;
  chargerReplacementLifecycleYears: number;
  vehicleReplacementLifecycleYears: number;
  energyDemandDatapoints: EnergyDemandDatapoint[];
  utilityRate: UtilityRate;
}

export interface FinancialControls {
  planningStartYear: number;
  planningHorizonYears: number;
  fuelCostGrowthRate: number;
  discountRate: number;
  ppaRate: number;
  investmentStrategy: InvestmentStrategy;
  chargerCost: number;
  vehicleCost: number;
  initInstallationCost: number;
}

export const calcFinancialData = async (
  financialCalculationInputs: FinancialCalculationInputs,
  planningHorizonYears: number,
  planningStartYear?: number,
  fuelCostGrowthRate?: number,
  discountRate?: number,
  ppaRate?: number,
  investmentStrategy?: InvestmentStrategy,
  chargerCost?: number,
  vehicleCost?: number,
  initInstallationCost?: number
): Promise<FinancialData> => {
  const {
    numVehicles,
    numChargers,
    evReserve,
    chargerChargeRateKw,
    vehicleMaintenanceCostPct,
    vehicleReplacementLifecycleYears,
    batteryReplacementLifecycleYears,
    chargerReplacementLifecycleYears,
    energyDemandDatapoints,
    utilityRate,
  } = financialCalculationInputs;

  const financialControls: FinancialControls = {
    planningStartYear: planningStartYear ?? new Date().getFullYear(),
    planningHorizonYears: planningHorizonYears,
    fuelCostGrowthRate: fuelCostGrowthRate ?? DEFAULT_FUEL_COST_GROWTH_RATE,
    discountRate: discountRate ?? DEFAULT_DISCOUNT_RATE,
    ppaRate: ppaRate ?? DEFAULT_PPA_RATE,
    investmentStrategy: investmentStrategy ?? DEFAULT_INVESTMENT_STRATEGY,
    chargerCost: chargerCost ?? financialCalculationInputs.chargerPrice,
    vehicleCost: vehicleCost ?? financialCalculationInputs.vehiclePrice,
    initInstallationCost:
      initInstallationCost ??
      calcInstallationCost(numChargers, chargerChargeRateKw),
  };

  const maxEnergyDemandPerDay = calcMaxEnergyDemandPerDay(
    energyDemandDatapoints
  );
  const energyCostPerYear = calcEnergyCostPerYear(
    utilityRate,
    financialControls.ppaRate,
    maxEnergyDemandPerDay.energyUsageKwh,
    maxEnergyDemandPerDay.peakDemandKw
  );

  // Optimal number of vehicles returned from optimization includes number of EVs reserved
  const numOperatingVehicles = numVehicles - evReserve;

  const assumptionParameters = getAssumptionParameters(utilityRate);

  const capitalExpenses = calcCapitalExpenses(
    financialCalculationInputs,
    financialControls,
    numVehicles,
    numChargers,
    vehicleReplacementLifecycleYears,
    batteryReplacementLifecycleYears,
    chargerReplacementLifecycleYears,
    financialControls.vehicleCost,
    financialControls.chargerCost,
    financialControls.initInstallationCost
  );

  const operationalExpenses = calcOperationalExpenses(
    financialCalculationInputs,
    financialControls,
    assumptionParameters,
    capitalExpenses,
    numOperatingVehicles,
    vehicleMaintenanceCostPct,
    energyCostPerYear
  );

  const financialInformation = calcFinancialInformation(
    financialControls,
    capitalExpenses,
    operationalExpenses
  );

  const costComparisonData = calcCostComparisonData(
    financialCalculationInputs,
    financialControls,
    assumptionParameters,
    capitalExpenses,
    operationalExpenses,
    maxEnergyDemandPerDay.energyUsageKwh
  );
  const costComparisonDataChartData =
    transformCostComparisonChartData(costComparisonData);
  const costComparisonTableData =
    transformCostComparisonTableData(costComparisonData);

  const maxEnergyDemandPerYear = { ...maxEnergyDemandPerDay };
  maxEnergyDemandPerYear.energyUsageKwh =
    maxEnergyDemandPerYear.energyUsageKwh * WORKING_DAYS_PER_YEAR;

  return {
    financialControls,
    capitalExpenses,
    operationalExpenses,
    financialInformation,
    costComparisonData: costComparisonDataChartData,
    costComparisonTableData,
    maxEnergyDemand: maxEnergyDemandPerYear,
    assumptionParameters,
  };
};

/**
 * Returns the yearly cost of energy consumption based on:
 * - a user-defined power purchase agreement % (ppaRate)
 * @param utilityRate
 * @param ppaRate
 * @param energyUsageKwhPerDay
 * @param peakDemandKwPerDay
 * @returns the yearly cost of energy consumption
 */
export const calcEnergyCostPerYear = (
  utilityRate: UtilityRate,
  ppaRate: number,
  energyUsageKwhPerDay: number,
  peakDemandKwPerMonth: number
): number => {
  const {
    peakDemandChargePricePerKw,
    ppaPeakDemandChargePricePerKw,
    distributionDemandChargePricePerKw,
    ppaGenerationChargePricePerKwh,
    generationChargePricePerKwh,
    transmissionChargePricePerKwh,
    transmissionUsageKwh,
  } = utilityRate;

  const utilityEnergyUsage =
    energyUsageKwhPerDay * (1 - ppaRate) * WORKING_DAYS_PER_YEAR;
  const utilityPeakDemand = peakDemandKwPerMonth * (1 - ppaRate) * 12;
  const ppaEnergyUsage = energyUsageKwhPerDay * ppaRate * WORKING_DAYS_PER_YEAR;
  const ppaPeakDemand = peakDemandKwPerMonth * ppaRate * 12;

  const utilityGenerationUsageCost =
    utilityEnergyUsage * generationChargePricePerKwh;
  const utilityGenerationDemandCost =
    utilityPeakDemand * peakDemandChargePricePerKw;
  const utilityGenerationCost =
    utilityGenerationUsageCost + utilityGenerationDemandCost;
  const utilityDistributionCost =
    (utilityPeakDemand + ppaPeakDemand) * distributionDemandChargePricePerKw;
  const utilityTransmissionCost =
    transmissionUsageKwh * transmissionChargePricePerKwh;

  const ppaGenerationUsageCost =
    ppaEnergyUsage * ppaGenerationChargePricePerKwh;
  const ppaGenerationDemandCost = ppaPeakDemand * ppaPeakDemandChargePricePerKw;
  const ppaGenerationCost = ppaGenerationUsageCost + ppaGenerationDemandCost;

  const energyCostPerYear =
    utilityGenerationCost +
    utilityDistributionCost +
    utilityTransmissionCost +
    ppaGenerationCost;

  return energyCostPerYear;
};

type MaxEnergyDemand = {
  energyUsageKwh: number;
  peakDemandKw: number;
};

const calcMaxEnergyDemandPerDay = (
  energyDemandDatapoints: EnergyDemandDatapoint[]
): MaxEnergyDemand => {
  const maxEnergyDemand = energyDemandDatapoints.reduce(
    (
      maxEnergyDemand: MaxEnergyDemand,
      energyDemandDatapoint: EnergyDemandDatapoint
    ) => {
      maxEnergyDemand.energyUsageKwh += Number(
        energyDemandDatapoint.energyDemandKwh
      );
      maxEnergyDemand.peakDemandKw = Math.max(
        maxEnergyDemand.peakDemandKw,
        Number(energyDemandDatapoint.powerDemandKw)
      );
      return maxEnergyDemand;
    },
    {
      energyUsageKwh: 0,
      peakDemandKw: 0,
    }
  );

  return maxEnergyDemand;
};

/**
 * Returns the cost of installing all chargers at a terminal
 * @param numChargers
 * @param chargeRateKw
 * @returns the cost of installing all chargers at a terminal
 */
export const calcInstallationCost = (
  numChargers: number,
  chargeRateKw: number
): number => {
  if (!numChargers) return 0;

  // constants below pulled from https://doi.org/10.1177/03611981221095750
  const c1 = 0.0066;
  const c2 = 48.43;
  const c3 = 9788.5;
  const installationCost =
    c1 * (numChargers * chargeRateKw) ** 2 +
    c2 * (numChargers * chargeRateKw) +
    c3;
  return Math.round(installationCost);
};

export const getBatteryPricePerKwhByYear = (year: number): number => {
  let key = year as keyof typeof BATTERY_PRICE_PER_KWH_BY_YEAR;

  if (!BATTERY_PRICE_PER_KWH_BY_YEAR[key]) {
    const availableYears = Object.keys(BATTERY_PRICE_PER_KWH_BY_YEAR);
    const minYear = Number(availableYears.shift());
    const maxYear = Number(availableYears.pop());
    key = (
      year < minYear ? minYear : maxYear
    ) as keyof typeof BATTERY_PRICE_PER_KWH_BY_YEAR;
  }

  return BATTERY_PRICE_PER_KWH_BY_YEAR[key];
};

export type AssumptionParameters = {
  workingDaysPerYear: number;
  downtimeDaysPerVehiclePerYear: number;
  driverDowntimeCompPerDay: number;
  maintenanceCostPerMile: number;
  insurancePerVehiclePerYear: number;
  assumedMilesDrivenPerVehiclePerYear: number;
  driverSalaryPerYear: number;
  iceFuelCostPerGallon: number;
  iceDowntimeDaysPerYear: number;
  iceMaintenanceCostPerMile: number;
  avgMilesPerGallonStraightTruck: number;
  iceReplacementLifecycleYears: number;
  batteryPricePerKwhByYear: { [year: string]: number };
  utilityRateStructure: UtilityRate;
};

export const getAssumptionParameters = (
  utilityRate: UtilityRate
): AssumptionParameters => {
  return {
    workingDaysPerYear: WORKING_DAYS_PER_YEAR,
    downtimeDaysPerVehiclePerYear: DOWNTIME_DAYS_PER_VEHICLE_PER_YEAR,
    driverDowntimeCompPerDay: DRIVER_DOWNTIME_COMP_PER_DAY,
    maintenanceCostPerMile: MAINTENANCE_COST_PER_MILE,
    insurancePerVehiclePerYear: INSURANCE_PER_VEHICLE_PER_YEAR,
    assumedMilesDrivenPerVehiclePerYear:
      ASSUMED_MILES_DRIVEN_PER_VEHICLE_PER_YEAR,
    driverSalaryPerYear: DRIVER_SALARY_PER_YEAR,
    iceFuelCostPerGallon: ICE_FUEL_COST_PER_GALLON,
    iceDowntimeDaysPerYear: ICE_DOWNTIME_DAYS_PER_YEAR,
    iceMaintenanceCostPerMile: ICE_MAINTENANCE_COST_PER_MILE,
    avgMilesPerGallonStraightTruck: AVG_MILES_PER_GALLON_STRAIGHT_TRUCK,
    iceReplacementLifecycleYears: ICE_REPLACEMENT_LIFECYCLE_YEARS,
    batteryPricePerKwhByYear: BATTERY_PRICE_PER_KWH_BY_YEAR,
    utilityRateStructure: utilityRate,
  };
};
