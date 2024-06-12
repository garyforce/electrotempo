import { Decimal } from "decimal.js";
import { Charger } from "./charger";

export type SiteVehicleData = {
  id: number;
  num_daily_arrivals: number;
  vehicle_type_id: number;
  vehicle_type: {
    type: string;
    description: string | null;
    parking_area: number;
    charger: Charger | null;
  };
  charger: Charger | null;
  charger_cost: Decimal;
};
