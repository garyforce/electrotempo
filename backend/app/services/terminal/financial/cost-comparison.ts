import {
  AssumptionParameters,
  FinancialCalculationInputs,
  FinancialControls,
  calcEnergyCostPerYear,
} from "../financial.service";
import {
  CapitalExpenseCalculationInputs,
  CapitalExpenses,
  OperationalExpenses,
  calcCapitalExpenses,
  calcOperationalExpenses,
  calcTotalExpenses,
} from "./expenses";

export interface CostComparisonData {
  iceSolutionCosts: SolutionCosts;
  evReferenceSolutionCosts: SolutionCosts;
  evOptimizedSolutionCosts: SolutionCosts;
}

export const calcCostComparisonData = (
  financialCalculationInputs: FinancialCalculationInputs,
  financialControls: FinancialControls,
  assumptionParameters: AssumptionParameters,
  capitalExpenses: CapitalExpenses,
  operationalExpenses: OperationalExpenses,
  energyUsageKwhPerDay: number
): CostComparisonData => {
  const evOptimizedSolutionCosts = getSolutionCosts(
    financialControls.planningHorizonYears,
    capitalExpenses,
    operationalExpenses
  );

  const evReferenceSolutionCosts = calcEVReferenceSolutionCosts(
    financialCalculationInputs,
    financialControls,
    assumptionParameters,
    energyUsageKwhPerDay
  );

  const iceSolutionCosts = calcICESolutionCosts(
    financialCalculationInputs,
    financialControls,
    assumptionParameters
  );

  return {
    iceSolutionCosts,
    evReferenceSolutionCosts,
    evOptimizedSolutionCosts,
  };
};

