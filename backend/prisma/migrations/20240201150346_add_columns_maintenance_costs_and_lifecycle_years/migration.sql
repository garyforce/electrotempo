-- AlterTable
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD COLUMN     "battery_replacement_lifecycle_years" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vehicle_maintenance_cost_pct" DECIMAL(3,2) NOT NULL DEFAULT 0.05,
ADD COLUMN     "vehicle_replacement_lifecycle_years" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "et_prod"."terminal_scenarios" ADD COLUMN     "charger_maintenance_cost_pct" DECIMAL(3,2) NOT NULL DEFAULT 0.05,
ADD COLUMN     "charger_replacement_lifecycle_years" INTEGER NOT NULL DEFAULT 0;
