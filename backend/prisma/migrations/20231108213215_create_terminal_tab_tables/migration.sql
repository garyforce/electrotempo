-- CreateTable
CREATE TABLE "et_prod"."properties" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "external_id" VARCHAR(100),
    "address" VARCHAR(255) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "utility_rate_id" INTEGER,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."terminal_facilities" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "property_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "terminal_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."terminal_scenarios" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "user_id" INTEGER,
    "property_id" INTEGER NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "planning_horizon_years" INTEGER NOT NULL,
    "num_chargers" INTEGER NOT NULL,

    CONSTRAINT "terminal_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."terminal_scenario_vehicles" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "scenario_id" INTEGER NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER,
    "energy_consumption_level_id" INTEGER NOT NULL,
    "fleet_size" INTEGER NOT NULL,
    "num_shifts" INTEGER NOT NULL,
    "vehicles_per_shift" INTEGER NOT NULL,
    "operate_start_hour" INTEGER NOT NULL,
    "operate_end_hour" INTEGER NOT NULL,

    CONSTRAINT "terminal_scenario_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."terminal_shifts" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "scenario_vehicle_id" INTEGER NOT NULL,
    "start_hour" INTEGER NOT NULL,
    "end_hour" INTEGER NOT NULL,
    "break_start_hour" INTEGER NOT NULL,
    "break_end_hour" INTEGER NOT NULL,

    CONSTRAINT "terminal_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."terminal_energy_demand_datapoints" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "scenario_vehicle_id" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "energy_demand_kwh" DECIMAL(32,2) NOT NULL,
    "power_demand_kw" DECIMAL(32,2) NOT NULL,

    CONSTRAINT "terminal_energy_demand_datapoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."terminal_vehicle_status_datapoints" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "scenario_vehicle_id" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,

    CONSTRAINT "terminal_vehicle_status_datapoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."chargers" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(100) NOT NULL,
    "make" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "charge_rate_kw" DECIMAL(32,2) NOT NULL DEFAULT 0,
    "voltage" DECIMAL(32,2) NOT NULL DEFAULT 0,
    "amperage" DECIMAL(32,2) NOT NULL DEFAULT 0,
    "price_usd" DECIMAL(32,2) NOT NULL DEFAULT 0,

    CONSTRAINT "chargers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicles" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(100) NOT NULL,
    "make" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "battery_capacity_kwh" DECIMAL(32,2) NOT NULL DEFAULT 0,
    "battery_max_charge_rate_kw" DECIMAL(32,2) NOT NULL DEFAULT 0,
    "price_usd" DECIMAL(32,2) NOT NULL DEFAULT 0,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_types" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(100) NOT NULL,
    "kwh_per_hour" DECIMAL(32,2) NOT NULL DEFAULT 0,
    "ice_reference_cost_usd" DECIMAL(32,2) NOT NULL DEFAULT 0,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_statuses" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "vehicle_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."energy_consumption_levels" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "level" VARCHAR(50) NOT NULL,

    CONSTRAINT "energy_consumption_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."utility_rates" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "utility_id" INTEGER NOT NULL,
    "enery_charge_rate_usd" DECIMAL(32,6) NOT NULL,
    "demand_charge_rate_usd" DECIMAL(32,6) NOT NULL,

    CONSTRAINT "utility_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."utilities" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "utilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "properties_uuid_key" ON "et_prod"."properties"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_facilities_uuid_key" ON "et_prod"."terminal_facilities"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_scenarios_uuid_key" ON "et_prod"."terminal_scenarios"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_scenario_vehicles_uuid_key" ON "et_prod"."terminal_scenario_vehicles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_shifts_uuid_key" ON "et_prod"."terminal_shifts"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_shifts_scenario_vehicle_id_start_hour_key" ON "et_prod"."terminal_shifts"("scenario_vehicle_id", "start_hour") WHERE deleted_at IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "terminal_energy_demand_datapoints_uuid_key" ON "et_prod"."terminal_energy_demand_datapoints"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_energy_demand_datapoints_scenario_vehicle_id_hour_key" ON "et_prod"."terminal_energy_demand_datapoints"("scenario_vehicle_id", "hour") WHERE deleted_at IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "terminal_vehicle_status_datapoints_uuid_key" ON "et_prod"."terminal_vehicle_status_datapoints"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_vehicle_status_datapoints_scenario_vehicle_id_hour_key" ON "et_prod"."terminal_vehicle_status_datapoints"("scenario_vehicle_id", "hour") WHERE deleted_at IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "chargers_uuid_key" ON "et_prod"."chargers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_uuid_key" ON "et_prod"."vehicles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_uuid_key" ON "et_prod"."vehicle_types"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_statuses_uuid_key" ON "et_prod"."vehicle_statuses"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "energy_consumption_levels_uuid_key" ON "et_prod"."energy_consumption_levels"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "utility_rates_uuid_key" ON "et_prod"."utility_rates"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "utilities_uuid_key" ON "et_prod"."utilities"("uuid");

-- AddForeignKey
ALTER TABLE "et_prod"."properties" ADD CONSTRAINT "properties_utility_rate_id_fkey" FOREIGN KEY ("utility_rate_id") REFERENCES "et_prod"."utility_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_facilities" ADD CONSTRAINT "terminal_facilities_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "et_prod"."properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenarios" ADD CONSTRAINT "terminal_scenarios_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "et_prod"."properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenarios" ADD CONSTRAINT "terminal_scenarios_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "et_prod"."terminal_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD CONSTRAINT "terminal_scenario_vehicles_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "et_prod"."terminal_scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD CONSTRAINT "terminal_scenario_vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_prod"."vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD CONSTRAINT "terminal_scenario_vehicles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "et_prod"."vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_scenario_vehicles" ADD CONSTRAINT "terminal_scenario_vehicles_energy_consumption_level_id_fkey" FOREIGN KEY ("energy_consumption_level_id") REFERENCES "et_prod"."energy_consumption_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_shifts" ADD CONSTRAINT "terminal_shifts_scenario_vehicle_id_fkey" FOREIGN KEY ("scenario_vehicle_id") REFERENCES "et_prod"."terminal_scenario_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_energy_demand_datapoints" ADD CONSTRAINT "terminal_energy_demand_datapoints_scenario_vehicle_id_fkey" FOREIGN KEY ("scenario_vehicle_id") REFERENCES "et_prod"."terminal_scenario_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_scenario_vehicle_id_fkey" FOREIGN KEY ("scenario_vehicle_id") REFERENCES "et_prod"."terminal_scenario_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."terminal_vehicle_status_datapoints" ADD CONSTRAINT "terminal_vehicle_status_datapoints_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "et_prod"."vehicle_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."vehicles" ADD CONSTRAINT "vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_prod"."vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."utility_rates" ADD CONSTRAINT "utility_rates_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "et_prod"."utilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
