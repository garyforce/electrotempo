const logger = require("winston");
const pool = require("../db.js");
const utils = require("../utils.js");
const authorizeAccessToken = require("../../auth");

module.exports = (app) => {
  const jwtAuthz = require("express-jwt-authz");

  const jwtAuthzOptions = {
    customScopeKey: process.env.AUTH_PERMISSIONS_SCOPE,
  };

  app.get(
    "/site-collections",
    authorizeAccessToken,
    jwtAuthz(["read:site_collections"], jwtAuthzOptions),
    getSiteCollections
  );
  app.get(
    "/sites",
    authorizeAccessToken,
    jwtAuthz(["read:sites"], jwtAuthzOptions),
    getSites
  );
};

async function getSiteCollections(request, response) {
  try {
    const userOrgId = response.locals.userOrgId;
    const text = `SELECT id, name
            FROM et_prod.v_site_collection sc
            WHERE sc.organization_id = $1;`;
    let results = await pool.query(text, [userOrgId]);
    response.status(200).send(results.rows);
    return;
  } catch (error) {
    logger.error(error);
    response.status(500).send({ message: "Unable to retrieve locations" });
    return;
  }
}

async function getSites(request, response) {
  const siteCollectionId = request.query.siteCollectionId;
  const chargingDemandSimulationId = request.query.chargingDemandSimulationId;
  const evNetworks = JSON.parse(decodeURIComponent(request.query.evNetworks));
  const chargerLevels = JSON.parse(
    decodeURIComponent(request.query.chargerLevels)
  );
  const access = JSON.parse(decodeURIComponent(request.query.access));

  const useL1Ports = chargerLevels.includes("l1");
  const useL2Ports = chargerLevels.includes("l2");
  const useDcfPorts = chargerLevels.includes("dcf");
  try {
    const userOrgId = response.locals.userOrgId;

    const text = `
            SELECT *,
                RANK () OVER ( ORDER BY score ASC) score_rank,
                RANK () OVER ( ORDER BY justice_flag ASC) justice_flag_rank,
                RANK () OVER ( ORDER BY charger_coverage DESC) charger_coverage_rank
            FROM (
                SELECT id, "name", score, site_collection_id, justice_flag, extra, st_asgeojson(geom) AS geojson, SUM(charger_coverage) AS charger_coverage
                FROM (
                    SELECT
                        s.id,
                        s."name",
                        s.geom AS geom,
                        s.site_collection_id,
                        s.score AS score,
                        s.extra AS extra,
                        COALESCE(coverage.existing_charger_coverage, 0) AS charger_coverage,
                        CASE
                            WHEN vjdd.sf::text > ''::text THEN 'Y'::text
                            ELSE 'N'::text
                        END AS justice_flag
                    FROM et_prod.v_site s
                    JOIN et_prod.v_block_group bg ON ST_Intersects(s.geom, bg.blkgrp_coordinates)
                    JOIN (
                        SELECT
                            daily_demand.block_group_id,
                            daily_demand.daily_demand_kwh,
                            COALESCE((avail_power.l1_power + avail_power.l2_power + avail_power.dc_power) * 24, 0) AS daily_available_energy_kwh,
                            COALESCE(daily_demand.daily_demand_kwh - ((avail_power.l1_power + avail_power.l2_power + avail_power.dc_power) * 24), 0) AS daily_unfulfilled_demand_kwh,
                            COALESCE((avail_power.l1_power + avail_power.l2_power + avail_power.dc_power) * 24 / daily_demand.daily_demand_kwh, 0) AS existing_charger_coverage
                        FROM (
                            SELECT
                                bgd.block_group_id,
                                SUM(bgd.demand_kwh) AS daily_demand_kwh
                            FROM et_prod.v_block_group_demand bgd
                            JOIN et_prod.v_block_group bg ON bgd.block_group_id = bg.block_group_id 
                            WHERE charging_strategy_id IN (1, 3)
                                AND bgd.charging_demand_simulation_id = $5
                            GROUP BY bgd.block_group_id
                        ) daily_demand
                        LEFT JOIN (
                            SELECT
                                CAST(csbap."blockGroupID" AS varchar(20)) AS block_group_id,
                                ${
                                  useL1Ports
                                    ? 'SUM(csbap."weighted-ap-l1")'
                                    : "0"
                                } AS l1_power,
                                ${
                                  useL2Ports
                                    ? 'SUM(csbap."weighted-ap-l2")'
                                    : "0"
                                } AS l2_power,
                                ${
                                  useDcfPorts
                                    ? 'SUM(csbap."weighted-ap-dc")'
                                    : "0"
                                } AS dc_power
                            FROM et_prod.charging_station_bg_avail_power csbap
                            JOIN et_prod.v_charging_station vcs ON vcs.charger_id = csbap."chargerID"
                            WHERE vcs.evnetwork = ANY($3::text[])
                                AND vcs.access = ANY($4::text[])
                            GROUP BY csbap."blockGroupID"
                        ) avail_power ON daily_demand.block_group_id = avail_power.block_group_id
                    ) coverage ON coverage.block_group_id = bg.block_group_id
                    LEFT JOIN et_seco.mv_j40_dashboard_data vjdd ON ST_Intersects(s.geom, vjdd.geom)
                    JOIN et_prod.v_site_collection sc ON sc.id = s.site_collection_id
                    WHERE sc.id = $1
                    AND sc.organization_id = $2
                ) AS subtable_b
                GROUP BY id, "name", score, site_collection_id, justice_flag, extra, geojson
            ) xyz;`;
    let result = await pool.query(text, [
      siteCollectionId,
      userOrgId,
      evNetworks,
      access,
      chargingDemandSimulationId,
    ]);
    let featureCollection = {
      type: "FeatureCollection",
      features: [],
    };
    result.rows.forEach((row) => {
      let feature = {
        type: "Feature",
        properties: {
          id: row.id,
          name: row.name,
          score: Number(row.score),
          scoreRank: Number(row.score_rank),
          siteCollectionId: Number(siteCollectionId),
          chargerCoverage: Number(row.charger_coverage),
          chargerCoverageRank: Number(row.charger_coverage_rank),
          justiceFlag: row.justice_flag,
          justiceFlagRank: Number(row.justice_flag_rank),
          extra: row.extra,
        },
      };
      feature.geometry = JSON.parse(row.geojson);
      featureCollection.features.push(feature);
    });
    response.status(200).send(featureCollection);
    return;
  } catch (error) {
    logger.error(error);
    response.status(500).send({ message: "Unable to retrieve locations" });
    return;
  }
}
