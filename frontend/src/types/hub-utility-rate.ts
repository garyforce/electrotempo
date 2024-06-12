export interface HubUtilityRate {
  id: number;
  site_id: number;
  energy_charge_rate: number;
  demand_charge_rate: number;
  utility: {
    id: number;
    name: string;
  };
}
