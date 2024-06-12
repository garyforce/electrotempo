-- AlterTable
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD COLUMN     "ev_downtime_pct" DECIMAL(3,2) NOT NULL DEFAULT 0.2,
ADD COLUMN     "ice_downtime_pct" DECIMAL(3,2) NOT NULL DEFAULT 0.34,
ADD COLUMN     "ice_fuel_consumption" DECIMAL(32,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "et_prod"."vehicle_types" ADD COLUMN     "ice_reference_fuel_consumption" DECIMAL(32,2) NOT NULL DEFAULT 0;
