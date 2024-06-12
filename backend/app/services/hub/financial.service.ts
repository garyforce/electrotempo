import { PrismaClient } from "@prisma/client";

import { ChargerBaseData } from "./chargers.service";
import { EnergyDemandData } from "./energy-demand.service";

const prisma = new PrismaClient();

export interface FinancialData {
  capital_expenses: {
    charger_costs: number;
    chargers_installation_costs: number;
  };
  operational_costs: {
    energy_cost: number;
    energy_demand_cost: number;
    maintenance_cost: number;
  };
}

export const getFinancialData = async (
  siteId: number,
  utilityRateId: number | null,
  perChargerCost: number,
  chargerChargeRateKw: number,
  chargersData: ChargerBaseData,
  energyDemandData: EnergyDemandData,
  annualAveragePerCharger?: number
): Promise<FinancialData> => {
  const DAYS_IN_MONTH = 30;
  const MONTHS_IN_YEAR = 12;
  const AVERAGE_ANNUAL_MAINTENANCE_COST_PER_CHARGER = 400;

  const { num_assignable_chargers } = chargersData;
  const { energy_supply, power_supply } = energyDemandData;

  const { energy_charge_rate, demand_charge_rate } = utilityRateId
    ? await getUtilityRateById(utilityRateId)
    : await getUtilityRatesForSite(siteId);

  const chargerCost = perChargerCost * num_assignable_chargers;

  const chargersInstallationCost = calcInstallationCost(
    num_assignable_chargers,
    chargerChargeRateKw
  );

  const energyCost =
    energy_supply * energy_charge_rate * DAYS_IN_MONTH * MONTHS_IN_YEAR;
  const energyDemandCost = power_supply * demand_charge_rate * MONTHS_IN_YEAR;

  const maintenanceCost =
    num_assignable_chargers *
    (annualAveragePerCharger ?? AVERAGE_ANNUAL_MAINTENANCE_COST_PER_CHARGER);

  return {
    capital_expenses: {
      charger_costs: chargerCost,
      chargers_installation_costs: chargersInstallationCost,
    },
    operational_costs: {
      energy_cost: energyCost,
      energy_demand_cost: energyDemandCost,
      maintenance_cost: maintenanceCost,
    },
  };
};

const getUtilityRateById = async (
  utilityRateId: number
): Promise<{
  energy_charge_rate: number;
  demand_charge_rate: number;
}> => {
  return await prisma.hubUtilityRate.findUniqueOrThrow({
    where: {
      id: utilityRateId,
    },
    select: {
      energy_charge_rate: true,
      demand_charge_rate: true,
    },
  });
};

const getUtilityRatesForSite = async (
  siteId: number
): Promise<{
  energy_charge_rate: number;
  demand_charge_rate: number;
}> => {
  const DEFAULT_ENERGY_CHARGE_RATE = 0.101;
  const DEFAULT_DEMAND_CHARGE_RATE = 14.5;

  const site = await prisma.hubSite.findUniqueOrThrow({
    where: {
      id: siteId,
      deleted_at: null,
    },
    include: {
      utility_rates: true,
    },
  });

  return {
    energy_charge_rate: site.utility_rates[0]
      ? site.utility_rates[0].energy_charge_rate
      : DEFAULT_ENERGY_CHARGE_RATE,
    demand_charge_rate: site.utility_rates[0]
      ? site.utility_rates[0].demand_charge_rate
      : DEFAULT_DEMAND_CHARGE_RATE,
  };
};

const calcInstallationCost = (
  numChargers: number,
  chargeRateKw: number
): number => {
  // constants below pulled from https://doi.org/10.1177/03611981221095750
  const c1 = 0.0066;
  const c2 = 48.43;
  const c3 = 9788.5;
  const installationCost =
    c1 * (numChargers * chargeRateKw) ** 2 +
    c2 * (numChargers * chargeRateKw) +
    c3;
  return installationCost;
};
