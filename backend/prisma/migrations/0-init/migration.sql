-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "et_prod";

CREATE SCHEMA IF NOT EXISTS "tiger";

CREATE SCHEMA IF NOT EXISTS "topology";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "postgis_tiger_geocoder" WITH SCHEMA "tiger";

CREATE EXTENSION IF NOT EXISTS "postgis_topology" WITH SCHEMA "topology";

-- CreateTable
CREATE TABLE "et_prod"."acs_bg_result" (
    "acs_metric_id" INTEGER NOT NULL,
    "acs_segment_id" INTEGER NOT NULL,
    "block_group_id" VARCHAR(20) NOT NULL,
    "metric_value" DECIMAL(60, 30) NOT NULL,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "id" SERIAL NOT NULL,
    "data_source_id" INTEGER NOT NULL,
    CONSTRAINT "acs_bg_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."acs_metric" (
    "acs_metric_id" INTEGER NOT NULL,
    "acs_metric_name" VARCHAR(50) NOT NULL,
    "acs_metric_desc" TEXT,
    "acs_metric_unit" VARCHAR(30) NOT NULL,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "acs_metric_pkey" PRIMARY KEY ("acs_metric_id")
);

-- CreateTable
CREATE TABLE "et_prod"."acs_segment" (
    "acs_segment_id" INTEGER NOT NULL,
    "acs_segment_name" TEXT NOT NULL,
    "acs_segment_desc" TEXT,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "acs_segment_pkey" PRIMARY KEY ("acs_segment_id")
);

-- CreateTable
CREATE TABLE "et_prod"."block_group" (
    "block_group_id" VARCHAR(20) NOT NULL,
    "aland" DECIMAL(60, 30) NOT NULL,
    "blkgrp_coordinates" public.geometry(geometry, 4326) NOT NULL,
    "data_source_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "id" SERIAL NOT NULL,
    CONSTRAINT "block_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."block_group_demand" (
    "block_group_id" VARCHAR(20) NOT NULL,
    "charging_strategy_id" INTEGER NOT NULL,
    "hour_id" SMALLINT NOT NULL,
    "demand_kwh" DECIMAL(60, 30),
    "charging_demand_simulation_id" INTEGER,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "id" SERIAL NOT NULL,
    CONSTRAINT "block_group_demand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."charging_demand_simulation" (
    "id" SERIAL NOT NULL,
    "traffic_model_id" INTEGER NOT NULL,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "charging_demand_simulation_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."charging_demand_simulation_parameters" (
    "id" SERIAL NOT NULL,
    "charging_demand_simulation_id" INTEGER NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "parameter_value" TEXT NOT NULL,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "charging_demand_simulation_parameters_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."charging_station" (
    "id" SERIAL NOT NULL,
    "charger_id" BIGINT,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "l1ports" BIGINT,
    "l2ports" BIGINT,
    "access" TEXT,
    "street_address" TEXT,
    "intersection_directions" TEXT,
    "zip" TEXT,
    "station_phone" TEXT,
    "city" TEXT,
    "dcfastports" BIGINT,
    "evnetwork" TEXT,
    "evrenewablesource" TEXT,
    "expecteddate" TEXT,
    "facilitytype" TEXT,
    "opendate" TEXT,
    "ownertypecode" TEXT,
    "state" TEXT,
    "stationname" TEXT,
    "status" TEXT,
    "evconnectortypes" TEXT,
    "coordinates" public.geometry(Point, 4326) NOT NULL,
    CONSTRAINT "charging_station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."charging_station_bg_avail_power" (
    "chargerID" BIGINT,
    "blockGroupID" TEXT,
    "weight" DOUBLE PRECISION,
    "availablePower-l1" DOUBLE PRECISION,
    "availablePower-l2" DOUBLE PRECISION,
    "availablePower-dc" BIGINT,
    "weighted-ap-l1" DOUBLE PRECISION,
    "weighted-ap-l2" DOUBLE PRECISION,
    "weighted-ap-dc" DOUBLE PRECISION,
    "inserted_by" TEXT,
    "inserted_timestamp" TIMESTAMP(6),
    "updated_by" TEXT,
    "updated_timestamp" TIMESTAMP(6),
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    CONSTRAINT "charging_station_bg_avail_power_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."charging_strategy" (
    "charging_strategy_id" INTEGER NOT NULL,
    "charging_strategy_name" VARCHAR(30) NOT NULL,
    "charging_strategy_desc" TEXT,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "charging_strategy_pkey" PRIMARY KEY ("charging_strategy_id")
);

