-- CreateTable
CREATE TABLE "et_hub"."fleet_arrivals" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "user_id" INTEGER,
    "site_id" INTEGER NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "hour_0" INTEGER NOT NULL DEFAULT 0,
    "hour_1" INTEGER NOT NULL DEFAULT 0,
    "hour_2" INTEGER NOT NULL DEFAULT 0,
    "hour_3" INTEGER NOT NULL DEFAULT 0,
    "hour_4" INTEGER NOT NULL DEFAULT 0,
    "hour_5" INTEGER NOT NULL DEFAULT 0,
    "hour_6" INTEGER NOT NULL DEFAULT 0,
    "hour_7" INTEGER NOT NULL DEFAULT 0,
    "hour_8" INTEGER NOT NULL DEFAULT 0,
    "hour_9" INTEGER NOT NULL DEFAULT 0,
    "hour_10" INTEGER NOT NULL DEFAULT 0,
    "hour_11" INTEGER NOT NULL DEFAULT 0,
    "hour_12" INTEGER NOT NULL DEFAULT 0,
    "hour_13" INTEGER NOT NULL DEFAULT 0,
    "hour_14" INTEGER NOT NULL DEFAULT 0,
    "hour_15" INTEGER NOT NULL DEFAULT 0,
    "hour_16" INTEGER NOT NULL DEFAULT 0,
    "hour_17" INTEGER NOT NULL DEFAULT 0,
    "hour_18" INTEGER NOT NULL DEFAULT 0,
    "hour_19" INTEGER NOT NULL DEFAULT 0,
    "hour_20" INTEGER NOT NULL DEFAULT 0,
    "hour_21" INTEGER NOT NULL DEFAULT 0,
    "hour_22" INTEGER NOT NULL DEFAULT 0,
    "hour_23" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fleet_arrivals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fleet_arrivals_site_id_vehicle_type_id_label_key" ON "et_hub"."fleet_arrivals"("site_id", "vehicle_type_id", "label") WHERE deleted_at IS NULL;

-- AddForeignKey
ALTER TABLE "et_hub"."fleet_arrivals" ADD CONSTRAINT "fleet_arrivals_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "et_hub"."sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."fleet_arrivals" ADD CONSTRAINT "fleet_arrivals_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_hub"."vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
