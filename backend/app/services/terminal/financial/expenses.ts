import {
  AssumptionParameters,
  FinancialCalculationInputs,
  FinancialControls,
  InvestmentStrategy,
  calcInstallationCost,
  getBatteryPricePerKwhByYear,
} from "../financial.service";

export interface TotalExpenses {
  totalCapitalExpenses: TotalCapitalExpenses;
  totalOperationalExpenses: TotalOperationalExpenses;
  totalExpenses: number;
  totalExpensesNPV: number;
}

export const calcTotalExpenses = (
  capitalExpenses: CapitalExpenses,
  operationalExpenses: OperationalExpenses,
  years: number
): TotalExpenses => {
  const totalCapitalExpenses = calcTotalCapitalExpenses(capitalExpenses, years);
  const totalOperationalExpenses = calcTotalOperationalExpenses(
    operationalExpenses,
    years
  );

  const totalExpenses =
    totalCapitalExpenses.totalCapitalExpenses +
    totalOperationalExpenses.totalOperationalExpenses;
  const totalExpensesNPV =
    totalCapitalExpenses.totalCapitalExpensesNPV +
    totalOperationalExpenses.totalOperationalExpensesNPV;

  return {
    totalCapitalExpenses,
    totalOperationalExpenses,
    totalExpenses,
    totalExpensesNPV,
  };
};

export interface CapitalExpenses {
  vehicleExpenses: CapitalExpense[];
  batteryExpenses: CapitalExpense[];
  chargerExpenses: CapitalExpense[];
  installationExpenses: CapitalExpense[];
  calculationInputs: CapitalExpenseCalculationInputs;
}

type CapitalExpenseType = "vehicle" | "charger" | "battery" | "installation";

export interface CapitalExpense {
  type: CapitalExpenseType;
  year: number;
  pricePerEach: number;
  numPurchased: number;
  total: number;
  totalNPV: number;
  itemized: boolean;
}

export interface CapitalExpenseCalculationInputs {
  numVehicles: number;
  numChargers: number;
  vehicleReplacementLifecycleYears: number;
  batteryReplacementLifecycleYears: number;
  chargerReplacementLifecycleYears: number;
  vehicleCost: number;
  chargerCost: number;
  initInstallationCost: number;
}

