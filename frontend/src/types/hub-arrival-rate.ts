import { HubSite } from "./hub-site";
import { HubVehicleType } from "./hub-vehicle-type";

export type HubArrivalRate = {
  id: number;
  scenario_id: number;
  vehicle_type_id: number;
  hour: number;
  traffic_pct: number;
  traffic_year: number;
  site: HubSite;
  vehicle_type: HubVehicleType;
};
