import { HubScenarioYear } from "./hub-scenario-year";
export interface SitewithoutScenarioModel {
  id: number;
  organization_id: number;
  growth_rate: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  external_id?: string;
  utility_id?: number;
  highway_flow?: number;
  num_warehouses?: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface EvGrowthScenario {
  location: any;
  id: number;
  name: string;
  description: string;
}
export interface SiteModel extends SitewithoutScenarioModel {
  utility: Utility;
  utility_rates: UtilityRate[];
  scenarios: ScenarioModel[];
  evGrowthScenarios: EvGrowthScenario[];
}

export type ScenarioModel = {
  id: number;
  user_id: number;
  site_id: number;
  name: string;
  area: number;
  year: number;
  trucks_parking_pct: number;
  trailers_parking_pct: number;
  nearby_parking: number;
  num_chargers: number;
  public_charger_pct: number;
  parking_area: number;
  site?: ScenarioSite;
  scenario_years: HubScenarioYear[];
  utility_rate_id?: number;
  growth_rate: number;
  vehicle_chargers?: Object;
  evGrowthScenarioId: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type ScenarioSite = {
  id: number;
  organization_id: number;
  name: string;
  address: string;
  external_id: string;
  utility_id: number;
  highway_flow: number;
  num_warehouses: number;
  growth_rate: number;
  lat: number;
  lon: number;
  site_vehicles: siteVehicles[];
};

export type siteVehicles = {
  id: number;
  site_id: number;
  vehicle_type_id: number;
  num_daily_arrivals: number;
};

export interface ScenarioDataType {
  id: number;
  name: string;
}

export interface SiteDataType {
  id: number;
  name: string;
  scenarios: ScenarioDataType[];
}

export interface Utility {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface UtilityRate {
  id: number;
  site_id: number;
  utility_id: number;
  energy_charge_rate: number;
  demand_charge_rate: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface chargerModel {
  id: number;
  name: string;
  make: string;
  model: string;
  charge_rate_kw: string;
  voltage: string;
  amperage: string;
  price: string;
}
