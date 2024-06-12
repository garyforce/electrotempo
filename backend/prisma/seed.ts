import { PrismaClient } from "@prisma/client";
import { acsBgResults } from "./seed-data/acs-bg-results";
import { acsMetrics } from "./seed-data/acs-metrics";
import { acsSegments } from "./seed-data/acs-segments";
import { blockGroupDemand } from "./seed-data/block-group-demand";
import { blockGroups } from "./seed-data/block-groups";
import { chargers } from "./seed-data/chargers";
import { chargingDemandSimulationParameters } from "./seed-data/charging-demand-simulation-parameters";
import { chargingDemandSimulations } from "./seed-data/charging-demand-simulations";
import { chargingStationBGAvailPower } from "./seed-data/charging-station-bg-avail-power";
import { chargingStations } from "./seed-data/charging-stations";
import { chargingStrategies } from "./seed-data/charging-strategies";
import { dataSources } from "./seed-data/data-sources";
import { energyConsumptionLevels } from "./seed-data/energy-consumption-levels";
import { growthScenarioAnnualData } from "./seed-data/growth-scenario-annual-data";
import { growthScenarioSimulationParameters } from "./seed-data/growth-scenario-simulation-parameters";
import { growthScenario } from "./seed-data/growth-scenarios";
import { arrivalRates } from "./seed-data/hub/arrival-rates";
import { chargers as hubChargers } from "./seed-data/hub/chargers";
import { fleetArrivals } from "./seed-data/hub/fleet-arrivals";
import { scenarioYears } from "./seed-data/hub/scenario-years";
import { scenarios } from "./seed-data/hub/scenarios";
import { siteVehicles } from "./seed-data/hub/site-vehicles";
import { sites as hubSites } from "./seed-data/hub/sites";
import { utilities as hubUtilities } from "./seed-data/hub/utilities";
import { utilityRates as hubUtilityRates } from "./seed-data/hub/utility-rates";
import { vehicleTypes as hubVehicleTypes } from "./seed-data/hub/vehicle-types";
import {
  atlanta,
  austinEnergy,
  cps,
  firstEnergy,
  houston,
  lcra,
  nbu,
  newYork,
  txPPC,
  california,
  newJersey,
} from "./seed-data/locations";
import { ngridDepots } from "./seed-data/ngrid-depots";
import { ngridFeederDemand } from "./seed-data/ngrid-feeder-demand";
import { ngridFeeders } from "./seed-data/ngrid-feeders";
import { properties } from "./seed-data/properties";
import { siteCollections } from "./seed-data/site-collections";
import { sites } from "./seed-data/sites";
import { substations } from "./seed-data/substations";
import { terminalEnergyDatapoints } from "./seed-data/terminal/terminal-energy-demand-datapoints";
import { terminalFacilities } from "./seed-data/terminal/terminal-facilities";
import { terminalScenarioVehicles } from "./seed-data/terminal/terminal-scenario-vehicles";
import { terminalScenarios } from "./seed-data/terminal/terminal-scenarios";
import { terminalVehicleStatusDatapoints } from "./seed-data/terminal/terminal-vehicle-status-datapoints";
import { trafficModel } from "./seed-data/traffic-models";
import { utilities } from "./seed-data/utilities";
import { utilityRates } from "./seed-data/utility-rates";
import { vehicleClasses } from "./seed-data/vehicle-classes";
import { vehicleStatuses } from "./seed-data/vehicle-statuses";
import { vehicleTypes } from "./seed-data/vehicle-types";
import { vehicles } from "./seed-data/vehicles";
import { terminalScenarioStatuses } from "./seed-data/terminal/terminal-scenario-statuses";
import { organizations } from "./seed-data/auth/organizations";

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.createMany({
    data: organizations,
  });

  // The charger_stations table should have a location_id column already, making the adjustment in demo data
  await prisma.$queryRaw`
    ALTER TABLE et_prod.charging_station ADD COLUMN IF NOT EXISTS location_id int4 NULL;
  `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${houston.id},
      ${houston.name},
      ${houston.description},
      ${houston.state},
      ${houston.country},
      ${houston.center},
      ${houston.zoom},
      ${houston.insertedBy},
      ${houston.evInsitesEnabled}
    )
  `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${atlanta.id},
      ${atlanta.name},
      ${atlanta.description},
      ${atlanta.state},
      ${atlanta.country},
      ${atlanta.center},
      ${atlanta.zoom},
      ${atlanta.insertedBy},
      ${atlanta.evInsitesEnabled}
    )
  `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${newYork.id},
      ${newYork.name},
      ${newYork.description},
      ${newYork.state},
      ${newYork.country},
      ${newYork.center},
      ${newYork.zoom},
      ${newYork.insertedBy},
      ${newYork.evInsitesEnabled}
    )
    `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${txPPC.id},
      ${txPPC.name},
      ${txPPC.description},
      ${txPPC.state},
      ${txPPC.country},
      ${txPPC.center},
      ${txPPC.zoom},
      ${txPPC.insertedBy},
      ${txPPC.evInsitesEnabled}
    )
    `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${cps.id},
      ${cps.name},
      ${cps.description},
      ${cps.state},
      ${cps.country},
      ${cps.center},
      ${cps.zoom},
      ${cps.insertedBy},
      ${cps.evInsitesEnabled}
    )
    `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${nbu.id},
      ${nbu.name},
      ${nbu.description},
      ${nbu.state},
      ${nbu.country},
      ${nbu.center},
      ${nbu.zoom},
      ${nbu.insertedBy},
      ${nbu.evInsitesEnabled}
    )
    `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${lcra.id},
      ${lcra.name},
      ${lcra.description},
      ${lcra.state},
      ${lcra.country},
      ${lcra.center},
      ${lcra.zoom},
      ${lcra.insertedBy},
      ${lcra.evInsitesEnabled}
    )
    `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${austinEnergy.id},
      ${austinEnergy.name},
      ${austinEnergy.description},
      ${austinEnergy.state},
      ${austinEnergy.country},
      ${austinEnergy.center},
      ${austinEnergy.zoom},
      ${austinEnergy.insertedBy},
      ${austinEnergy.evInsitesEnabled}
    )
    `;

  await prisma.$queryRaw`
    INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
    VALUES (
      ${firstEnergy.id},
      ${firstEnergy.name},
      ${firstEnergy.description},
      ${firstEnergy.state},
      ${firstEnergy.country},
      ${firstEnergy.center},
      ${firstEnergy.zoom},
      ${firstEnergy.insertedBy},
      ${firstEnergy.evInsitesEnabled}
    )
    `;
  await prisma.$queryRaw`
  INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
  VALUES (
    ${california.id},
    ${california.name},
    ${california.description},
    ${california.state},
    ${california.country},
    ${california.center},
    ${california.zoom},
    ${california.insertedBy},
    ${california.evInsitesEnabled}
  )
  `;

  await prisma.$queryRaw`
INSERT INTO "location" (id, name, description, state, country, center, zoom, inserted_by, ev_insites_enabled)
VALUES (
  ${newJersey.id},
  ${newJersey.name},
  ${newJersey.description},
  ${newJersey.state},
  ${newJersey.country},
  ${newJersey.center},
  ${newJersey.zoom},
  ${newJersey.insertedBy},
  ${newJersey.evInsitesEnabled}
)
`;
  await prisma.data_source.createMany({
    data: dataSources,
  });

  blockGroups.forEach(async (blockGroup) => {
    await prisma.$queryRaw`
      INSERT INTO "block_group" (block_group_id, aland, blkgrp_coordinates, data_source_id, id, inserted_by)
      VALUES (
        ${blockGroup.block_group_id},
        ${blockGroup.aland},
        ${blockGroup.blkgrp_coordinates},
        ${blockGroup.data_source_id},
        ${blockGroup.id},
        ${blockGroup.inserted_by}
      )
    `;
  });

  await prisma.traffic_model.createMany({
    data: trafficModel,
  });

  await prisma.vehicle_class.createMany({
    data: vehicleClasses,
  });

  await prisma.evGrowthScenario.createMany({
    data: growthScenario,
  });

  await prisma.evGrowthScenarioSimulationParameters.createMany({
    data: growthScenarioSimulationParameters,
  });

  await prisma.evGrowthScenarioAnnualData.createMany({
    data: growthScenarioAnnualData,
  });

  await prisma.charging_demand_simulation.createMany({
    data: chargingDemandSimulations,
  });

  await prisma.charging_demand_simulation_parameters.createMany({
    data: chargingDemandSimulationParameters,
  });

  await prisma.charging_strategy.createMany({
    data: chargingStrategies,
  });

  await prisma.block_group_demand.createMany({
    data: blockGroupDemand,
  });

  await prisma.acs_metric.createMany({
    data: acsMetrics,
  });

  await prisma.acs_segment.createMany({
    data: acsSegments,
  });

  await prisma.acs_bg_result.createMany({
    data: acsBgResults,
  });

  chargingStations.forEach(async (chargingStation) => {
    await prisma.$queryRaw`
      INSERT INTO "charging_station" (id,charger_id,inserted_by,l1ports,l2ports,access,street_address,intersection_directions,zip,station_phone,city,dcfastports,evnetwork,evrenewablesource,expecteddate,facilitytype,opendate,ownertypecode,state,stationname,status,evconnectortypes,coordinates)
      VALUES (
        ${chargingStation.id},
        ${chargingStation.charger_id},
        ${chargingStation.inserted_by},
        ${chargingStation.l1ports},
        ${chargingStation.l2ports},
        ${chargingStation.access},
        ${chargingStation.street_address},
        ${chargingStation.intersection_directions},
        ${chargingStation.zip},
        ${chargingStation.station_phone},
        ${chargingStation.city},
        ${chargingStation.dcfastports},
        ${chargingStation.evnetwork},
        ${chargingStation.evrenewablesource},
        ${chargingStation.expecteddate},
        ${chargingStation.facilitytype},
        ${chargingStation.opendate},
        ${chargingStation.ownertypecode},
        ${chargingStation.state},
        ${chargingStation.stationname},
        ${chargingStation.status},
        ${chargingStation.evconnectortypes},
        ${chargingStation.coordinates}
      )
    `;
  });

  await prisma.charging_station_bg_avail_power.createMany({
    data: chargingStationBGAvailPower,
  });

  ngridDepots.forEach(async (ngridDepot) => {
    // floats require some trimming to be inserted.
    // Prisma bug: https://github.com/prisma/prisma/issues/16611
    await prisma.$queryRaw`
      INSERT INTO "ngrid_depot" ("state","unique_id","depot_id","depot_owner","address1","address2","address3","city","zip","business_name","naics_code","sic_code","industry_type","11L_v_count","21L_v_count","31L_v_count","31M_v_count","32L_v_count","32M_v_count","41H_v_count","41M_v_count","42H_v_count","42M_v_count","43H_v_count","43L_v_count","43M_v_count","51H_v_count","51L_v_count","51M_v_count","52H_v_count","52L_v_count","52M_v_count","53H_v_count","53L_v_count","53M_v_count","54H_v_count","54M_v_count","61H_v_count","61M_v_count","62H_v_count","62M_v_count","geom","active","id")
      VALUES (
        ${ngridDepot.state},
        ${ngridDepot.unique_id},
        ${ngridDepot.depot_id},
        ${ngridDepot.depot_owner},
        ${ngridDepot.address1},
        ${ngridDepot.address2},
        ${ngridDepot.address3},
        ${ngridDepot.city},
        ${ngridDepot.zip},
        ${ngridDepot.business_name},
        ${ngridDepot.naics_code},
        ${ngridDepot.sic_code},
        ${ngridDepot.industry_type},
        ${ngridDepot["11L_v_count"].toFixed(6)}::float,
        ${ngridDepot["21L_v_count"].toFixed(6)}::float,
        ${ngridDepot["31L_v_count"].toFixed(6)}::float,
        ${ngridDepot["31M_v_count"].toFixed(6)}::float,
        ${ngridDepot["32L_v_count"].toFixed(6)}::float,
        ${ngridDepot["32M_v_count"].toFixed(6)}::float,
        ${ngridDepot["41H_v_count"].toFixed(6)}::float,
        ${ngridDepot["41M_v_count"].toFixed(6)}::float,
        ${ngridDepot["42H_v_count"].toFixed(6)}::float,
        ${ngridDepot["42M_v_count"].toFixed(6)}::float,
        ${ngridDepot["43H_v_count"].toFixed(6)}::float,
        ${ngridDepot["43L_v_count"].toFixed(6)}::float,
        ${ngridDepot["43M_v_count"].toFixed(6)}::float,
        ${ngridDepot["51H_v_count"].toFixed(6)}::float,
        ${ngridDepot["51L_v_count"].toFixed(6)}::float,
        ${ngridDepot["51M_v_count"].toFixed(6)}::float,
        ${ngridDepot["52H_v_count"].toFixed(6)}::float,
        ${ngridDepot["52L_v_count"].toFixed(6)}::float,
        ${ngridDepot["52M_v_count"].toFixed(6)}::float,
        ${ngridDepot["53H_v_count"].toFixed(6)}::float,
        ${ngridDepot["53L_v_count"].toFixed(6)}::float,
        ${ngridDepot["53M_v_count"].toFixed(6)}::float,
        ${ngridDepot["54H_v_count"].toFixed(6)}::float,
        ${ngridDepot["54M_v_count"].toFixed(6)}::float,
        ${ngridDepot["61H_v_count"].toFixed(6)}::float,
        ${ngridDepot["61M_v_count"].toFixed(6)}::float,
        ${ngridDepot["62H_v_count"].toFixed(6)}::float,
        ${ngridDepot["62M_v_count"].toFixed(6)}::float,
        ${ngridDepot.geom},
        ${ngridDepot.active},
        ${ngridDepot.id}::UUID
      )
    `;
  });

  ngridFeeders.forEach(async (ngridFeeder) => {
    await prisma.$queryRaw`
      INSERT INTO "ngrid_feeder" ("state","line_type", "phases", "master_cdf", "substation", "voltage__kv", "shape_length", "shape", active, id)
      VALUES (
        ${ngridFeeder.state},
        ${ngridFeeder.line_type},
        ${ngridFeeder.phases},
        ${ngridFeeder.master_cdf},
        ${ngridFeeder.substation},
        ${ngridFeeder.voltage__kv.toFixed(6)}::float,
        ${ngridFeeder.shape_length.toFixed(6)}::float,
        ${ngridFeeder.shape},
        ${ngridFeeder.active},
        ${ngridFeeder.id}::UUID
      )
    `;
  });

  await prisma.ngrid_feeder_demand.createMany({
    data: ngridFeederDemand,
  });

  await prisma.site_collection.createMany({
    data: siteCollections,
  });

  sites.forEach(async (site) => {
    await prisma.$queryRaw`
      INSERT INTO "site" (id, name, geom, score, extra, site_collection_id, inserted_by)
      VALUES (
        ${site.id},
        ${site.name},
        ${site.geom},
        ${site.score},
        ${site.extra},
        ${site.site_collection_id},
        ${site.inserted_by}
      )
    `;
  });

  substations.forEach(async (substation) => {
    await prisma.$queryRaw`
      INSERT INTO "substation" (id, external_id, name, type, status, county_fips, latitude, longitude, num_lines, max_voltage, min_voltage, max_infer, min_infer, coordinates, data_source_id, inserted_by)
      VALUES (
        ${substation.id},
        ${substation.external_id},
        ${substation.name},
        ${substation.type},
        ${substation.status},
        ${substation.county_fips},
        ${substation.latitude},
        ${substation.longitude},
        ${substation.num_lines},
        ${substation.max_voltage},
        ${substation.min_voltage},
        ${substation.max_infer},
        ${substation.min_infer},
        ${substation.coordinates},
        ${substation.data_source_id},
        ${substation.inserted_by}
      )
    `;
  });

  await prisma.hubCharger.createMany({
    data: hubChargers,
  });

  await prisma.hubVehicleType.createMany({
    data: hubVehicleTypes,
  });

  await prisma.hubUtility.createMany({
    data: hubUtilities,
  });

  await prisma.hubSite.createMany({
    data: hubSites,
  });

  await prisma.hubUtilityRate.createMany({
    data: hubUtilityRates,
  });

  await prisma.hubScenario.createMany({
    data: scenarios,
  });

  await prisma.hubScenarioYear.createMany({
    data: scenarioYears,
  });

  await prisma.hubArrivalRate.createMany({
    data: arrivalRates,
  });

  await prisma.hubSiteVehicle.createMany({
    data: siteVehicles,
  });

  await prisma.hubFleetArrival.createMany({
    data: fleetArrivals,
  });

  await prisma.utility.createMany({
    data: utilities,
  });

  await prisma.utilityRate.createMany({
    data: utilityRates,
  });

  await prisma.vehicleStatuses.createMany({
    data: vehicleStatuses,
  });

  await prisma.vehicleTypes.createMany({
    data: vehicleTypes,
  });

  await prisma.property.createMany({
    data: properties,
  });

  await prisma.energyConsumptionLevel.createMany({
    data: energyConsumptionLevels,
  });

  await prisma.charger.createMany({
    data: chargers,
  });

  await prisma.vehicle.createMany({
    data: vehicles,
  });

  await prisma.terminalFacility.createMany({
    data: terminalFacilities,
  });

  await prisma.terminalScenario.createMany({
    data: terminalScenarios,
  });

  await prisma.terminalScenarioVehicle.createMany({
    data: terminalScenarioVehicles,
  });

  await prisma.terminalEnergyDemandDatapoint.createMany({
    data: terminalEnergyDatapoints,
  });

  await prisma.terminalVehicleStatusDatapoint.createMany({
    data: terminalVehicleStatusDatapoints,
  });

  await prisma.terminalScenarioStatus.createMany({
    data: terminalScenarioStatuses,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
