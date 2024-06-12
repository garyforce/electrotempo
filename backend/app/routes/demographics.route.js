const logger = require("winston");
const pool = require("../db.js");
const utils = require("../utils.js");
const authorizeAccessToken = require("../../auth");

module.exports = (app) => {
  app.use("/demographics", authorizeAccessToken);
  app.get("/demographics", getDemographicsData);
};

async function getDemographicsData(request, response) {
  const trafficModelId = request.query.trafficModelId;
  const acsMetricId = request.query.acsMetricId;
  const acsSegmentId = request.query.acsSegmentId;
  const values = [acsMetricId, acsSegmentId, trafficModelId];

  const invert = request.query.invert === "true" ? true : false;
  try {
    let result;
    if (invert) {
      const text = `SELECT DISTINCT acs.block_group_id, 1-metric_value AS metric_value
            FROM et_prod.v_acs_bg_result acs
            JOIN et_prod.v_block_group_demand bgd ON bgd.block_group_id = acs.block_group_id
            JOIN et_prod.v_charging_demand_simulation cds ON cds.id = bgd.charging_demand_simulation_id 
            WHERE acs_metric_id = $1
                AND cds.traffic_model_id = $3
                AND acs_segment_id = $2;`;
      result = await pool.query(text, values);
    } else {
      const text = `SELECT DISTINCT acs.block_group_id, metric_value
            FROM et_prod.v_acs_bg_result acs
            JOIN et_prod.v_block_group_demand bgd ON bgd.block_group_id = acs.block_group_id
            JOIN et_prod.v_charging_demand_simulation cds ON cds.id = bgd.charging_demand_simulation_id 
            WHERE acs_metric_id = $1
                AND cds.traffic_model_id = $3
                AND acs_segment_id = $2;`;
      result = await pool.query(text, values);
    }
    response.status(200).send(result.rows);
  } catch (error) {
    logger.error(error);
    response.status(500).send({ message: "Internal server error" });
  }
}
