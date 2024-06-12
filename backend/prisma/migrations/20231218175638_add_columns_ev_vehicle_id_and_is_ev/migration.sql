/*
  Warnings:

  - You are about to drop the column `vehicle_id` on the `terminal_scenario_vehicles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" DROP CONSTRAINT "terminal_scenario_vehicles_vehicle_id_fkey";

-- AlterTable
ALTER TABLE "et_prod"."terminal_scenario_vehicles" DROP COLUMN "vehicle_id",
ADD COLUMN     "ice_vehicle_id" INTEGER,
ADD COLUMN     "ev_vehicle_id" INTEGER;

-- AlterTable
ALTER TABLE "et_prod"."vehicles" ADD COLUMN     "is_ev" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD CONSTRAINT "terminal_scenario_vehicles_ice_vehicle_id_fkey" FOREIGN KEY ("ice_vehicle_id") REFERENCES "et_prod"."vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD CONSTRAINT "terminal_scenario_vehicles_ev_vehicle_id_fkey" FOREIGN KEY ("ev_vehicle_id") REFERENCES "et_prod"."vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
