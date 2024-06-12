import { HubSite } from "./hub-site";
import { HubVehicleType } from "./hub-vehicle-type";
import { downloadedDataType } from "./downloadCalculatedData";
import { SiteVehicleData } from "./hub-site-vehicle";

export type HubScenario = {
  id: number;
  name: string;
  address: string;
  external_id: string;
  highway_flow: number;
  num_warehouses: number;
  growth_rate: number;
  lat: number;
  lon: number;
  scenario: HubScenarioData;
};
interface segmentDataType {
  vehicle_type_id: number;
  vehicle_type: string;
  vehicle_type_description: string;
  vehicle_parking_space_requirement: number;
}
export type HubScenarioData = {
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
  evGrowthScenarioId: number;
  utility_rate: {
    utility: {
      name: string;
    };
    energy_charge_rate: number;
    demand_charge_rate: number;
  };
  yearly_params: {
    vehicle_type_id: number;
    year: number;
    ev_adoption_rate: number;
    capture_rate: number;
    subscription_capture_rate: number;
    max_utility_supply: number;
  }[];
  calculated_data: {
    aggregate_data: {
      arrivals: any;
      chargers: any;
      energy_demand: any;
      financial: any;
    };
    segment_data: segmentDataType[];
  };
};

export interface PostScenarioData {
  user_id: number;
  site_id: number;
  name: string;
  area: number;
  year: number;
  trucks_parking_pct: number;
  trailers_parking_pct: number;
  nearby_parking: number;
  public_charger_pct: number;
  utility_rate_id: number;
  parking_area: number;
  evGrowthScenarioId: number;
  num_chargers: number;
}
