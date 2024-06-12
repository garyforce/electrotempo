import { TerminalScenarioVehicle } from "./terminal-scenario-vehicle";

export type EnergyConsumptionLevel = {
  id: number;
  uuid: string;
  level: string;
  terminal_scenario_vehicles: TerminalScenarioVehicle[];
};
