/*
  Warnings:

  - Made the column `organization_id` on table `utility_rates` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "et_auth";

-- DropForeignKey
ALTER TABLE "et_prod"."utility_rates" DROP CONSTRAINT "utility_rates_utility_id_fkey";

-- AlterTable
ALTER TABLE "et_prod"."chargers" ADD COLUMN     "organization_id" INTEGER,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "make" DROP NOT NULL,
ALTER COLUMN "model" DROP NOT NULL;

-- AlterTable
ALTER TABLE "et_prod"."utility_rates" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "utility_id" DROP NOT NULL,
ALTER COLUMN "organization_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "et_prod"."vehicles" ADD COLUMN     "organization_id" INTEGER,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "make" DROP NOT NULL,
ALTER COLUMN "model" DROP NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "et_auth"."organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_ts" TIMESTAMP(3) NOT NULL,
    "updated_ts" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "et_prod"."chargers" ADD CONSTRAINT "chargers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "et_auth"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."vehicles" ADD CONSTRAINT "vehicles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "et_auth"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."utility_rates" ADD CONSTRAINT "utility_rates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "et_auth"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."utility_rates" ADD CONSTRAINT "utility_rates_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "et_prod"."utilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
