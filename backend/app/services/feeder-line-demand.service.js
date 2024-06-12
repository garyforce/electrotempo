const pool = require("../db");
const { flattenTemplateString } = require("../utils");

async function get(feederLineId, year, hour, stateAbbr) {
  const conditions = [];
  const values = [];
  let valueIndex = 1;
  if (feederLineId !== undefined) {
    conditions.push(`master_cdf = $${valueIndex}`);
    values.push(feederLineId);
    valueIndex++;
  }
  if (year !== undefined) {
    conditions.push(`simulation_year = $${valueIndex}`);
    values.push(year);
    valueIndex++;
  }
  if (hour !== undefined) {
    // hours in DB are 1-24; 24 is midnight. API accepts/retuns 0-23
    conditions.push(`hourid::int % 24 = $${valueIndex}`);
    values.push(hour);
    valueIndex++;
  }
  if (stateAbbr !== undefined) {
    conditions.push(`state = $${valueIndex}`);
    values.push(stateAbbr);
    valueIndex++;
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const query = `SELECT
      master_cdf as feeder_line_id,
      hourid,
      simulation_year,
      SUM(energy_demand_kwh_summer) AS energy_demand_kwh_summer,
      SUM(energy_demand_kwh_winter) AS energy_demand_kwh_winter,
      SUM(energy_demand_kwh_shoulder) AS energy_demand_kwh_shoulder,
      SUM(power_demand_kw_summer) AS power_demand_kw_summer,
      SUM(power_demand_kw_winter) AS power_demand_kw_winter,
      SUM(power_demand_kw_shoulder) AS power_demand_kw_shoulder
    FROM et_prod.v_feeder_demand_qad_v2 nfd2 
    ${conditions.length > 0 ? whereClause : ""}
    GROUP BY master_cdf, hourid, simulation_year;`;
  const results = await pool.query(flattenTemplateString(query), values);
  const parsedResults = results.rows.map((row) => {
    return {
      feeder_line_id: row.feeder_line_id,
      hourid: Number(row.hourid) % 24,
      // hours in DB are 1-24; 24 is midnight. API accepts/returns 0-23
      energy_demand_kwh_summer: Number(row.energy_demand_kwh_summer),
      energy_demand_kwh_winter: Number(row.energy_demand_kwh_winter),
      energy_demand_kwh_shoulder: Number(row.energy_demand_kwh_shoulder),
      power_demand_kw_summer: Number(row.power_demand_kw_summer),
      power_demand_kw_winter: Number(row.power_demand_kw_winter),
      power_demand_kw_shoulder: Number(row.power_demand_kw_shoulder),
    };
  });
  return parsedResults;
}

module.exports = {
  get,
};
