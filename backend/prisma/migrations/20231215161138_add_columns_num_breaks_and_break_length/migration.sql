-- AlterTable
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD COLUMN     "break_length" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "num_breaks" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "fleet_size" SET DEFAULT 0,
ALTER COLUMN "num_shifts" SET DEFAULT 0,
ALTER COLUMN "vehicles_per_shift" SET DEFAULT 0;
