import { Charger } from "./charger";
import { TerminalEnergyDemandDatapoint } from "./terminal-energy-demand-datapoint";
import { TerminalVehicleStatusDatapoint } from "./terminal-vehicle-status-datapoint";
import { Vehicle } from "./vehicle";
import { VehicleTypes } from "./vehicle-types";

export type TerminalScenarioVehicle = {
  id: number;
  fleetSize: number;
  vehiclesPerShift: number;
  numICEVehicles: number;
  numICEVehiclesToElectrify: number;
  evReserve: number;
  evDowntimePct: number;
  iceDowntimePct: number;
  iceFuelConsumption: number;
  vehicleMaintenanceCostPct: number;
  vehicleReplacementLifecycleYears: number;
  batteryReplacementLifecycleYears: number;
  scenario: TerminalVehicleScenario;
  vehicleType: VehicleTypes;
  iceVehicle: Vehicle | null;
  evVehicle: Vehicle | null;
  vehicleCost: number;
  energyConsumptionLevel: {
    id: number;
    level: string;
  };
  shiftSchedule: number[];
  energyDemandDatapoints: TerminalEnergyDemandDatapoint[];
  vehicleStatusDatapoints: TerminalVehicleStatusDatapoint[];
};

export type TerminalVehicleScenario = {
  id: number;
  name: string;
  planningHorizonYears: number;
  numChargers: number;
  optNumChargers: number;
  chargerMaintenanceCostPct: number;
  chargerReplacementLifecycleYears: number;
  iceFuelCostPerGallon: number;
  property: {
    id: number;
    name: string;
  };
  facility: {
    id: number;
    name: string;
  };
  charger: Charger | null;
  utilityRate?: {
    id: number;
    name: string;
  };
  chargerCost: number;
  installationCost: number;
};
