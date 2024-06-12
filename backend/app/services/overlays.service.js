const pool = require("../db");

async function getAll() {
  const query = `SELECT ST_AsGeoJSON(f.*) AS geojson, 'Austin Energy Service Territory' AS "name"
    FROM (
      SELECT
        geom,
        'Austin Energy Service Territory' AS "name"
      FROM et_seco.austin_energy_service_territory
    ) f
    UNION ALL
    SELECT ST_AsGeoJSON(f2.*) AS geojson, 'Bluebonnet Electric Cooperative Service Territory' AS "name"
    FROM (
      SELECT ST_COLLECT(f1.geom) FROM (
        SELECT geom2 AS geom FROM et_seco.bluebonnet_service_area bsa
      ) f1
    ) f2
    UNION ALL
    SELECT json_build_object('type', 'FeatureCollection', 'features', json_agg(st_asgeojson(f.*)::json))::text AS geojson, 'School Districts' AS "name"
    FROM (SELECT geom2 AS geom, "name", reduced_el::float AS reduced_eligible_fraction FROM et_seco.campo_school_districts csd) f;`;
  const results = await pool.query(query);
  const overlays = [];
  results.rows.forEach((row) => {
    const geoJSON = JSON.parse(row.geojson);
    geoJSON.properties = {};
    geoJSON.properties.name = row.name;
    overlays.push(geoJSON);
  });
  return overlays;
}

async function create(overlay) {}

async function update(id, overlay) {}

async function remove(id) {}

module.exports = {
  getAll,
  create,
  update,
  remove,
};
