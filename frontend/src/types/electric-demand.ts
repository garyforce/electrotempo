export type ElectricDemand = {
  hourid: number;
  energy_demand_kwh_summer: number;
  energy_demand_kwh_winter: number;
  energy_demand_kwh_shoulder: number;
  power_demand_kw_summer: number;
  power_demand_kw_winter: number;
  power_demand_kw_shoulder: number;
};

export type DepotDemand = ElectricDemand & {
  depot_id: number;
};

export type FeederLineDemand = ElectricDemand & {
  feeder_line_id: number;
};
