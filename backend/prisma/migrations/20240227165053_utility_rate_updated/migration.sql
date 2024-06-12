/*
  Warnings:

  - You are about to drop the column `generation_usage_charge_price_per_kwh` on the `utility_rates` table. All the data in the column will be lost.
  - You are about to drop the column `ppa_generation_usage_charge_price_per_kwh` on the `utility_rates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "et_prod"."utility_rates" DROP COLUMN "generation_usage_charge_price_per_kwh",
DROP COLUMN "ppa_generation_usage_charge_price_per_kwh",
ADD COLUMN     "distribution_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "generation_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "generation_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_distribution_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_distribution_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_generation_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_generation_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_transmission_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_transmission_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "transmission_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0;
