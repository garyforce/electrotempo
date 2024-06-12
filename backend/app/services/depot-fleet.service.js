const pool = require("../db");
const { flattenTemplateString } = require("../utils");

async function get(depotId, year) {
  const conditions = [];
  const values = [];
  let valueIndex = 1;
  if (depotId !== undefined) {
    conditions.push(`unique_id = $${valueIndex}`);
    values.push(depotId);
    valueIndex++;
  }
  if (year !== undefined) {
    conditions.push(`simulation_year = $${valueIndex}`);
    values.push(year);
    valueIndex++;
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const query = `SELECT
      unique_id,
      SUM(total_vehicles) AS total_vehicles,
      x.total_evs,
      x.act_category,
      vvc."name" AS vehicle_class_name,
      simulation_year
    FROM (
      SELECT DISTINCT
        unique_id,
        act_category,
        total_vehicles,
        total_evs,
        simulation_year
      FROM et_prod.v_feeder_demand_qad_v2 vfd
      ${conditions.length > 0 ? whereClause : ""}
    ) x
    JOIN et_prod.v_vehicle_class vvc ON vvc.act_category = x.act_category::int
    GROUP BY unique_id, x.act_category, vvc."name", simulation_year, x.total_evs;`;
  const results = await pool.query(flattenTemplateString(query), values);

  const parsedResults = results.rows.map((row) => {
    return {
      depotId: row.unique_id,
      actCategory: row.act_category,
      vehicleClassName: row.vehicle_class_name,
      simulationYear: row.simulation_year,
      totalVehicles: Number(row.total_vehicles),
      totalEvs: Number(row.total_evs),
    };
  });

  return parsedResults;
}

async function getByState(depotId, year, stateAbbreviation) {
  const conditions = [];
  const values = [];
  let valueIndex = 1;
  if (depotId !== undefined) {
    conditions.push(`unique_id = $${valueIndex}`);
    values.push(depotId);
    valueIndex++;
  }
  if (year !== undefined) {
    conditions.push(`simulation_year = $${valueIndex}`);
    values.push(year);
    valueIndex++;
  }
  if (stateAbbreviation !== undefined) {
    conditions.push(`state = $${valueIndex}`);
    values.push(stateAbbreviation);
    valueIndex++;
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const query = `SELECT
      unique_id,
      state,
      SUM(total_vehicles) AS total_vehicles,
      x.total_evs,
      x.act_category,
      vvc."name" AS vehicle_class_name,
      simulation_year
    FROM (
      SELECT DISTINCT
        unique_id,
        state,
        act_category,
        total_vehicles,
        total_evs,
        simulation_year
      FROM et_prod.v_feeder_demand_qad_v2 vfd
      ${conditions.length > 0 ? whereClause : ""}
    ) x
    JOIN et_prod.v_vehicle_class vvc ON vvc.act_category = x.act_category::int
    GROUP BY unique_id, state, x.act_category, vvc."name", simulation_year, x.total_evs;`;
  const results = await pool.query(flattenTemplateString(query), values);

  const parsedResults = results.rows.map((row) => {
    return {
      depotId: row.unique_id,
      state: row.state,
      actCategory: row.act_category,
      vehicleClassName: row.vehicle_class_name,
      simulationYear: row.simulation_year,
      totalVehicles: Number(row.total_vehicles),
      totalEvs: Number(row.total_evs),
    };
  });

  return parsedResults;
}

module.exports = {
  get,
  getByState,
};
