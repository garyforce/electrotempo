/*
  Warnings:

  - You are about to drop the column `num_ice_vehicles` on the `terminal_facilities` table. All the data in the column will be lost.
  - You are about to drop the column `num_ice_vehicles_to_electrify` on the `terminal_scenarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "et_prod"."terminal_facilities" DROP COLUMN "num_ice_vehicles";

-- AlterTable
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD COLUMN     "num_ice_vehicles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "num_ice_vehicles_to_electrify" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "et_prod"."terminal_scenarios" DROP COLUMN "num_ice_vehicles_to_electrify";
