import { FinancialControls } from "./terminal-financial";

export type ScenarioVehiclesType = {
  vehicleType: { name: string };
  evVehicle: { name: string };
  energyConsumptionLevel: { level: string };
  fleetSize: number;
  numShifts: number;
  vehiclesPerShift: number;
  operateStartHour: number;
  operateEndHour: number;
  numICEVehicles: number;
  numICEVehiclesToElectrify: number;
};

export type TerminalsScenariosType = {
  name: string;
  planningHorizonYears: number;
  numChargers: number;
  chargerId: number;
  optNumChargers: number;
  facility: { name: string };
  charger: { name: string };
  scenarioVehicles: ScenarioVehiclesType[];
};

export type TerminalDownloadData = {
  terminalName: string;
  facilityName: string;
  scenarioName: string;
  vehicleType: string;
  shiftSchedule: number[];
  utilityRateStructure: string;
  energyConsumptionLevel: string;
  numShifts: number;
  vehiclesPerShift: number;
  shiftStartHour: number;
  shiftEndHour: number;
  numICEVehicles: number;
  optNumEvs: number;
  numChargers: number;
  optNumChargers: number;
  evVehicle: {
    name: string;
    make: string;
    model: string;
    batteryCapacityKwh: number;
    batteryMaxChargeRateKw: number;
    priceUsd: number;
  };
  charger: {
    name: string;
    make: string;
    model: string;
    chargeRateKw: number;
    voltage: number;
    amperage: number;
    priceUsd: number;
  };
  financial: {
    financialControls: FinancialControls;
    totalCapitalExpenses: number;
    totalOperationalExpenses: number;
    maxAnnualKwhUsage: number;
    maxAnnualPeakDemand: number;
  };
};
