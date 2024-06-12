import { HubArrivalRate } from "./hub-arrival-rate";
import { HubScenario } from "./hub-scenario";

export type HubVehicleType = {
  id: number;
  type: string;
  arrival_rates: HubArrivalRate[];
  scenarios: HubScenario[];
};