export const calcCapitalExpenses = (
  financialCalculationInputs: FinancialCalculationInputs,
  financialControls: FinancialControls,
  numVehicles: number,
  numChargers: number,
  vehicleReplacementLifecycleYears: number,
  batteryReplacementLifecycleYears: number,
  chargerReplacementLifecycleYears: number,
  vehicleCost: number,
  chargerCost: number,
  initInstallationCost: number
): CapitalExpenses => {
  const { chargerChargeRateKw, vehicleBatteryCapacityKwh } =
    financialCalculationInputs;
  const {
    planningStartYear,
    planningHorizonYears,
    investmentStrategy,
    discountRate,
  } = financialControls;

  const vehicleExpenses: CapitalExpense[] = [];
  const batteryExpenses: CapitalExpense[] = [];
  const chargerExpenses: CapitalExpense[] = [];
  const installationExpenses: CapitalExpense[] = [];

  const vehiclesPurchasedPerYear: number[] = getEquipmentPurchasePlan(
    planningHorizonYears,
    numVehicles,
    investmentStrategy,
    vehicleReplacementLifecycleYears
  );
  const chargersPurchasedPerYear: number[] = getEquipmentPurchasePlan(
    planningHorizonYears,
    numChargers,
    investmentStrategy,
    chargerReplacementLifecycleYears
  );
  const batteriesPurchasedPerYear: number[] = getBatteryPurchasePlan(
    planningHorizonYears,
    batteryReplacementLifecycleYears,
    vehicleReplacementLifecycleYears,
    vehiclesPurchasedPerYear
  );

  for (let i = 0; i < planningHorizonYears; i++) {
    const planningYear = planningStartYear + i;

    // Vehicle Expenses
    const totalVehicleCost = vehicleCost * vehiclesPurchasedPerYear[i];
    vehicleExpenses.push({
      type: "vehicle",
      year: planningYear,
      pricePerEach: vehicleCost,
      numPurchased: vehiclesPurchasedPerYear[i],
      total: totalVehicleCost,
      totalNPV: adjustForDiscountAndFuelCostGrowth(
        totalVehicleCost,
        i,
        discountRate,
        0
      ),
      itemized: true,
    });

    // Battery Expenses
    const batteryPricePerKwh = getBatteryPricePerKwhByYear(planningYear);
    const batteryPricePerEach = vehicleBatteryCapacityKwh * batteryPricePerKwh;
    const totalBatteryCost = batteryPricePerEach * batteriesPurchasedPerYear[i];
    batteryExpenses.push({
      type: "battery",
      year: planningYear,
      pricePerEach: batteryPricePerEach,
      numPurchased: batteriesPurchasedPerYear[i],
      total: totalBatteryCost,
      totalNPV: adjustForDiscountAndFuelCostGrowth(
        totalBatteryCost,
        i,
        discountRate,
        0
      ),
      itemized: true,
    });

    // Charger Expenses
    const totalChargerCost = chargerCost * chargersPurchasedPerYear[i];
    chargerExpenses.push({
      type: "charger",
      year: planningYear,
      pricePerEach: chargerCost,
      numPurchased: chargersPurchasedPerYear[i],
      total: totalChargerCost,
      totalNPV: adjustForDiscountAndFuelCostGrowth(
        totalChargerCost,
        i,
        discountRate,
        0
      ),
      itemized: true,
    });

    // Installation Expenses
    const installationPricePerEach =
      i === 0
        ? initInstallationCost
        : calcInstallationCost(
            chargersPurchasedPerYear[i],
            chargerChargeRateKw
          );
    const installationNumPurchased = chargersPurchasedPerYear[i] > 0 ? 1 : 0;
    const totalInstallationCost =
      installationPricePerEach * installationNumPurchased;
    installationExpenses.push({
      type: "installation",
      year: planningYear,
      pricePerEach: installationPricePerEach,
      numPurchased: installationNumPurchased,
      total: totalInstallationCost,
      totalNPV: adjustForDiscountAndFuelCostGrowth(
        totalInstallationCost,
        i,
        discountRate,
        0
      ),
      itemized: false,
    });
  }

  return {
    vehicleExpenses,
    batteryExpenses,
    chargerExpenses,
    installationExpenses,
    calculationInputs: {
      numVehicles,
      numChargers,
      vehicleReplacementLifecycleYears,
      batteryReplacementLifecycleYears,
      chargerReplacementLifecycleYears,
      vehicleCost,
      chargerCost,
      initInstallationCost,
    },
  };
};

export interface TotalCapitalExpenses {
  vehicleExpenses: number;
  batteryExpenses: number;
  chargerExpenses: number;
  installationExpenses: number;
  vehicleReplacementExpenses: number;
  chargerReplacementExpenses: number;
  totalCapitalExpenses: number;
  totalCapitalExpensesNPV: number;
}