-- CreateTable
CREATE TABLE "et_prod"."data_source" (
    "id" INTEGER NOT NULL,
    "name" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "retrieval_date" DATE,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "data_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."ev_growth_scenario" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TIMESTAMP(6),
    "owner" INTEGER NOT NULL,
    CONSTRAINT "ev_growth_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."ev_growth_scenario_annual_data" (
    "id" SERIAL NOT NULL,
    "growth_scenario_simulation_parameters_id" INTEGER NOT NULL,
    "scale_year" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "count_of_all_vehicles" BIGINT NOT NULL,
    "count_of_all_vehicles_bought" BIGINT NOT NULL,
    "ev_fraction_of_sales" DECIMAL(5, 4) NOT NULL,
    "ev_fraction_of_all_vehicles" DECIMAL(5, 4) NOT NULL,
    "num_evs" BIGINT NOT NULL,
    "ice_fraction_of_all_vehicles" DECIMAL(5, 4) NOT NULL,
    "num_of_remaining_ice" BIGINT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TIMESTAMP(6),
    CONSTRAINT "ev_growth_scenario_annual_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."ev_growth_scenario_simulation_parameters" (
    "id" SERIAL NOT NULL,
    "ev_growth_scenario_id" INTEGER NOT NULL,
    "vehicle_class_id" INTEGER NOT NULL,
    "initial_num_vehicles" BIGINT NOT NULL,
    "ev_retrofit_rate" DECIMAL(5, 4) NOT NULL,
    "vehicle_population_growth_rate" DECIMAL(5, 4) NOT NULL,
    "scrappage_incentive_size_frac" DECIMAL(5, 4),
    "target_year_market_share_frac" DECIMAL(5, 4),
    "target_year" INTEGER NOT NULL,
    "current_market_share_frac" DECIMAL(5, 4),
    "final_market_share_frac" DECIMAL(5, 4),
    "final_year" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TIMESTAMP(6),
    "scrappage_incentive_program" BOOLEAN,
    "ev_retrofit_incentive_program" BOOLEAN,
    "current_year" INTEGER,
    "start_year" INTEGER,
    "start_year_market_share_frac" DECIMAL(5, 4),
    "scrappage_rate" DECIMAL(5, 4),
    "ev_retrofit_incentive_size_frac" DECIMAL(5, 4),
    CONSTRAINT "ev_growth_scenario_simulation_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "state" VARCHAR(30) NOT NULL,
    "country" VARCHAR(60) NOT NULL,
    "center" public.geometry(Point, 4326) NOT NULL,
    "zoom" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "api_id" TEXT,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "ev_insites_enabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."ngrid_depot" (
    "state" TEXT,
    "unique_id" INTEGER,
    "depot_id" TEXT,
    "depot_owner" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "address3" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "business_name" TEXT,
    "naics_code" INTEGER,
    "sic_code" TEXT,
    "industry_type" TEXT,
    "11L_v_count" DOUBLE PRECISION,
    "21L_v_count" DOUBLE PRECISION,
    "31L_v_count" DOUBLE PRECISION,
    "31M_v_count" DOUBLE PRECISION,
    "32L_v_count" DOUBLE PRECISION,
    "32M_v_count" DOUBLE PRECISION,
    "41H_v_count" DOUBLE PRECISION,
    "41M_v_count" DOUBLE PRECISION,
    "42H_v_count" DOUBLE PRECISION,
    "42M_v_count" DOUBLE PRECISION,
    "43H_v_count" DOUBLE PRECISION,
    "43L_v_count" DOUBLE PRECISION,
    "43M_v_count" DOUBLE PRECISION,
    "51H_v_count" DOUBLE PRECISION,
    "51L_v_count" DOUBLE PRECISION,
    "51M_v_count" DOUBLE PRECISION,
    "52H_v_count" DOUBLE PRECISION,
    "52L_v_count" DOUBLE PRECISION,
    "52M_v_count" DOUBLE PRECISION,
    "53H_v_count" DOUBLE PRECISION,
    "53L_v_count" DOUBLE PRECISION,
    "53M_v_count" DOUBLE PRECISION,
    "54H_v_count" DOUBLE PRECISION,
    "54M_v_count" DOUBLE PRECISION,
    "61H_v_count" DOUBLE PRECISION,
    "61M_v_count" DOUBLE PRECISION,
    "62H_v_count" DOUBLE PRECISION,
    "62M_v_count" DOUBLE PRECISION,
    "geom" public.geometry(Point, 4326),
    "active" BOOLEAN NOT NULL,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    CONSTRAINT "ngrid_depot_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."ngrid_feeder" (
    "state" TEXT,
    "line_type" TEXT,
    "phases" SMALLINT,
    "master_cdf" VARCHAR(25),
    "substation" VARCHAR(8000),
    "voltage__kv" DOUBLE PRECISION,
    "shape_length" DOUBLE PRECISION,
    "shape" public.geometry(MultiLineString, 4326),
    "active" BOOLEAN,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    CONSTRAINT "ngrid_feeder_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."ngrid_feeder_demand" (
    "state" TEXT,
    "master_cdf" VARCHAR(25),
    "simulation_year" INTEGER,
    "unique_id" INTEGER,
    "location_id" TEXT,
    "act_category" VARCHAR,
    "hourid" DOUBLE PRECISION,
    "total_vehicles" DOUBLE PRECISION,
    "total_evs" DOUBLE PRECISION,
    "energy_demand_kwh_summer" DOUBLE PRECISION,
    "energy_demand_kwh_winter" DOUBLE PRECISION,
    "energy_demand_kwh_shoulder" DOUBLE PRECISION,
    "power_demand_kw_summer" INTEGER NOT NULL,
    "power_demand_kw_winter" INTEGER NOT NULL,
    "power_demand_kw_shoulder" INTEGER NOT NULL,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    CONSTRAINT "ngrid_feeder_demand_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."site" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "geom" public.geometry(geometry, 4326) NOT NULL,
    "score" DOUBLE PRECISION,
    "extra" JSONB,
    "site_collection_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TIMESTAMP(6),
    CONSTRAINT "site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."site_collection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "organization_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" TIMESTAMP(6),
    CONSTRAINT "site_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."substation" (
    "id" INTEGER NOT NULL,
    "external_id" INTEGER,
    "name" VARCHAR(54),
    "type" VARCHAR(13),
    "status" VARCHAR(18),
    "county_fips" VARCHAR(13),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "num_lines" INTEGER,
    "max_voltage" INTEGER,
    "min_voltage" INTEGER,
    "max_infer" VARCHAR(1),
    "min_infer" VARCHAR(1),
    "coordinates" public.geometry(Point, 4326) NOT NULL,
    "data_source_id" INTEGER NOT NULL,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "substation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."traffic_model" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location_id" INTEGER NOT NULL,
    "num_vehicles" INTEGER,
    "inserted_by" TEXT NOT NULL,
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "et_prod"."vehicle_class" (
    "vehicle_class_id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "inserted_by" TEXT NOT NULL DEFAULT 'BATCH_INSERT',
    "inserted_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_timestamp" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "act_category" INTEGER,
    CONSTRAINT "vehicle_class_pkey" PRIMARY KEY ("vehicle_class_id")
);

-- CreateIndex
CREATE INDEX "block_group_block_group_id_idx" ON "et_prod"."block_group"("block_group_id");

-- CreateIndex
CREATE INDEX "block_group_geom_idx" ON "et_prod"."block_group" USING GIST ("blkgrp_coordinates");

-- CreateIndex
CREATE INDEX "block_group_demand_block_group_id_idx" ON "et_prod"."block_group_demand"("block_group_id");

-- CreateIndex
CREATE INDEX "block_group_demand_cds_id_idx" ON "et_prod"."block_group_demand"("charging_demand_simulation_id");

-- CreateIndex
CREATE INDEX "ngrid_feeder_demand_hourid_idx" ON "et_prod"."ngrid_feeder_demand"("hourid");

-- CreateIndex
CREATE INDEX "ngrid_feeder_demand_master_cdf_idx" ON "et_prod"."ngrid_feeder_demand"("master_cdf");

-- CreateIndex
CREATE INDEX "ngrid_feeder_demand_simulation_year_idx" ON "et_prod"."ngrid_feeder_demand"("simulation_year");

-- CreateIndex
CREATE INDEX "ngrid_feeder_demand_state_idx" ON "et_prod"."ngrid_feeder_demand"("state");

-- CreateIndex
CREATE INDEX "substation_geom_idx" ON "et_prod"."substation" USING GIST ("coordinates");

-- AddForeignKey
ALTER TABLE
    "et_prod"."acs_bg_result"
ADD
    CONSTRAINT "abr_metric_fk" FOREIGN KEY ("acs_metric_id") REFERENCES "et_prod"."acs_metric"("acs_metric_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "et_prod"."acs_bg_result"
ADD
    CONSTRAINT "abr_segment_fk" FOREIGN KEY ("acs_segment_id") REFERENCES "et_prod"."acs_segment"("acs_segment_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "et_prod"."acs_bg_result"
ADD
    CONSTRAINT "acs_bg_result_data_source_fk" FOREIGN KEY ("data_source_id") REFERENCES "et_prod"."data_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "et_prod"."block_group"
ADD
    CONSTRAINT "bg_src_fk" FOREIGN KEY ("data_source_id") REFERENCES "et_prod"."data_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "et_prod"."block_group_demand"
ADD
    CONSTRAINT "bdg_cs_fk" FOREIGN KEY ("charging_strategy_id") REFERENCES "et_prod"."charging_strategy"("charging_strategy_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "et_prod"."charging_demand_simulation_parameters"
ADD
    CONSTRAINT "charging_demand_simulation_parameters_fk" FOREIGN KEY ("charging_demand_simulation_id") REFERENCES "et_prod"."charging_demand_simulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "et_prod"."site"
ADD
    CONSTRAINT "site_fk" FOREIGN KEY ("site_collection_id") REFERENCES "et_prod"."site_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "et_prod"."substation"
ADD
    CONSTRAINT "substation_fk" FOREIGN KEY ("data_source_id") REFERENCES "et_prod"."data_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Views
CREATE
OR REPLACE VIEW et_prod.v_acs_bg_result AS
SELECT
    abr.acs_metric_id,
    abr.acs_segment_id,
    abr.block_group_id,
    abr.metric_value,
    abr.inserted_by,
    abr.inserted_timestamp,
    abr.updated_by,
    abr.updated_timestamp
FROM
    et_prod.acs_bg_result abr
WHERE
    abr.active = true;

CREATE
OR REPLACE VIEW et_prod.v_acs_metric AS
SELECT
    am.acs_metric_id,
    am.acs_metric_name,
    am.acs_metric_desc,
    am.acs_metric_unit,
    am.inserted_by,
    am.inserted_timestamp,
    am.updated_by,
    am.updated_timestamp
FROM
    et_prod.acs_metric am
WHERE
    am.active = true;

-- et_prod.v_acs_segment source
CREATE
OR REPLACE VIEW et_prod.v_acs_segment AS
SELECT
    acs_s.acs_segment_id,
    acs_s.acs_segment_name,
    acs_s.acs_segment_desc,
    acs_s.inserted_by,
    acs_s.inserted_timestamp,
    acs_s.updated_by,
    acs_s.updated_timestamp
FROM
    et_prod.acs_segment acs_s
WHERE
    acs_s.active = true;

-- et_prod.v_block_group source
CREATE
OR REPLACE VIEW et_prod.v_block_group AS
SELECT
    bg.block_group_id,
    bg.aland,
    bg.blkgrp_coordinates,
    bg.data_source_id,
    bg.inserted_by,
    bg.inserted_timestamp,
    bg.updated_by,
    bg.updated_timestamp
FROM
    et_prod.block_group bg
WHERE
    bg.active = true;

-- et_prod.v_block_group_demand source
CREATE
OR REPLACE VIEW et_prod.v_block_group_demand AS
SELECT
    bgd.block_group_id,
    bgd.charging_strategy_id,
    bgd.hour_id,
    bgd.demand_kwh,
    bgd.charging_demand_simulation_id,
    bgd.inserted_by,
    bgd.inserted_timestamp,
    bgd.updated_by,
    bgd.updated_timestamp
FROM
    et_prod.block_group_demand bgd
WHERE
    bgd.active = true;

-- et_prod.v_charging_demand_simulation source
CREATE
OR REPLACE VIEW et_prod.v_charging_demand_simulation AS
SELECT
    cds.id,
    cds.traffic_model_id,
    cds.inserted_by,
    cds.inserted_timestamp,
    cds.updated_by,
    cds.updated_timestamp
FROM
    et_prod.charging_demand_simulation cds
WHERE
    cds.active = true;

-- et_prod.v_charging_demand_simulation_parameters source
CREATE
OR REPLACE VIEW et_prod.v_charging_demand_simulation_parameters AS
SELECT
    cdsp.id,
    cdsp.charging_demand_simulation_id,
    cdsp.parameter_name,
    cdsp.parameter_value,
    cdsp.inserted_by,
    cdsp.inserted_timestamp,
    cdsp.updated_by,
    cdsp.updated_timestamp
FROM
    et_prod.charging_demand_simulation_parameters cdsp
WHERE
    cdsp.active = true;

-- et_prod.v_charging_station source
CREATE
OR REPLACE VIEW et_prod.v_charging_station AS
SELECT
    cs.id,
    cs.charger_id,
    cs.coordinates,
    cs.l1ports,
    cs.l2ports,
    cs.access,
    cs.street_address,
    cs.intersection_directions,
    cs.zip,
    cs.station_phone,
    cs.city,
    cs.dcfastports,
    cs.evnetwork,
    cs.evrenewablesource,
    cs.expecteddate,
    cs.facilitytype,
    cs.opendate,
    cs.ownertypecode,
    cs.state,
    cs.stationname,
    cs.status,
    cs.evconnectortypes,
    cs.inserted_by,
    cs.inserted_timestamp,
    cs.updated_by,
    cs.updated_timestamp
FROM
    et_prod.charging_station cs
WHERE
    cs.active = true;

-- et_prod.v_charging_strategy source
CREATE
OR REPLACE VIEW et_prod.v_charging_strategy AS
SELECT
    cs.charging_strategy_id,
    cs.charging_strategy_name,
    cs.charging_strategy_desc,
    cs.inserted_by,
    cs.inserted_timestamp,
    cs.updated_by,
    cs.updated_timestamp
FROM
    et_prod.charging_strategy cs
WHERE
    cs.active = true;

-- et_prod.v_data_source source
CREATE
OR REPLACE VIEW et_prod.v_data_source AS
SELECT
    ds.id,
    ds.name,
    ds.year,
    ds.description,
    ds.retrieval_date,
    ds.inserted_by,
    ds.inserted_timestamp,
    ds.updated_by,
    ds.updated_timestamp
FROM
    et_prod.data_source ds
WHERE
    ds.active = true;

-- et_prod.v_depots source
CREATE
OR REPLACE VIEW et_prod.v_depots AS
SELECT
    'NGRID' :: text AS client,
    ngrid_depot.state,
    ngrid_depot.unique_id,
    ngrid_depot.depot_id,
    ngrid_depot.depot_owner,
    ngrid_depot.address1,
    ngrid_depot.address2,
    ngrid_depot.address3,
    ngrid_depot.city,
    ngrid_depot.zip,
    ngrid_depot.business_name,
    ngrid_depot.naics_code,
    ngrid_depot.sic_code,
    ngrid_depot.industry_type,
    ngrid_depot."11L_v_count",
    ngrid_depot."21L_v_count",
    ngrid_depot."31L_v_count",
    ngrid_depot."31M_v_count",
    ngrid_depot."32L_v_count",
    ngrid_depot."32M_v_count",
    ngrid_depot."41H_v_count",
    ngrid_depot."41M_v_count",
    ngrid_depot."42H_v_count",
    ngrid_depot."42M_v_count",
    ngrid_depot."43H_v_count",
    ngrid_depot."43L_v_count",
    ngrid_depot."43M_v_count",
    ngrid_depot."51H_v_count",
    ngrid_depot."51L_v_count",
    ngrid_depot."51M_v_count",
    ngrid_depot."52H_v_count",
    ngrid_depot."52L_v_count",
    ngrid_depot."52M_v_count",
    ngrid_depot."53H_v_count",
    ngrid_depot."53L_v_count",
    ngrid_depot."53M_v_count",
    ngrid_depot."54H_v_count",
    ngrid_depot."54M_v_count",
    ngrid_depot."61H_v_count",
    ngrid_depot."61M_v_count",
    ngrid_depot."62H_v_count",
    ngrid_depot."62M_v_count",
    ngrid_depot.geom
FROM
    et_prod.ngrid_depot
WHERE
    ngrid_depot.active IS TRUE;

-- et_prod.v_ev_growth_scenario source
CREATE
OR REPLACE VIEW et_prod.v_ev_growth_scenario AS
SELECT
    egs.id,
    egs.name,
    egs.description,
    egs.inserted_by,
    egs.inserted_timestamp,
    egs.updated_by,
    egs.updated_timestamp,
    egs.owner
FROM
    et_prod.ev_growth_scenario egs
WHERE
    egs.active = true;

-- et_prod.v_ev_growth_scenario_annual_data source
CREATE
OR REPLACE VIEW et_prod.v_ev_growth_scenario_annual_data AS
SELECT
    egsad.id,
    egsad.growth_scenario_simulation_parameters_id,
    egsad.scale_year,
    egsad.year,
    egsad.count_of_all_vehicles,
    egsad.count_of_all_vehicles_bought,
    egsad.ev_fraction_of_sales,
    egsad.ev_fraction_of_all_vehicles,
    egsad.num_evs,
    egsad.ice_fraction_of_all_vehicles,
    egsad.num_of_remaining_ice,
    egsad.inserted_by,
    egsad.inserted_timestamp,
    egsad.updated_by,
    egsad.updated_timestamp
FROM
    et_prod.ev_growth_scenario_annual_data egsad
WHERE
    egsad.active = true;

-- et_prod.v_ev_growth_scenario_simulation_parameters source
CREATE
OR REPLACE VIEW et_prod.v_ev_growth_scenario_simulation_parameters AS
SELECT
    egssp.id,
    egssp.ev_growth_scenario_id,
    egssp.vehicle_class_id,
    egssp.initial_num_vehicles,
    egssp.ev_retrofit_rate,
    egssp.vehicle_population_growth_rate,
    egssp.target_year_market_share_frac,
    egssp.target_year,
    egssp.current_market_share_frac,
    egssp.final_market_share_frac,
    egssp.final_year,
    egssp.inserted_by,
    egssp.inserted_timestamp,
    egssp.updated_by,
    egssp.updated_timestamp,
    egssp.scrappage_incentive_program,
    egssp.ev_retrofit_incentive_program,
    egssp.current_year,
    egssp.start_year,
    egssp.start_year_market_share_frac,
    egssp.scrappage_incentive_size_frac,
    egssp.scrappage_rate,
    egssp.ev_retrofit_incentive_size_frac
FROM
    et_prod.ev_growth_scenario_simulation_parameters egssp
WHERE
    egssp.active = true;

-- et_prod.v_feeder source
CREATE
OR REPLACE VIEW et_prod.v_feeder AS
SELECT
    nf.state,
    nf.line_type,
    nf.phases,
    nf.master_cdf,
    nf.substation,
    nf.voltage__kv,
    nf.shape_length,
    nf.shape
FROM
    et_prod.ngrid_feeder nf
WHERE
    nf.active IS TRUE;

-- et_prod.v_feeder_demand source
CREATE
OR REPLACE VIEW et_prod.v_feeder_demand AS
SELECT
    vd.client,
    nfd2.state,
    nfd2.master_cdf,
    nfd2.simulation_year,
    nfd2.unique_id,
    nfd2.location_id,
    nfd2.act_category,
    nfd2.hourid,
    nfd2.total_vehicles,
    nfd2.total_evs,
    nfd2.energy_demand_kwh_summer,
    nfd2.energy_demand_kwh_winter,
    nfd2.energy_demand_kwh_shoulder,
    nfd2.power_demand_kw_summer,
    nfd2.power_demand_kw_winter,
    nfd2.power_demand_kw_shoulder
FROM
    et_prod.ngrid_feeder_demand nfd2,
    et_prod.v_depots vd
WHERE
    vd.unique_id = nfd2.unique_id
    AND vd.state = nfd2.state
    AND vd.client = 'NGRID' :: text;

-- et_prod.v_location source
CREATE
OR REPLACE VIEW et_prod.v_location AS
SELECT
    l.id,
    l.name,
    l.description,
    l.state,
    l.country,
    l.center,
    l.zoom,
    l.api_id,
    l.inserted_by,
    l.inserted_timestamp,
    l.updated_by,
    l.updated_timestamp,
    l.ev_insites_enabled
FROM
    et_prod.location l
WHERE
    l.active = true;

-- et_prod.v_site source
CREATE
OR REPLACE VIEW et_prod.v_site AS
SELECT
    s.id,
    s.name,
    s.geom,
    s.score,
    s.extra,
    s.site_collection_id,
    s.inserted_by,
    s.inserted_timestamp,
    s.updated_by,
    s.updated_timestamp
FROM
    et_prod.site s
WHERE
    s.active = true;

-- et_prod.v_site_collection source
CREATE
OR REPLACE VIEW et_prod.v_site_collection AS
SELECT
    sc.id,
    sc.name,
    sc.source,
    sc.organization_id,
    sc.inserted_by,
    sc.inserted_timestamp,
    sc.updated_by,
    sc.updated_timestamp
FROM
    et_prod.site_collection sc
WHERE
    sc.active = true;

-- et_prod.v_substation source
CREATE
OR REPLACE VIEW et_prod.v_substation AS
SELECT
    s.id,
    s.external_id,
    s.name,
    s.type,
    s.status,
    s.county_fips,
    s.latitude,
    s.longitude,
    s.num_lines,
    s.max_voltage,
    s.min_voltage,
    s.max_infer,
    s.min_infer,
    s.coordinates,
    s.data_source_id,
    s.inserted_by,
    s.inserted_timestamp,
    s.updated_by,
    s.updated_timestamp
FROM
    et_prod.substation s
WHERE
    s.active = true;

-- et_prod.v_traffic_model source
CREATE
OR REPLACE VIEW et_prod.v_traffic_model AS
SELECT
    tm.id,
    tm.name,
    tm.description,
    tm.location_id,
    tm.num_vehicles,
    tm.inserted_by,
    tm.inserted_timestamp,
    tm.updated_by,
    tm.updated_timestamp
FROM
    et_prod.traffic_model tm
WHERE
    tm.active = true;

-- et_prod.v_vehicle_class source
CREATE
OR REPLACE VIEW et_prod.v_vehicle_class AS
SELECT
    vc.vehicle_class_id,
    vc.name,
    vc.description,
    vc.inserted_by,
    vc.inserted_timestamp,
    vc.updated_by,
    vc.updated_timestamp,
    vc.act_category
FROM
    et_prod.vehicle_class vc
WHERE
    vc.active = true;