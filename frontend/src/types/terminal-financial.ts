import { FinancialControlState } from "redux/features/terminal/financialSlice";

export type FinancialControls = FinancialControlState;

export type CapitalExpense = {
  type: string;
  year: number;
  pricePerEach: number;
  numPurchased: number;
  total: number;
  totalNPV: number;
  itemized: boolean;
};

export type OperationalExpense = {
  type: string;
  year: number;
  costUsd: number;
  costNPV: number;
};

export type TotalCapitalExpenses = {
  vehicleExpenses: number;
  batteryExpenses: number;
  chargerExpenses: number;
  installationExpenses: number;
  vehicleReplacementExpenses: number;
  chargerReplacementExpenses: number;
  totalCapitalExpenses: number;
  totalCapitalExpensesNPV: number;
};

export type TotalOperationalExpenses = {
  fuelCosts: number;
  maintenanceCosts: number;
  driverSalaryCosts: number;
  totalOperationalExpenses: number;
  totalOperationalExpensesNPV: number;
};

export type FinancialInformation = {
  totalCapitalExpenses: TotalCapitalExpenses;
  totalOperationalExpenses: TotalOperationalExpenses;
  capitalExpensesY1: TotalCapitalExpenses;
  operationalExpensesY1: TotalOperationalExpenses;
  upfrontTotalCapitalExpenses: TotalCapitalExpenses;
};

export type CostComparisonData = {
  chargerCostsData: number[];
  vehicleCostsData: number[];
  batteryCostsData: number[];
  iceOnlyCostsData: number[];
  fuelAndMaintenanceCostsData: number[];
  evOpportunityChargingCostsData: number[];
  evOptimizedChargingCostsData: number[];
  evOpportunityChargingInstallationCosts: number;
};

export type CostComparisonRowData = {
  configurationType:
    | "ICE Only"
    | "EV - Reference Case"
    | "EV - Optimized Charging";
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

export type MaxEnergyDemand = {
  energyUsageKwh: number;
  peakDemandKw: number;
};

export type UtilityRateStructure = {
  id: number;
  utilityId: number | null;
  name: string;
  peakDemandChargePricePerKw: number;
  ppaPeakDemandChargePricePerKw: number;
  distributionDemandChargePricePerKw: number;
  ppaGenerationChargePricePerKwh: number;
  generationChargePricePerKwh: number;
  transmissionChargePricePerKwh: number;
  transmissionUsageKwh: number;
  distributionChargePricePerKwh: number;
  generationDemandChargePricePerKw: number;
  ppaDistributionChargePricePerKwh: number;
  ppaDistributionDemandChargePricePerKw: number;
  ppaGenerationDemandChargePricePerKw: number;
  ppaTransmissionChargePricePerKwh: number;
  ppaTransmissionDemandChargePricePerKw: number;
  transmissionDemandChargePricePerKw: number;
  totalUsageKwh: number;
};

export type AssumptionParameters = {
  workingDaysPerYear: number;
  downtimeDaysPerVehiclePerYear: number;
  driverDowntimeCompPerDay: number;
  maintenanceCostPerMile: number;
  insurancePerVehiclePerYear: number;
  assumedMilesDrivenPerVehiclePerYear: number;
  driverSalaryPerYear: number;
  maintenanceCostPerVehiclePerYear: number;
  iceFuelCostPerGallon: number;
  iceDowntimeDaysPerYear: number;
  iceMaintenanceCostPerMile: number;
  avgMilesPerGallonStraightTruck: number;
  iceFuelCostsPerYear: number;
  iceMaintenanceCostsPerYear: number;
  iceFuelAndMaintenanceCostsPerYear: number;
  iceReplacementLifecycleYears: number;
  utilityRateStructure: UtilityRateStructure;
};

export type FinancialData = {
  financialControls: FinancialControls;
  capitalExpenses: {
    vehicleExpenses: CapitalExpense[];
    batteryExpenses: CapitalExpense[];
    chargerExpenses: CapitalExpense[];
    installationExpenses: CapitalExpense[];
    calculationInputs: {
      numVehicles: number;
      numChargers: number;
      vehicleReplacementLifecycleYears: number;
      batteryReplacementLifecycleYears: number;
      chargerReplacementLifecycleYears: number;
      vehicleCost: number;
      chargerCost: number;
      initInstallationCost: number;
    };
  };
  operationalExpenses: {
    fuelCosts: OperationalExpense[];
    maintenanceCosts: OperationalExpense[];
    driverSalaryCosts: OperationalExpense[];
  };
  financialInformation: FinancialInformation;
  costComparisonData: CostComparisonData;
  costComparisonTableData: CostComparisonTableData;
  maxEnergyDemand: MaxEnergyDemand;
  assumptionParameters: AssumptionParameters;
};