export const calcTotalCapitalExpenses = (
  capitalExpenses: CapitalExpenses,
  years: number
): TotalCapitalExpenses => {
  const {
    vehicleExpenses,
    batteryExpenses,
    chargerExpenses,
    installationExpenses,
  } = capitalExpenses;

  let totalVehicleExpenses = 0;
  let totalVehicleReplacementExpenses = 0;
  let totalBatteryExpenses = 0;
  let totalChargerExpenses = 0;
  let totalInstallationExpenses = 0;
  let totalChargerReplacementExpenses = 0;
  let totalCapitalExpenses = 0;
  let totalCapitalExpensesNPV = 0;

  for (let i = 0; i < years; i++) {
    totalVehicleExpenses += vehicleExpenses[i].total;
    totalBatteryExpenses += batteryExpenses[i].total;
    totalChargerExpenses += chargerExpenses[i].total;
    totalInstallationExpenses += installationExpenses[i].total;

    if (i > 0) {
      totalVehicleReplacementExpenses += vehicleExpenses[i].total;
      totalChargerReplacementExpenses +=
        chargerExpenses[i].total + installationExpenses[i].total;
    }

    totalCapitalExpenses +=
      vehicleExpenses[i].total +
      batteryExpenses[i].total +
      chargerExpenses[i].total +
      installationExpenses[i].total;
    totalCapitalExpensesNPV +=
      vehicleExpenses[i].totalNPV +
      batteryExpenses[i].totalNPV +
      chargerExpenses[i].totalNPV +
      installationExpenses[i].totalNPV;
  }

  return {
    vehicleExpenses: totalVehicleExpenses,
    batteryExpenses: totalBatteryExpenses,
    chargerExpenses: totalChargerExpenses,
    installationExpenses: totalInstallationExpenses,
    vehicleReplacementExpenses: totalVehicleReplacementExpenses,
    chargerReplacementExpenses: totalChargerReplacementExpenses,
    totalCapitalExpenses,
    totalCapitalExpensesNPV,
  };
};

export interface OperationalExpenses {
  fuelCosts: OperationalExpense[];
  maintenanceCosts: OperationalExpense[];
  driverSalaryCosts: OperationalExpense[];
}

type OperationalExpenseType = "fuel" | "maintenance" | "driver salary";

export interface OperationalExpense {
  type: OperationalExpenseType;
  year: number;
  costUsd: number;
  costNPV: number;
}

export const calcOperationalExpenses = (
  financialCalculationInputs: FinancialCalculationInputs,
  financialControls: FinancialControls,
  assumptionParameters: AssumptionParameters,
  capitalExpenses: CapitalExpenses,
  numOperatingVehicles: number,
  vehicleMaintenanceCostPct: number,
  fuelCostPerYear: number
): OperationalExpenses => {
  const { vehiclesPerShift, chargerMaintenanceCostPct } =
    financialCalculationInputs;
  const {
    planningStartYear,
    planningHorizonYears,
    fuelCostGrowthRate,
    discountRate,
  } = financialControls;
  const { vehicleExpenses, chargerExpenses } = capitalExpenses;
  const { driverSalaryPerYear } = assumptionParameters;

  const vehicleCost = vehicleExpenses[0].pricePerEach;
  const chargerCost = chargerExpenses[0].pricePerEach;
  const numChargers = chargerExpenses[0].numPurchased;

  const fuelCosts: OperationalExpense[] = [];
  const maintenanceCosts: OperationalExpense[] = [];
  const driverSalaryCosts: OperationalExpense[] = [];

  for (let i = 0; i < planningHorizonYears; i++) {
    const planningYear = planningStartYear + i;

    fuelCosts.push({
      type: "fuel",
      year: planningYear,
      costUsd: adjustForDiscountAndFuelCostGrowth(
        fuelCostPerYear,
        i,
        0,
        fuelCostGrowthRate
      ),
      costNPV: adjustForDiscountAndFuelCostGrowth(
        fuelCostPerYear,
        i,
        discountRate,
        fuelCostGrowthRate
      ),
    });

    const vehicleMaintenanceCost =
      vehicleCost * vehicleMaintenanceCostPct * numOperatingVehicles;
    const chargerMaintenanceCost =
      chargerCost * chargerMaintenanceCostPct * numChargers;
    const maintenanceCost = vehicleMaintenanceCost + chargerMaintenanceCost;
    maintenanceCosts.push({
      type: "maintenance",
      year: planningYear,
      costUsd: maintenanceCost,
      costNPV: adjustForDiscountAndFuelCostGrowth(
        maintenanceCost,
        i,
        discountRate,
        0
      ),
    });

    const driverSalaryCost = driverSalaryPerYear * vehiclesPerShift;
    driverSalaryCosts.push({
      type: "driver salary",
      year: planningYear,
      costUsd: driverSalaryCost,
      costNPV: adjustForDiscountAndFuelCostGrowth(
        driverSalaryCost,
        i,
        discountRate,
        0
      ),
    });
  }

  return {
    fuelCosts,
    maintenanceCosts,
    driverSalaryCosts,
  };
};

