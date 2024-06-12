export type TerminalScenario = {
  id: number;
  propertyId: number;
  facilityId: number;
  name: string;
  active: boolean;
  utilityRateId: number;
  scenarioVehicles: {
    id: number;
  }[];
};

export type ChargerData = {
  id?: number;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  chargeRateKw: number;
  voltage: number;
  amperage: number;
  priceUsd: number;
};

export type VehicleData = {
  id?: number;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  isEV?: boolean | null;
  vehicleTypeId: number;
  batteryCapacityKwh: number;
  batteryMaxChargeRateKw: number;
  priceUsd: number;
  buyAmericaCompliance: boolean;
};

export type UtilityRateStructure = {
  id: number | null;
  name: string | null;
  generationChargePricePerKwh: number;
  transmissionChargePricePerKwh: number;
  distributionChargePricePerKwh: number;
  generationDemandChargePricePerKw: number;
  transmissionDemandChargePricePerKw: number;
  distributionDemandChargePricePerKw: number;
  ppaGenerationChargePricePerKwh: number;
  ppaTransmissionChargePricePerKwh: number;
  ppaDistributionChargePricePerKwh: number;
  ppaGenerationDemandChargePricePerKw: number;
  ppaTransmissionDemandChargePricePerKw: number;
  ppaDistributionDemandChargePricePerKw: number;
};

export type NewTerminalScenarioData = {
  scenarioName: string | null;
  planningHorizonYears: number;
  chargerMaintenanceCostPct: number;
  chargerReplacementLifecycleYears: number;
  iceFuelCostPerGallon: number;
  shiftSchedule: number[];
  chargerOptions: ChargerData[];
  fleetMix: {
    vehicleTypeId: number | null;
    fleetSize: number;
    vehiclesPerShift: number;
    vehicleMaintenanceCostPct: number;
    vehicleReplacementLifecycleYears: number;
    batteryReplacementLifecycleYears: number;
    iceVehicleId: number | null;
    iceVehicleFuelConsumption: number;
    iceVehicleDowntime: number;
    evExpectedDowntime: number;
    evOptions: VehicleData[];
  };
  utilityRateStructure: UtilityRateStructure;
};

export type FleetMixVehicle = {
  id: number | undefined;
  iceReferenceVehicle: string | undefined;
};
