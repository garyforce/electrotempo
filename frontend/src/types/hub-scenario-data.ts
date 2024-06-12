import { HubCharger } from "./hub-charger";
import { HubUtilityRate } from "./hub-utility-rate";

export type SiteScenarioData = {
  id: number;
  name: string;
  address: string;
  external_id: string;
  highway_flow: number;
  num_warehouses: number;
  growth_rate: number;
  lat: number;
  lon: number;
  scenario: ScenarioData;
};
export type ScenarioData = {
  id: number;
  name: string;
  area: number;
  year: number;
  trucks_parking_pct: number;
  trailers_parking_pct: number;
  nearby_parking: number;
  public_charger_pct: number;
  utility_rate_id: number;
  parking_area: number;
  utility_rate: HubUtilityRate | null;
  yearly_params: ScenarioYearlyParam[];
  calculated_data: {
    aggregate_data: {
      arrivals: any;
      chargers: any;
      energy_demand: any;
      financial: any;
    };
    segment_data: SegmentData[];
  };
};
export type ScenarioYearlyParam = {
  vehicle_type_id: number;
  year: number;
  ev_adoption_rate: number;
  capture_rate: number;
  subscription_capture_rate: number;
  max_utility_supply: number;
};

export type CalculatedData = {
  aggregate_data: AggregateData;
  segment_data: SegmentData[];
};

export type AggregateData = {
  arrivals: Arrivals;
  chargers: Chargers;
  energy_demand: EnergyDemand;
  financial: Financial;
};

export type SegmentData = {
  vehicle_type_description: string;
  vehicle_type_id: number;
  vehicle_type: string;
  vehicle_energy_demand: number;
  vehicle_parking_space_requirement: number;
  num_chargers: number;
  parking_pct: number;
  capture_rate: number;
  ev_adoption_rate: number;
  subscription_capture_rate: number;
  arrivals: Arrivals;
  chargers: Chargers;
  energy_demand: EnergyDemand;
  financial: Financial;
  charger_cost: number;
  vehicle_charger: HubCharger;
};

// ----------------

export type Arrivals = {
  capture_arrivals: number;
  subscription_capture_arrivals: number;
  public_arrivals: number;
  subscription_arrivals: number;
  peaks: {
    peak_arrivals: number;
    peak_public_arrivals: number;
    peak_subscription_arrivals: number;
    peak_hours: ArrivalsVehicleHourlyData[];
  };
  hourly_data: ArrivalsVehicleHourlyData[];
};

export type ArrivalsVehicleHourlyData = {
  hour: number;
  capture_arrivals: number;
  public_arrivals: number;
  subscription_arrivals: number;
};

// ----------------

export type Chargers = {
  num_chargers: number;
  utility_constrained_feasible_chargers: number;
  parking_area_constrained_feasible_chargers: number;
  num_chargers_needed: number;
  num_assignable_chargers: number;
  num_public_chargers: number;
  num_subscription_chargers: number;
  utility_threshold: number;
  site_area_threshold: number;
  hourly_data: ChargerHourlyData[];
  charger_assignments: ChargerAssignmentType;
};

export type ChargerAssignmentType = {
  public: ChargerSchedule;
  subscription: ChargerSchedule;
};

export type ChargerSchedule = {
  schedules: Schedule[];
  avg_util_rate: number;
};

export type Schedule = {
  schedule: number[];
  util_rate: number;
};

export type ChargerHourlyData = {
  hour: number;
  public_chargers_in_use: number;
  public_chargers_idle: number;
  public_util_rate: number;
  public_dropped_arrivals: number;
  public_drop_rate: number;
  subscription_chargers_in_use: number;
  subscription_chargers_idle: number;
  subscription_util_rate: number;
  subscription_dropped_arrivals: number;
  subscription_drop_rate: number;
  chargers_in_use: number;
  chargers_idle: number;
  chargers_util_rate: number;
  dropped_arrivals: number;
  drop_rate: number;
};

// ----------------

export type EnergyDemand = {
  energy_demand: number;
  energy_supply: number;
  power_demand: number;
  power_supply: number;
  public_energy_demand: number;
  public_energy_supply: number;
  public_power_demand: number;
  public_power_supply: number;
  subscription_energy_demand: number;
  subscription_energy_supply: number;
  subscription_power_demand: number;
  subscription_power_supply: number;
  utility_threshold: number;
  site_area_threshold: number;
  hourly_data: EnergyHourlyData[];
};

export type EnergyHourlyData = {
  hour: number;
  energy_demand: number;
  energy_supply: number;
  power_demand: number;
  power_supply: number;
  public_energy_demand: number;
  public_energy_supply: number;
  public_power_demand: number;
  public_power_supply: number;
  subscription_energy_demand: number;
  subscription_energy_supply: number;
  subscription_power_demand: number;
  subscription_power_supply: number;
};

// ----------------

export type Financial = {
  capital_expenses: FinancialCapitalExpense;
  operational_costs: FinancialOperationalCost;
};

export type FinancialCapitalExpense = {
  charger_costs: number;
  chargers_installation_costs: number;
};

export type FinancialOperationalCost = {
  energy_cost: number;
  energy_demand_cost: number;
  maintenance_cost: number;
};
