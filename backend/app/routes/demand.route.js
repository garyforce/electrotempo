const logger = require("winston");
const pool = require("../db.js");
const { getBlockGroupDemands } = require("../controllers/demand.controller");

module.exports = (app) => {
  // Retrieve a block group demand for a single simulation
  app.get("/demand", getBlockGroupDemands);

  // Get existing charger coverage
  app.get("/charging-capacity", getChargingCapacity);
};

async function getChargingCapacity(request, response) {
  const chargingDemandSimulationId = request.query.chargingDemandSimulationId;
  const evNetworks = JSON.parse(decodeURIComponent(request.query.evNetworks));
  const chargerLevels = JSON.parse(
    decodeURIComponent(request.query.chargerLevels)
  );
  const access = JSON.parse(decodeURIComponent(request.query.access));

  const useL1Ports = chargerLevels.includes("l1");
  const useL2Ports = chargerLevels.includes("l2");
  const useDcfPorts = chargerLevels.includes("dcf");
  const text = `
        SELECT
            daily_demand.block_group_id,
            COALESCE((avail_power.l1_power + avail_power.l2_power + avail_power.dc_power) * 24, 0) AS daily_charging_capacity_kwh
        FROM (
            SELECT
                bgd.block_group_id,
                SUM(bgd.demand_kwh) AS daily_demand_kwh
            FROM et_prod.v_block_group_demand bgd
            JOIN et_prod.v_block_group bg ON bgd.block_group_id = bg.block_group_id 
            WHERE charging_strategy_id IN (1, 3)
                AND bgd.charging_demand_simulation_id = $1
            GROUP BY bgd.block_group_id
        ) daily_demand
        LEFT JOIN (
            SELECT
                CAST(csbap."blockGroupID" AS varchar(20)) AS block_group_id,
                ${useL1Ports ? 'SUM(csbap."weighted-ap-l1")' : "0"} AS l1_power,
                ${useL2Ports ? 'SUM(csbap."weighted-ap-l2")' : "0"} AS l2_power,
                ${useDcfPorts ? 'SUM(csbap."weighted-ap-dc")' : "0"} AS dc_power
            FROM et_prod.charging_station_bg_avail_power csbap
            JOIN et_prod.v_charging_station vcs ON vcs.charger_id = csbap."chargerID"
            WHERE vcs.evnetwork = ANY($2::text[])
                AND vcs.access = ANY($3::text[])
            GROUP BY csbap."blockGroupID"
        ) avail_power ON daily_demand.block_group_id = avail_power.block_group_id;`;
  const values = [chargingDemandSimulationId, evNetworks, access];
  try {
    const result = await pool.query(text, values);
    response.status(200).send(result.rows);
  } catch (error) {
    logger.error(error);
    response.status(500).send({ message: "Internal server error" });
  }
}
