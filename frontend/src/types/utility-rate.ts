import { Property } from "./property";

export type UtilityRate = {
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  utility_id: number;
  energy_charge_rate_usd: number;
  demand_charge_rate_usd: number;
  properties: Property[];
};
