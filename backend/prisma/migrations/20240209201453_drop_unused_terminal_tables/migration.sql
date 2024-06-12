/*
  Warnings:

  - You are about to drop the `demand_profile_datapoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `energy_consumption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fuel_unit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `infrastructure_optimization_scenario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift_schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utility_rate_structure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_status_datapoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "et_prod"."demand_profile_datapoint" DROP CONSTRAINT "demand_profile_datapoint_infrastructure_optimization_scena_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."energy_consumption" DROP CONSTRAINT "energy_consumption_fuel_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_charger_configuration_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_energy_consumption_id_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_shift_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_utility_rate_structur_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_vehicle_configuration_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_vehicle_type_id_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."shift" DROP CONSTRAINT "shift_shift_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."vehicle_schedule" DROP CONSTRAINT "vehicle_schedule_infrastructure_optimization_scenario_id_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."vehicle_status_datapoint" DROP CONSTRAINT "vehicle_status_datapoint_vehicle_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."vehicle_status_datapoint" DROP CONSTRAINT "vehicle_status_datapoint_vehicle_status_id_fkey";

-- DropTable
DROP TABLE "et_prod"."demand_profile_datapoint";

-- DropTable
DROP TABLE "et_prod"."energy_consumption";

-- DropTable
DROP TABLE "et_prod"."fuel_unit";

-- DropTable
DROP TABLE "et_prod"."infrastructure_optimization_scenario";

-- DropTable
DROP TABLE "et_prod"."shift";

-- DropTable
DROP TABLE "et_prod"."shift_schedule";

-- DropTable
DROP TABLE "et_prod"."utility_rate_structure";

-- DropTable
DROP TABLE "et_prod"."vehicle_schedule";

-- DropTable
DROP TABLE "et_prod"."vehicle_status";

-- DropTable
DROP TABLE "et_prod"."vehicle_status_datapoint";
