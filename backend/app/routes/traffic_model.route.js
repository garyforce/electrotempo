const logger = require("winston");
const pool = require("../db.js");

module.exports = (app) => {
  app.get("/traffic-models", getTrafficModels);
};

async function getTrafficModels(request, response) {
  const locationId = request.query.locationId;
  if (!locationId) {
    logger.info(
      `User ${response.locals.userAuth0Id} requested /traffic-models without a locationId`
    );
    response
      .status(400)
      .send({ message: "Querystring parameter locationId is required" });
    return;
  }

  try {
    const text = `SELECT tm.id, tm."name", tm.description, tm.num_vehicles
        FROM et_prod.v_traffic_model tm 
        WHERE tm.location_id = $1;`;
    let results = await pool.query(text, [locationId]);

    const trafficModels = results.rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        numVehicles: row.num_vehicles,
      };
    });
    response.status(200).send(trafficModels);
    return;
  } catch (error) {
    logger.error(error);
    response.status(500).send({ message: "Unable to retrieve locations" });
    return;
  }
}
