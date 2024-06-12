-- AlterTable
ALTER TABLE "et_prod"."terminal_facilities" ADD COLUMN     "num_ice_vehicles" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "et_prod"."terminal_scenarios" ADD COLUMN     "num_ice_vehicles_to_electrify" INTEGER NOT NULL DEFAULT 0;
