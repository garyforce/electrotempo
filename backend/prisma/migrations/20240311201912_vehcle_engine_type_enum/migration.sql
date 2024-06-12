-- CreateEnum
CREATE TYPE "et_prod"."engine_type" AS ENUM ('ELECTRIC', 'ICE', 'HYBRID');

-- AlterTable
ALTER TABLE "et_prod"."vehicles" ADD COLUMN     "engine_type" "et_prod"."engine_type" NOT NULL DEFAULT 'ELECTRIC';