const calcEVReferenceSolutionCosts = (
  financialCalculationInputs: FinancialCalculationInputs,
  financialControls: FinancialControls,
  assumptionParameters: AssumptionParameters,
  energyUsageKwhPerDay: number
): SolutionCosts => {
  const {
    numVehicles,
    numChargers,
    vehiclesPerShift,
    vehicleMaintenanceCostPct,
    vehicleReplacementLifecycleYears,
    batteryReplacementLifecycleYears,
    chargerReplacementLifecycleYears,
    vehicleBatteryMaxChargeRateKw,
    chargerChargeRateKw,
    evDowntimePct,
  } = financialCalculationInputs;
  const {
    planningHorizonYears,
    vehicleCost,
    chargerCost,
    initInstallationCost,
  } = financialControls;
  const { utilityRateStructure } = assumptionParameters;

  const numOperatingVehicles = Math.max(numVehicles, vehiclesPerShift * 2);
  const evReserve = Math.ceil(
    numOperatingVehicles * (evDowntimePct / (1 - evDowntimePct))
  );
  const numVehiclesToPurchase = numOperatingVehicles + evReserve;
  const numChargersToPurchase = Math.max(numChargers, vehiclesPerShift);

  const peakDemandKwPerDay =
    Math.min(vehicleBatteryMaxChargeRateKw, chargerChargeRateKw) *
    vehiclesPerShift;
  const energyCostPerYear = calcEnergyCostPerYear(
    utilityRateStructure,
    financialControls.ppaRate,
    energyUsageKwhPerDay,
    peakDemandKwPerDay
  );

  const capitalExpenses = calcCapitalExpenses(
    financialCalculationInputs,
    financialControls,
    numVehiclesToPurchase,
    numChargersToPurchase,
    vehicleReplacementLifecycleYears,
    batteryReplacementLifecycleYears,
    chargerReplacementLifecycleYears,
    vehicleCost,
    chargerCost,
    initInstallationCost
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

  return getSolutionCosts(
    planningHorizonYears,
    capitalExpenses,
    operationalExpenses
  );
};

const calcICESolutionCosts = (
  financialCalculationInputs: FinancialCalculationInputs,
  financialControls: FinancialControls,
  assumptionParameters: AssumptionParameters
): SolutionCosts => {
  const {
    numICEVehicles,
    vehiclesPerShift,
    shiftSchedule,
    iceReferenceCostUsd,
    iceFuelConsumption,
    vehicleMaintenanceCostPct,
    vehicleReplacementLifecycleYears,
  } = financialCalculationInputs;
  const { planningHorizonYears } = financialControls;
  const {
    iceReplacementLifecycleYears,
    iceFuelCostPerGallon,
    workingDaysPerYear,
  } = assumptionParameters;

  const iceMaintenanceCostPct = vehicleMaintenanceCostPct * 2;

  // Only apply replacement when replacement was also applied to EVs
  const replacementLifecycleYears = vehicleReplacementLifecycleYears > 0
    ? iceReplacementLifecycleYears
    : 0;

  const capitalExpenses = calcCapitalExpenses(
    financialCalculationInputs,
    financialControls,
    numICEVehicles,
    0,
    replacementLifecycleYears,
    0,
    0,
    iceReferenceCostUsd,
    0,
    0
  );

  const shiftHoursPerDay = shiftSchedule.reduce(
    (shiftHours: number, shiftScheduleHour: number) => {
      shiftHours += shiftScheduleHour === 1 ? 1 : 0;
      return shiftHours;
    },
    0
  );

  const iceFuelCostsPerYear =
    iceFuelConsumption *
    shiftHoursPerDay *
    iceFuelCostPerGallon *
    vehiclesPerShift *
    workingDaysPerYear;

  const operationalExpenses = calcOperationalExpenses(
    financialCalculationInputs,
    financialControls,
    assumptionParameters,
    capitalExpenses,
    numICEVehicles,
    iceMaintenanceCostPct,
    iceFuelCostsPerYear
  );

  return getSolutionCosts(
    planningHorizonYears,
    capitalExpenses,
    operationalExpenses
  );
};

interface SolutionCosts {
  vehicleCosts: number;
  batteryCosts: number;
  chargerCosts: number;
  installationCosts: number;
  fuelCosts: number;
  maintenanceCosts: number;
  fuelAndMaintenanceCosts: number;
  totalCapitalExpenses: number;
  totalExpenses: number;
  vehicleReplacementCosts: number;
  chargerReplacementCosts: number;
  totalExpensesNPV: number;
  calculationInputs: CapitalExpenseCalculationInputs;
}

const getSolutionCosts = (
  planningHorizonYears: number,
  capitalExpenses: CapitalExpenses,
  operationalExpenses: OperationalExpenses
): SolutionCosts => {
  const totalExpenses = calcTotalExpenses(
    capitalExpenses,
    operationalExpenses,
    planningHorizonYears
  );

  const { totalCapitalExpenses, totalOperationalExpenses } = totalExpenses;

  const totalExpensesExcludeDriverSalary =
    totalCapitalExpenses.totalCapitalExpenses +
    totalOperationalExpenses.totalFuelAndMaintenanceCosts;
  const totalExpensesExcludeDriverSalaryNPV =
    totalCapitalExpenses.totalCapitalExpensesNPV +
    totalOperationalExpenses.totalFuelAndMaintenanceCostsNPV;

  return {
    vehicleCosts: totalCapitalExpenses.vehicleExpenses,
    batteryCosts: totalCapitalExpenses.batteryExpenses,
    chargerCosts:
      totalCapitalExpenses.chargerExpenses +
      totalCapitalExpenses.installationExpenses,
    installationCosts: totalCapitalExpenses.installationExpenses,
    fuelCosts: totalOperationalExpenses.fuelCosts,
    maintenanceCosts: totalOperationalExpenses.maintenanceCosts,
    totalCapitalExpenses: totalCapitalExpenses.totalCapitalExpenses,
    fuelAndMaintenanceCosts:
      totalOperationalExpenses.totalFuelAndMaintenanceCosts,
    totalExpenses: totalExpensesExcludeDriverSalary,
    vehicleReplacementCosts: totalCapitalExpenses.vehicleReplacementExpenses,
    chargerReplacementCosts: totalCapitalExpenses.chargerReplacementExpenses,
    totalExpensesNPV: totalExpensesExcludeDriverSalaryNPV,
    calculationInputs: capitalExpenses.calculationInputs,
  };
};

export interface CostComparisonChartData {
  chargerCostsData: number[];
  vehicleCostsData: number[];
  batteryCostsData: number[];
  iceOnlyCostsData: number[];
  fuelAndMaintenanceCostsData: number[];
  evOpportunityChargingCostsData: number[];
  evOptimizedChargingCostsData: number[];
}

export const transformCostComparisonChartData = (
  costComparisonData: CostComparisonData
): CostComparisonChartData => {
  const {
    iceSolutionCosts,
    evReferenceSolutionCosts,
    evOptimizedSolutionCosts,
  } = costComparisonData;

  return {
    chargerCostsData: [
      iceSolutionCosts.chargerCosts,
      evReferenceSolutionCosts.chargerCosts,
      evOptimizedSolutionCosts.chargerCosts,
    ],
    fuelAndMaintenanceCostsData: [
      iceSolutionCosts.fuelAndMaintenanceCosts,
      evReferenceSolutionCosts.fuelAndMaintenanceCosts,
      evOptimizedSolutionCosts.fuelAndMaintenanceCosts,
    ],
    vehicleCostsData: [
      iceSolutionCosts.vehicleCosts,
      evReferenceSolutionCosts.vehicleCosts,
      evOptimizedSolutionCosts.vehicleCosts,
    ],
    batteryCostsData: [
      iceSolutionCosts.batteryCosts,
      evReferenceSolutionCosts.batteryCosts,
      evOptimizedSolutionCosts.batteryCosts,
    ],
    iceOnlyCostsData: [
      iceSolutionCosts.chargerCosts,
      iceSolutionCosts.vehicleCosts,
      iceSolutionCosts.fuelAndMaintenanceCosts,
      iceSolutionCosts.batteryCosts,
    ],
    evOpportunityChargingCostsData: [
      evReferenceSolutionCosts.chargerCosts,
      evReferenceSolutionCosts.vehicleCosts,
      evReferenceSolutionCosts.fuelAndMaintenanceCosts,
      evReferenceSolutionCosts.batteryCosts,
    ],
    evOptimizedChargingCostsData: [
      evOptimizedSolutionCosts.chargerCosts,
      evOptimizedSolutionCosts.vehicleCosts,
      evOptimizedSolutionCosts.fuelAndMaintenanceCosts,
      evOptimizedSolutionCosts.batteryCosts,
    ],
  };
};

type CostComparisonConfigurationType =
  | "ICE Only"
  | "EV - Reference Case"
  | "EV - Optimized Charging";

export type CostComparisonRowData = {
  configurationType: CostComparisonConfigurationType;
  vehicleCount: number;
  vehiclePrice: number;
  totalVehicleCost: number;
  chargerCount: number;
  chargerPrice: number;
  installationCost: number;
  totalChargerCost: number;
  totalCapitalExpenses: number;
  totalOperationalExpenses: number;
  totalExpenses: number;
  vehicleReplacementCost: number;
  batteryReplacementCost: number;
  chargerReplacementCost: number;
  totalExpensesNPV: number;
};

export type CostComparisonTableData = {
  iceOnlyData: CostComparisonRowData;
  evOpportunityChargingData: CostComparisonRowData;
  evOptimizedChargingData: CostComparisonRowData;
};

export const transformCostComparisonTableData = (
  costComparisonData: CostComparisonData
): CostComparisonTableData => {
  const iceOnlyData = transformCostComparisonTableRowData(
    "ICE Only",
    costComparisonData.iceSolutionCosts
  );
  const evOpportunityChargingData = transformCostComparisonTableRowData(
    "EV - Reference Case",
    costComparisonData.evReferenceSolutionCosts
  );
  const evOptimizedChargingData = transformCostComparisonTableRowData(
    "EV - Optimized Charging",
    costComparisonData.evOptimizedSolutionCosts
  );

  return {
    iceOnlyData,
    evOpportunityChargingData,
    evOptimizedChargingData,
  };
};

const transformCostComparisonTableRowData = (
  configurationType: CostComparisonConfigurationType,
  solutionCosts: SolutionCosts
): CostComparisonRowData => {
  const { numVehicles, numChargers, vehicleCost, chargerCost } =
    solutionCosts.calculationInputs;

  return {
    configurationType,
    vehicleCount: numVehicles,
    vehiclePrice: Math.round(vehicleCost),
    totalVehicleCost: Math.round(solutionCosts.vehicleCosts),
    chargerCount: numChargers,
    chargerPrice: Math.round(chargerCost),
    installationCost: Math.round(solutionCosts.installationCosts),
    totalChargerCost: Math.round(solutionCosts.chargerCosts),
    totalCapitalExpenses: Math.round(solutionCosts.totalCapitalExpenses),
    totalOperationalExpenses: Math.round(solutionCosts.fuelAndMaintenanceCosts),
    totalExpenses: Math.round(solutionCosts.totalExpenses),
    vehicleReplacementCost: Math.round(solutionCosts.vehicleReplacementCosts),
    batteryReplacementCost: Math.round(solutionCosts.batteryCosts),
    chargerReplacementCost: Math.round(solutionCosts.chargerReplacementCosts),
    totalExpensesNPV: Math.round(solutionCosts.totalExpensesNPV),
  };
};
