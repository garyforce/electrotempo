-- AlterTable
ALTER TABLE "et_prod"."vehicle_types" ADD COLUMN     "ev_efficiency" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "hybrid_efficiency" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "ice_efficiency" DECIMAL(3,2) NOT NULL DEFAULT 0;
