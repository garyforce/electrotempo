export type FleetElectrificationScenario = {
  id: number;
  name: string;
  vehiclePurchaseSuggestions: VehiclePurchaseSuggestion[];
  chargerPurchaseSuggestions: ChargerPurchaseSuggestion[];
  fuelCostUsd: number;
  insuranceCostUsd: number;
  downtimeCostUsd: number;
  maintenanceCostUsd: number;
  otherOAndMCostUsd: number;
  laborCostUsd: number;
  annualMilesDriven: number;
  dailyMilesDriven: number;
  evEquivalentEnergyConsumptionPerMile: number;
  averageHourlyConsumptionKwhPerHour: number;
  equipmentLifecycleYears: number;
  emissionReductionsTonsCo2: number;
  totalAnnualEmissionsTonsCo2: number;
  paybackPeriodYears: number;
};

export type VehiclePurchaseSuggestion = {
  id: number;
  referenceMakeModel: string;
  numElectricVehicles: number;
  numIceVehicles: number;
  totalCapexUsd: number;
  powerDemandProfile: PowerDemand[];
};

export type ChargerPurchaseSuggestion = {
  id: number;
  level: string;
  referenceMakeModel: string;
  numChargers: number;
  totalCapexUsd: number;
};

export type PowerDemand = {
  hour: number;
  powerDemandKw: number;
};
