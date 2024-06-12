/*
  Warnings:

  - A unique constraint covering the columns `[site_id,ev_growth_scenario_id]` on the table `scenarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "et_hub"."scenario_years" ALTER COLUMN "max_utility_supply" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "et_hub"."scenarios" ADD COLUMN     "ev_growth_scenario_id" INTEGER,
ALTER COLUMN "trucks_parking_pct" SET DEFAULT 0.5,
ALTER COLUMN "trailers_parking_pct" SET DEFAULT 0.5,
ALTER COLUMN "public_charger_pct" SET DEFAULT 0.5;

-- CreateIndex
CREATE UNIQUE INDEX "scenarios_site_id_ev_growth_scenario_id_key" ON "et_hub"."scenarios"("site_id", "ev_growth_scenario_id") WHERE deleted_at IS NULL;

-- AddForeignKey
ALTER TABLE "et_hub"."scenarios" ADD CONSTRAINT "scenarios_ev_growth_scenario_id_fkey" FOREIGN KEY ("ev_growth_scenario_id") REFERENCES "et_prod"."ev_growth_scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateView
CREATE OR REPLACE VIEW et_prod.v_ev_growth_scenario_penetration_rates AS
SELECT
  vegsad.id,
  vegssp.ev_growth_scenario_id,
  vvc.vehicle_class_id,
  vegsad.year,
  vegsad.ev_fraction_of_all_vehicles AS ev_penetration_rate
FROM et_prod.v_ev_growth_scenario_annual_data vegsad
  JOIN et_prod.v_ev_growth_scenario_simulation_parameters vegssp ON vegssp.id = vegsad.growth_scenario_simulation_parameters_id
  JOIN et_prod.v_vehicle_class vvc ON vvc.vehicle_class_id = vegssp.vehicle_class_id;
