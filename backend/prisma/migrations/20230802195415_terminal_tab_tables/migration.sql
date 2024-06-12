-- CreateTable
CREATE TABLE "et_prod"."infrastructure_optimization_scenario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "s3_uri" TEXT NOT NULL,
    "terminal" TEXT NOT NULL,
    "facility" TEXT NOT NULL,
    "fleet_size" INTEGER NOT NULL,
    "vehicle_type_id" UUID NOT NULL,
    "shift_schedule_id" UUID NOT NULL,
    "utility_rate_structure_id" UUID NOT NULL,
    "energy_consumption_id" UUID NOT NULL,
    "vehicle_configuration_id" UUID NOT NULL,
    "charger_configuration_id" UUID NOT NULL,
    "num_vehicles_purchased" INTEGER NOT NULL,
    "num_chargers_purchased" INTEGER NOT NULL,
    "worst_vehicle_configuration_id" UUID NOT NULL,
    "median_vehicle_configuration_id" UUID NOT NULL,
    "worst_charger_configuration_id" UUID NOT NULL,
    "median_charger_configuration_id" UUID NOT NULL,
    "comparison_vehicles_purchased_worst" INTEGER NOT NULL,
    "comparison_vehicles_purchased_median" INTEGER NOT NULL,
    "comparison_chargers_purchased_worst" INTEGER NOT NULL,
    "comparison_chargers_purchased_median" INTEGER NOT NULL,
    "num_solved_sibling_scenarios" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "infrastructure_optimization_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."demand_profile_datapoint" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "infrastructure_optimization_scenario_id" UUID NOT NULL,
    "hour" TIME(0) NOT NULL,
    "energy_demand_kwh" DECIMAL(65,30) NOT NULL,
    "power_demand_kw" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "demand_profile_datapoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "ice_reference_cost_usd" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "vehicle_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."shift_schedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "day_start_hour" TIME(0) NOT NULL,
    "vehicles_per_shift" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "shift_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."shift" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shift_schedule_id" UUID NOT NULL,
    "start" TIME(0) NOT NULL,
    "end" TIME(0) NOT NULL,
    "break_start" TIME(0) NOT NULL,
    "break_end" TIME(0) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."utility_rate_structure" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "utility_rate_structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."energy_consumption" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "fuel_unit_id" UUID NOT NULL,
    "fuel_amount" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "energy_consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."fuel_unit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "kw_per_unit" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "fuel_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_configuration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "battery_capacity_kwh" DECIMAL(65,30) NOT NULL,
    "battery_max_charge_rate_kw" DECIMAL(65,30) NOT NULL,
    "price_usd" DECIMAL(65,30) NOT NULL,
    "vehicle_type_id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "vehicle_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."charger_configuration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "charge_rate_kw" DECIMAL(65,30) NOT NULL,
    "voltage" DECIMAL(65,30) NOT NULL,
    "amperage" DECIMAL(65,30) NOT NULL,
    "price_usd" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "charger_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_schedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "infrastructure_optimization_scenario_id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "vehicle_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_status_datapoint" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vehicle_schedule_id" UUID NOT NULL,
    "hour" TIME(0) NOT NULL,
    "vehicle_status_id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "vehicle_status_datapoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_status" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TEXT,

    CONSTRAINT "vehicle_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_prod"."vehicle_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_shift_schedule_id_fkey" FOREIGN KEY ("shift_schedule_id") REFERENCES "et_prod"."shift_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_utility_rate_structur_fkey" FOREIGN KEY ("utility_rate_structure_id") REFERENCES "et_prod"."utility_rate_structure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_energy_consumption_id_fkey" FOREIGN KEY ("energy_consumption_id") REFERENCES "et_prod"."energy_consumption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_vehicle_configuration_fkey" FOREIGN KEY ("vehicle_configuration_id") REFERENCES "et_prod"."vehicle_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_charger_configuration_fkey" FOREIGN KEY ("charger_configuration_id") REFERENCES "et_prod"."charger_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_worst_vehicle_configu_fkey" FOREIGN KEY ("worst_vehicle_configuration_id") REFERENCES "et_prod"."vehicle_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_median_vehicle_config_fkey" FOREIGN KEY ("median_vehicle_configuration_id") REFERENCES "et_prod"."vehicle_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_worst_charger_configu_fkey" FOREIGN KEY ("worst_charger_configuration_id") REFERENCES "et_prod"."charger_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."infrastructure_optimization_scenario" ADD CONSTRAINT "infrastructure_optimization_scenario_median_charger_config_fkey" FOREIGN KEY ("median_charger_configuration_id") REFERENCES "et_prod"."charger_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."demand_profile_datapoint" ADD CONSTRAINT "demand_profile_datapoint_infrastructure_optimization_scena_fkey" FOREIGN KEY ("infrastructure_optimization_scenario_id") REFERENCES "et_prod"."infrastructure_optimization_scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."shift" ADD CONSTRAINT "shift_shift_schedule_id_fkey" FOREIGN KEY ("shift_schedule_id") REFERENCES "et_prod"."shift_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."energy_consumption" ADD CONSTRAINT "energy_consumption_fuel_unit_id_fkey" FOREIGN KEY ("fuel_unit_id") REFERENCES "et_prod"."fuel_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."vehicle_configuration" ADD CONSTRAINT "vehicle_configuration_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "et_prod"."vehicle_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."vehicle_schedule" ADD CONSTRAINT "vehicle_schedule_infrastructure_optimization_scenario_id_fkey" FOREIGN KEY ("infrastructure_optimization_scenario_id") REFERENCES "et_prod"."infrastructure_optimization_scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."vehicle_status_datapoint" ADD CONSTRAINT "vehicle_status_datapoint_vehicle_schedule_id_fkey" FOREIGN KEY ("vehicle_schedule_id") REFERENCES "et_prod"."vehicle_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "et_prod"."vehicle_status_datapoint" ADD CONSTRAINT "vehicle_status_datapoint_vehicle_status_id_fkey" FOREIGN KEY ("vehicle_status_id") REFERENCES "et_prod"."vehicle_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
