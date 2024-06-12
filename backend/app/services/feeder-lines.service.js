const pool = require("../db");
const demandService = require("./feeder-line-demand.service");

async function getAll() {
  const query = `SELECT st_asgeojson(f.*, 'geom', 6) AS geojson
    FROM (
      SELECT nf.master_cdf as id, ST_Union(f.shape) AS geom
      FROM et_prod.v_feeder f
      GROUP BY f.master_cdf
    ) AS f;`;
  const results = await pool.query(query);
  const features = [];
  results.rows.forEach((row) => {
    const geoJSON = JSON.parse(row.geojson);
    features.push(geoJSON);
  });
  const geoJSON = {
    type: "FeatureCollection",
    features: features,
  };
  return geoJSON;
}

async function getByState(stateAbbreviation) {
  const query = `SELECT st_asgeojson(f.*, 'shape', 6) AS geojson
    FROM (
      SELECT vf.master_cdf as id, ST_UNION(shape) as shape
      FROM et_prod.v_feeder vf
      WHERE vf.state = $1
      GROUP BY master_cdf
    ) AS f;`;
  const values = [stateAbbreviation];
  const results = await pool.query(query, values);
  const features = [];
  results.rows.forEach((row) => {
    const geoJSON = JSON.parse(row.geojson);
    features.push(geoJSON);
  });
  const geoJSON = {
    type: "FeatureCollection",
    features: features,
  };
  return geoJSON;
}

async function getById(id) {
  const query = `SELECT st_asgeojson(f.*, 'geom', 6) AS geojson
    FROM (
      SELECT master_cdf as id, ST_Union(shape) as geom, substation
      FROM et_prod.v_feeder vf
      WHERE vf.master_cdf = $1
      GROUP BY master_cdf, substation
    ) AS f;`;
  const values = [id];
  const results = await pool.query(query, values);
  const feature = JSON.parse(results.rows[0].geojson);
  return feature;
}

module.exports = {
  getAll,
  getByState,
  getById,
};
