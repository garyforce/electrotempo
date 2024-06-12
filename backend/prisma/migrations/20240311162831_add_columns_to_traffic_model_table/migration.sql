-- AlterTable
CREATE SEQUENCE "et_prod".traffic_model_id_seq;
ALTER TABLE "et_prod"."traffic_model" ADD COLUMN     "model_source" TEXT NOT NULL DEFAULT 'Statewide',
ADD COLUMN     "model_type" TEXT NOT NULL DEFAULT '4step',
ADD COLUMN     "model_year" INTEGER NOT NULL DEFAULT 2024,
ALTER COLUMN "id" SET DEFAULT nextval('"et_prod".traffic_model_id_seq');
ALTER SEQUENCE "et_prod".traffic_model_id_seq OWNED BY "et_prod"."traffic_model"."id";
