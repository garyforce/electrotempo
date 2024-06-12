/*
  Warnings:

  - You are about to drop the column `charger_cost` on the `scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `charger_installation_cost` on the `scenarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "et_hub"."scenarios" DROP COLUMN "charger_cost",
DROP COLUMN "charger_installation_cost";

-- AlterTable
ALTER TABLE "et_hub"."site_vehicles" ADD COLUMN     "charger_cost" DECIMAL(32,2) NOT NULL DEFAULT 0;
