-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "et_hub";

-- CreateTable
CREATE TABLE "et_hub"."sites" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "external_id" VARCHAR(255),
    "utility_id" INTEGER,
    "highway_flow" INTEGER NOT NULL DEFAULT 0,
    "num_warehouses" INTEGER NOT NULL DEFAULT 0,
    "growth_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_hub"."site_vehicles" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "site_id" INTEGER NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "num_daily_arrivals" INTEGER NOT NULL,

    CONSTRAINT "site_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_hub"."scenarios" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "user_id" INTEGER NOT NULL,
    "site_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "year" INTEGER NOT NULL,
    "trucks_parking_pct" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "trailers_parking_pct" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "nearby_parking" INTEGER NOT NULL DEFAULT 0,
    "num_chargers" INTEGER NOT NULL DEFAULT 0,
    "public_charger_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "charger_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_hub"."scenario_years" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scenario_id" INTEGER NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "ev_adoption_rate" DOUBLE PRECISION NOT NULL,
    "capture_rate" DOUBLE PRECISION NOT NULL,
    "max_utility_supply" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "scenario_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_hub"."arrival_rates" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "site_id" INTEGER NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "traffic_pct" DOUBLE PRECISION NOT NULL,
    "traffic_year" INTEGER NOT NULL,

    CONSTRAINT "arrival_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_hub"."vehicle_types" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "parking_area" INTEGER NOT NULL,
    "fraction" DOUBLE PRECISION,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_hub"."utilities" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "utilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_hub"."utility_rates" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "site_id" INTEGER NOT NULL,
    "utility_id" INTEGER NOT NULL,
    "energy_charge_rate" DOUBLE PRECISION NOT NULL,
    "demand_charge_rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "utility_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_vehicles_site_id_vehicle_type_id_key" ON "et_hub"."site_vehicles"("site_id", "vehicle_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_years_scenario_id_vehicle_type_id_year_key" ON "et_hub"."scenario_years"("scenario_id", "vehicle_type_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "arrival_rates_site_id_vehicle_type_id_hour_traffic_year_key" ON "et_hub"."arrival_rates"("site_id", "vehicle_type_id", "hour", "traffic_year");

-- AddForeignKey
ALTER TABLE "et_hub"."sites" ADD CONSTRAINT "sites_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "et_hub"."utilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."site_vehicles" ADD CONSTRAINT "site_vehicles_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "et_hub"."sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."site_vehicles" ADD CONSTRAINT "site_vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_hub"."vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."scenarios" ADD CONSTRAINT "scenarios_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "et_hub"."sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."scenario_years" ADD CONSTRAINT "scenario_years_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "et_hub"."scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."scenario_years" ADD CONSTRAINT "scenario_years_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_hub"."vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."arrival_rates" ADD CONSTRAINT "arrival_rates_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "et_hub"."sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."arrival_rates" ADD CONSTRAINT "arrival_rates_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_hub"."vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."utility_rates" ADD CONSTRAINT "utility_rates_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "et_hub"."sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_hub"."utility_rates" ADD CONSTRAINT "utility_rates_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "et_hub"."utilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
