export type VehicleTypes = {
  id: number;
  name: string;
  kwhPerHour: number;
  iceReferenceCostUsd: number;
};

export type VehicleType = {
  id: number;
  name: string;
  kwhPerHour: number;
  iceReferenceCostUsd: number;
  vehicles: VehicleModelType[];
  iceReferenceFuelConsumption: string;
};

export type NewTerminalVehicleType = {
  id: number;
  name: string;
  iceReferenceFuelConsumption: string;
};

export type VehicleModelType = {
  id: number;
  name: string;
  make: string;
  model: string;
  vehicleTypeId: number;
  batteryCapacityKwh: number;
  batteryMaxChargeRateKw: number;
  priceUsd: number;
};