export interface TotalOperationalExpenses {
  fuelCosts: number;
  maintenanceCosts: number;
  driverSalaryCosts: number;
  totalFuelAndMaintenanceCosts: number;
  totalFuelAndMaintenanceCostsNPV: number;
  totalOperationalExpenses: number;
  totalOperationalExpensesNPV: number;
}

export const calcTotalOperationalExpenses = (
  operationalExpenses: OperationalExpenses,
  years: number
): TotalOperationalExpenses => {
  const { fuelCosts, maintenanceCosts, driverSalaryCosts } =
    operationalExpenses;

  let totalFuelCosts = 0;
  let totalMaintenanceCosts = 0;
  let totalDriverSalaryCosts = 0;
  let totalFuelAndMaintenanceCosts = 0;
  let totalFuelAndMaintenanceCostsNPV = 0;
  let totalOperationalExpenses = 0;
  let totalOperationalExpensesNPV = 0;

  for (let i = 0; i < years; i++) {
    totalFuelCosts += fuelCosts[i].costUsd;
    totalMaintenanceCosts += maintenanceCosts[i].costUsd;
    totalDriverSalaryCosts += driverSalaryCosts[i].costUsd;

    totalFuelAndMaintenanceCosts +=
      fuelCosts[i].costUsd + maintenanceCosts[i].costUsd;
    totalFuelAndMaintenanceCostsNPV +=
      fuelCosts[i].costNPV + maintenanceCosts[i].costNPV;

    totalOperationalExpenses +=
      fuelCosts[i].costUsd +
      maintenanceCosts[i].costUsd +
      driverSalaryCosts[i].costUsd;
    totalOperationalExpensesNPV +=
      fuelCosts[i].costNPV +
      maintenanceCosts[i].costNPV +
      driverSalaryCosts[i].costNPV;
  }

  return {
    fuelCosts: totalFuelCosts,
    maintenanceCosts: totalMaintenanceCosts,
    driverSalaryCosts: totalDriverSalaryCosts,
    totalFuelAndMaintenanceCosts,
    totalFuelAndMaintenanceCostsNPV,
    totalOperationalExpenses,
    totalOperationalExpensesNPV,
  };
};

/**
 * Returns the value adjusted for inflation and utility growth
 * @param value the value to adjust
 * @param deltaYear the number of years since planningStartYear to use as the exponent
 * @param discountRate the inflation rate year-over-year
 * @param fuelCostGrowthRate the fuel cost growth rate year-over-year
 * @returns the value adjusted for inflation and utility growth
 */
export const adjustForDiscountAndFuelCostGrowth = (
  value: number,
  deltaYear: number,
  discountRate: number,
  fuelCostGrowthRate: number
): number => {
  let adjustedValue = value;
  if (deltaYear > 0) {
    adjustedValue =
      (value * (1 + fuelCostGrowthRate) ** deltaYear) /
      (1 + discountRate) ** deltaYear;
  }
  return Number(adjustedValue.toFixed(2));
};

const getEquipmentPurchasePlan = (
  planningHorizonYears: number,
  numEquipment: number,
  investmentStrategy: InvestmentStrategy,
  replacementLifecycleYears: number
): number[] => {
  let equipmentPurchasedPerYear: number[] = [];
  switch (investmentStrategy) {
    case "upfront":
      equipmentPurchasedPerYear = getEquipmentPurchasePlanUpfront(
        planningHorizonYears,
        numEquipment,
        replacementLifecycleYears
      );
      break;
    case "uniform":
      equipmentPurchasedPerYear = getEquipmentPurchasePlanUniform(
        planningHorizonYears,
        numEquipment
      );
      break;
    default:
      throw new Error("strategy must be 'uniform' or 'upfront'");
  }
  return equipmentPurchasedPerYear;
};

