/*
  Warnings:

  - You are about to drop the column `demand_charge_rate_usd` on the `utility_rates` table. All the data in the column will be lost.
  - You are about to drop the column `enery_charge_rate_usd` on the `utility_rates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "et_prod"."utility_rates" DROP COLUMN "demand_charge_rate_usd",
DROP COLUMN "enery_charge_rate_usd",
ADD COLUMN     "organization_id" INTEGER,
ADD COLUMN     "generation_usage_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_generation_usage_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "peak_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "ppa_peak_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "distribution_demand_charge_price_per_kw" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "transmission_charge_price_per_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "transmission_usage_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0,
ADD COLUMN     "total_usage_kwh" DECIMAL(32,6) NOT NULL DEFAULT 0;
