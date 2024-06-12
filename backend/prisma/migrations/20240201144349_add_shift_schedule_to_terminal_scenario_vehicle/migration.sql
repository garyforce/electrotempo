/*
  Warnings:

  - You are about to drop the column `break_length` on the `terminal_scenario_vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `num_breaks` on the `terminal_scenario_vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `num_shifts` on the `terminal_scenario_vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `operate_end_hour` on the `terminal_scenario_vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `operate_start_hour` on the `terminal_scenario_vehicles` table. All the data in the column will be lost.
  - You are about to drop the `terminal_shifts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "et_prod"."terminal_shifts" DROP CONSTRAINT "terminal_shifts_scenario_vehicle_id_fkey";

-- AlterTable
ALTER TABLE "et_prod"."terminal_scenario_vehicles" DROP COLUMN "break_length",
DROP COLUMN "num_breaks",
DROP COLUMN "num_shifts",
DROP COLUMN "operate_end_hour",
DROP COLUMN "operate_start_hour",
ADD COLUMN     "shift_schedule" INTEGER[] DEFAULT ARRAY[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]::INTEGER[];

-- DropTable
DROP TABLE "et_prod"."terminal_shifts";
