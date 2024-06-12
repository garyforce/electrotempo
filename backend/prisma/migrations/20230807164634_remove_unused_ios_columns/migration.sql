/*
  Warnings:

  - You are about to drop the column `comparison_chargers_purchased_median` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `comparison_chargers_purchased_worst` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `comparison_vehicles_purchased_median` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `comparison_vehicles_purchased_worst` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `median_charger_configuration_id` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `median_vehicle_configuration_id` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `num_solved_sibling_scenarios` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `worst_charger_configuration_id` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.
  - You are about to drop the column `worst_vehicle_configuration_id` on the `infrastructure_optimization_scenario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_median_charger_config_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_median_vehicle_config_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_worst_charger_configu_fkey";

-- DropForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP CONSTRAINT "infrastructure_optimization_scenario_worst_vehicle_configu_fkey";

-- AlterTable
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" DROP COLUMN "comparison_chargers_purchased_median",
DROP COLUMN "comparison_chargers_purchased_worst",
DROP COLUMN "comparison_vehicles_purchased_median",
DROP COLUMN "comparison_vehicles_purchased_worst",
DROP COLUMN "median_charger_configuration_id",
DROP COLUMN "median_vehicle_configuration_id",
DROP COLUMN "num_solved_sibling_scenarios",
DROP COLUMN "worst_charger_configuration_id",
DROP COLUMN "worst_vehicle_configuration_id";
