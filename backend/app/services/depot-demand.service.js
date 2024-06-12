const pool = require("../db");
const { flattenTemplateString } = require("../utils");


async function get(depotId, year, hour, stateAbbr, scenarioId) {
  const conditions = [];
  const values = [];
  let parsedResults;
  let valueIndex = 1;
  const isTxPPC = ["TX", "CPS", "NBU", "LCRA", "AE"].includes(
    stateAbbr
  );
  const isFirstEnergy = ["FIRST_ENERGY"].includes(
    stateAbbr
  );

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
  if (hour !== undefined && typeof hour !== "string") {
    // hours in DB are 1-24; 24 is midnight. API accepts/retuns 0-23
    conditions.push(`hourid::int % 24 = $${valueIndex}`);
    values.push(hour);
    valueIndex++;
  }
  if (stateAbbr !== undefined && (!isTxPPC && !isFirstEnergy)) {
    conditions.push(`state = $${valueIndex}`);
    values.push(stateAbbr);
    valueIndex++;
  }
  if (scenarioId !== undefined && (isTxPPC || isFirstEnergy)) {
    conditions.push(`scenario_id = $${valueIndex}`);
    values.push(scenarioId);
    valueIndex++;
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  if (isTxPPC || isFirstEnergy) {

    let hourlyTableName, dailyTableName;
    if (isTxPPC) {
      hourlyTableName = 'et_texas.hourly_power_energy_apr4';
      dailyTableName = 'et_texas.daily_power_energy_apr4';
    } else {
      hourlyTableName = 'et_pa.hourly_power_energy_apr4';
      dailyTableName = 'et_pa.daily_power_energy_apr4';
    }

    if (hour === "all") {
      const query =
        `
      SELECT 
          unique_id AS depot_id,
          simulation_year,
          scenario_id,
          power_demand_kw_summer,
          power_demand_kw_winter,
          power_demand_kw_shoulder,
          energy_demand_kwh_summer,
          energy_demand_kwh_winter,
          energy_demand_kwh_shoulder
      FROM ${dailyTableName}
      ${conditions.length > 0 ? whereClause : ""}`;

      const results = await pool.query(flattenTemplateString(query), values);
      parsedResults = results.rows.map((row) => {
        return {
          depot_id: row.depot_id,
          simulation_year: row.simulation_year,
          energy_demand_kwh_summer: Number(row.energy_demand_kwh_summer),
          energy_demand_kwh_winter: Number(row.energy_demand_kwh_winter),
          energy_demand_kwh_shoulder: Number(row.energy_demand_kwh_shoulder),
          power_demand_kw_summer: Number(row.power_demand_kw_summer),
          power_demand_kw_winter: Number(row.power_demand_kw_winter),
          power_demand_kw_shoulder: Number(row.power_demand_kw_shoulder),
        };
      });
    } else {
      const query =
        `  
        SELECT
            unique_id AS depot_id,
            hourid,
            simulation_year,
            scenario_id,
            power_demand_kw_summer,
            power_demand_kw_winter,
            power_demand_kw_shoulder,
            energy_demand_kwh_summer,
            energy_demand_kwh_winter,
            energy_demand_kwh_shoulder
            FROM ${hourlyTableName}
            ${conditions.length > 0 ? whereClause : ""}`;

      const results = await pool.query(flattenTemplateString(query), values);
      parsedResults = results.rows.map((row) => {
        return {
          depot_id: row.depot_id,
          // hours in DB are 1-24; 24 is midnight. API accepts/retuns 0-23
          hourid: Number(row.hourid) % 24,
          simulation_year: row.simulation_year,
          energy_demand_kwh_summer: Number(row.energy_demand_kwh_summer),
          energy_demand_kwh_winter: Number(row.energy_demand_kwh_winter),
          energy_demand_kwh_shoulder: Number(row.energy_demand_kwh_shoulder),
          power_demand_kw_summer: Number(row.power_demand_kw_summer),
          power_demand_kw_winter: Number(row.power_demand_kw_winter),
          power_demand_kw_shoulder: Number(row.power_demand_kw_shoulder),
        };
      });
    }
  } else {
    const query = `SELECT
      unique_id as depot_id,
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
    GROUP BY unique_id, hourid, simulation_year;`;
    const results = await pool.query(flattenTemplateString(query), values);
    parsedResults = results.rows.map((row) => {
      return {
        depot_id: row.depot_id,
        // hours in DB are 1-24; 24 is midnight. API accepts/retuns 0-23
        hourid: Number(row.hourid) % 24,
        simulation_year: row.simulation_year,
        energy_demand_kwh_summer: Number(row.energy_demand_kwh_summer),
        energy_demand_kwh_winter: Number(row.energy_demand_kwh_winter),
        energy_demand_kwh_shoulder: Number(row.energy_demand_kwh_shoulder),
        power_demand_kw_summer: Number(row.power_demand_kw_summer),
        power_demand_kw_winter: Number(row.power_demand_kw_winter),
        power_demand_kw_shoulder: Number(row.power_demand_kw_shoulder),
      };
    });
  }
  return parsedResults;
}

async function getByState(depotId, year, hour, stateAbbr) {
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
      unique_id as depot_id,
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
    GROUP BY unique_id, hourid, simulation_year;`;
  const results = await pool.query(flattenTemplateString(query), values);
  const parsedResults = results.rows.map((row) => {
    return {
      depot_id: row.depot_id,
      // hours in DB are 1-24; 24 is midnight. API accepts/retuns 0-23
      hourid: Number(row.hourid) % 24,
      simulation_year: row.simulation_year,
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
  getByState,
};
