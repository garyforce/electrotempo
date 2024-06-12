/*
  Warnings:

  - You are about to drop the column `is_default` on the `utility_rates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "et_prod"."chargers" ADD COLUMN     "terminal_scenario_id" INTEGER;

-- AlterTable
ALTER TABLE "et_prod"."utility_rates" DROP COLUMN "is_default",
ADD COLUMN     "terminal_scenario_id" INTEGER;

-- AlterTable
ALTER TABLE "et_prod"."vehicles" ADD COLUMN     "terminal_scenario_vehicle_id" INTEGER;

-- AddForeignKey
ALTER TABLE "et_prod"."chargers" ADD CONSTRAINT "chargers_terminal_scenario_id_fkey" FOREIGN KEY ("terminal_scenario_id") REFERENCES "et_prod"."terminal_scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."vehicles" ADD CONSTRAINT "vehicles_terminal_scenario_vehicle_id_fkey" FOREIGN KEY ("terminal_scenario_vehicle_id") REFERENCES "et_prod"."terminal_scenario_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."utility_rates" ADD CONSTRAINT "utility_rates_terminal_scenario_id_fkey" FOREIGN KEY ("terminal_scenario_id") REFERENCES "et_prod"."terminal_scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
