const pool = require("../db");

async function getAll(userAuth0Id) {
  const query = `SELECT vvc.vehicle_class_id, vvc.name, vvc.description
    FROM et_prod.v_vehicle_class vvc;`;
  const results = await pool.query(query);
  return results.rows;
}

module.exports = {
  getAll,
};
