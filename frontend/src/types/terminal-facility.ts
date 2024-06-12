import { TerminalScenario } from "./terminal-scenario";

export type TerminalFacility = {
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  property_id: number;
  name: string;
  terminal_scenarios: TerminalScenario[];
};
