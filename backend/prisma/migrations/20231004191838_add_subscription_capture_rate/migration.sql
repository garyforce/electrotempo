-- AlterTable
ALTER TABLE "et_hub"."scenario_years" ADD COLUMN     "subscription_capture_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
ALTER COLUMN "capture_rate" SET DEFAULT 0.25;
