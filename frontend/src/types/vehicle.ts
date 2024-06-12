export type Vehicle = {
  id: number;
  name: string | null;
  make: string | null;
  model: string | null;
  vehicleTypeId: number;
  batteryCapacityKwh: number;
  batteryMaxChargeRateKw: number;
  priceUsd: number;
  engineType: EngineType;
  buyAmericaCompliance: boolean;
};

export type EngineType = "ELECTRIC" | "ICE" | "HYBRID";
