const logger = require('winston');
const pool = require('../db.js');
const utils = require('../utils.js');

module.exports = app => {
    app.get("/charging-demand-simulations", getChargingDemandSimulations);
};

async function getChargingDemandSimulations(request, response) {
    const trafficModelId = request.query.trafficModelId;
    if (!trafficModelId) {
        logger.info(`User ${response.locals.userAuth0Id} requested /charging-demand-simulations without a location`);
        response.status(400).send({ message: 'Querystring parameter trafficModelId is required' });
        return;
    }

    try {
        const text = `SELECT cds.id
            FROM et_prod.v_charging_demand_simulation cds
            JOIN et_prod.v_traffic_model tm ON tm.id = cds.traffic_model_id
            WHERE traffic_model_id = $1;`;
        let results = await pool.query(text, [trafficModelId]);

        const trafficModelPromises = results.rows.map(async row => {
            const chargingDemandSimulation = {
                id: row.id
            }

            const parameterQuery = `SELECT parameter_name, parameter_value
                FROM et_prod.v_charging_demand_simulation_parameters cdsp
                JOIN et_prod.v_charging_demand_simulation cds ON cds.id = cdsp.charging_demand_simulation_id
                WHERE cdsp.charging_demand_simulation_id = $1;`;
            let parameterResults = await pool.query(parameterQuery, [row.id]);

            parameterResults.rows.forEach(row => {
                // parameters do not have datatype information on them currently.
                // This is a workaround until we can store the types alongside the values
                if (row.parameter_name === 'percent_evs') {
                    chargingDemandSimulation[utils.camelize(row.parameter_name)] = Number(row.parameter_value);
                } else {
                    chargingDemandSimulation[utils.camelize(row.parameter_name)] = row.parameter_value;
                }
            });

            return chargingDemandSimulation;
        });
        const trafficModels = await Promise.all(trafficModelPromises);
        response.status(200).send(trafficModels);
        return;
    } catch (error) {
        logger.error(error);
        response.status(500).send({ message: 'Unable to retrieve locations' });
        return;
    }
}
