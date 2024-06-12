-- DropForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" DROP CONSTRAINT "terminal_scenario_vehicles_energy_consumption_level_id_fkey";

-- AlterTable
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ALTER COLUMN "energy_consumption_level_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD CONSTRAINT "terminal_scenario_vehicles_energy_consumption_level_id_fkey" FOREIGN KEY ("energy_consumption_level_id") REFERENCES "et_prod"."energy_consumption_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
