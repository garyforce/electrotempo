-- AlterTable
ALTER TABLE "et_hub"."site_vehicles" ADD COLUMN     "charger_id" INTEGER;

-- AlterTable
ALTER TABLE "et_hub"."vehicle_types" ADD COLUMN     "charger_id" INTEGER;

-- CreateTable
CREATE TABLE "et_hub"."chargers" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(50) NOT NULL,
    "make" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "charge_rate_kw" DECIMAL(32,2) NOT NULL,
    "voltage" DECIMAL(32,2) NOT NULL,
    "amperage" DECIMAL(32,2) NOT NULL,
    "price" DECIMAL(32,2) NOT NULL,

    CONSTRAINT "chargers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "et_hub"."site_vehicles" ADD CONSTRAINT "site_vehicles_charger_id_fkey" FOREIGN KEY ("charger_id") REFERENCES "et_hub"."chargers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."vehicle_types" ADD CONSTRAINT "vehicle_types_charger_id_fkey" FOREIGN KEY ("charger_id") REFERENCES "et_hub"."chargers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
