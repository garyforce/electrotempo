export type FleetMix = {
  lightDutyVehicles: FleetMixVehicle[];
  mediumDutyVehicles: FleetMixVehicle[];
  heavyDutyVehicles: FleetMixVehicle[];
};

export type FleetMixVehicle = {
  id: string;
  type?: VehicleType;
  numEv?: number;
  numIce?: number;
  annualMileage?: number;
};

export type VehicleType =
  | "Sedan"
  | "SUV"
  | "Pickup"
  | "Van"
  | "Minivan"
  | "Kenworth K270E (150mi)"
  | "Kenworth K270E (200mi)"
  | "Freightliner eM2"
  | "Ford F600 XLT"
  | "Tesla Semi (300mi)"
  | "Tesla Semi (500mi)"
  | "CASCADIA 126 STOCK"
  | "Volvo VNR Electric 6x4 Tractor";

export const lightDutyVehicleTypes: VehicleType[] = [
  "Sedan",
  "SUV",
  "Pickup",
  "Van",
  "Minivan",
];

export const mediumDutyVehicleTypes: VehicleType[] = [
  "Kenworth K270E (150mi)",
  "Kenworth K270E (200mi)",
  "Freightliner eM2",
  "Ford F600 XLT",
];

export const heavyDutyVehicleTypes: VehicleType[] = [
  "Tesla Semi (300mi)",
  "Tesla Semi (500mi)",
  "CASCADIA 126 STOCK",
  "Volvo VNR Electric 6x4 Tractor",
];
