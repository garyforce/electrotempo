import { UtilityRate } from "./utility-rate";

export type Utility = {
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  utility_rates: UtilityRate[];
};
