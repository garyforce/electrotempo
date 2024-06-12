const logger = require("winston");
const authorizeAccessToken = require("../../auth.js");
const pool = require("../db.js");

module.exports = (app) => {
  const jwtAuthz = require("express-jwt-authz");

  const jwtAuthzOptions = {
    customScopeKey: process.env.AUTH_PERMISSIONS_SCOPE,
  };
  app.use("/substations", authorizeAccessToken);

  app.get(
    "/substations",
    jwtAuthz(["read:substations"], jwtAuthzOptions),
    getSubstations
  );
};

async function getSubstations(request, response) {
  let trafficModelId = request.query.trafficModelId;
  const text = `SELECT ST_AsGeoJSON(vs.*)
    FROM
        et_prod.v_substation vs
    JOIN et_prod.v_block_group vbg ON ST_Within(vs.coordinates, vbg.blkgrp_coordinates)
    AND vbg.block_group_id IN (
        SELECT DISTINCT vbgd.block_group_id
        FROM et_prod.v_block_group_demand vbgd
        JOIN et_prod.v_charging_demand_simulation vcds ON vcds.id = vbgd.charging_demand_simulation_id
        WHERE vcds.traffic_model_id = $1);`;
  const values = [trafficModelId];
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Credentials", true);
  response.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  try {
    const results = await pool.query(text, values);
    let featureCollection = {
      type: "FeatureCollection",
      features: results.rows.map((e) => JSON.parse(e.st_asgeojson)),
    };
    response.status(200).send(featureCollection);
  } catch (error) {
    logger.error(error);
    response.status(500).send({ message: "Internal server error" });
  }
}