const getEquipmentPurchasePlanUniform = (
  planningHorizonYears: number,
  numEquipment: number
): number[] => {
  if (planningHorizonYears < 1) {
    throw new Error("planningHorizonYears must be greater than 0");
  }
  if (numEquipment < 0) {
    throw new Error("numEquipment must be greater than or equal to 0");
  }
  const equipmentPurchasedPerYear: number[] = [];
  const equipmentPerYear = Math.floor(numEquipment / planningHorizonYears);
  const residualEquipment = numEquipment % planningHorizonYears;
  for (let i = 0; i < planningHorizonYears; i++) {
    equipmentPurchasedPerYear.push(equipmentPerYear);
  }
  for (let i = 0; i < residualEquipment; i++) {
    equipmentPurchasedPerYear[i] += 1;
  }
  return equipmentPurchasedPerYear;
};

/**
 * Returns an array of length planningHorizonYears with the first element equal to numEquipment and the remaining elements equal to 0.
 * @param planningHorizonYears number of years to plan for
 * @param numEquipment number of equipment to purchase
 * @param replacementLifecycleYears
 * @returns an array of length planningHorizonYears with the first element equal to numEquipment and the remaining elements equal to 0
 */
const getEquipmentPurchasePlanUpfront = (
  planningHorizonYears: number,
  numEquipment: number,
  replacementLifecycleYears: number
): number[] => {
  if (planningHorizonYears < 1) {
    throw new Error("planningHorizonYears must be greater than 0");
  }
  if (numEquipment < 0) {
    throw new Error("numEquipment must be greater than or equal to 0");
  }
  const equipmentPurchasedPerYear: number[] = [];
  equipmentPurchasedPerYear.push(numEquipment);
  for (let i = 1; i < planningHorizonYears; i++) {
    if (replacementLifecycleYears > 0 && i % replacementLifecycleYears === 0) {
      equipmentPurchasedPerYear.push(numEquipment);
    } else {
      equipmentPurchasedPerYear.push(0);
    }
  }
  return equipmentPurchasedPerYear;
};

const getBatteryPurchasePlan = (
  planningHorizonYears: number,
  batteryReplacementCycleYears: number,
  vehicleReplacementCycleYears: number,
  vehiclesPurchasedPerYear: number[]
): number[] => {
  if (batteryReplacementCycleYears <= 0) {
    return Array.from({ length: planningHorizonYears }, () => 0);
  }

  const batteriesPurchasedPerYear: number[] = [];
  for (let i = 0; i < planningHorizonYears; i++) {
    batteriesPurchasedPerYear[i] = batteriesPurchasedPerYear[i] ?? 0;

    if (vehiclesPurchasedPerYear[i] > 0) {
      // If vehicles are being replaced then we don't need to replace batteries for those vehicles
      batteriesPurchasedPerYear[i] = Math.max(
        batteriesPurchasedPerYear[i] - vehiclesPurchasedPerYear[i],
        0
      );

      const vehicleReplacementYear =
        vehicleReplacementCycleYears > 0
          ? i + vehicleReplacementCycleYears
          : planningHorizonYears;

      // Populate battery replacement years until the next vehicle replacement or end of planning horizon years
      let batteryPurchaseYear = i + batteryReplacementCycleYears;
      while (
        batteryPurchaseYear < planningHorizonYears &&
        batteryPurchaseYear < vehicleReplacementYear
      ) {
        batteriesPurchasedPerYear[batteryPurchaseYear] =
          vehiclesPurchasedPerYear[i];
        batteryPurchaseYear += batteryReplacementCycleYears;
      }
    }
  }

  return batteriesPurchasedPerYear;
};
