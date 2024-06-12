const logger = require('winston');
const pool = require('../db.js');
const utils = require('../utils.js');
const authorizeAccessToken = require('../../auth');

module.exports = app => {
    const jwtAuthz = require('express-jwt-authz');

    const jwtAuthzOptions = {
        customScopeKey: process.env.AUTH_PERMISSIONS_SCOPE
    };
    app.use('/justice40', authorizeAccessToken);

    app.get("/justice40", jwtAuthz(['read:justice40_data'], jwtAuthzOptions), getJustice40);
};

async function getJustice40(request, response) {
    const state = request.query.state;

    try {
        const text = `select st_asgeojson(subtable.*)
            from ( SELECT j.tpli, j.dpmli, j.geom as geometry, geoid10 as geoid
                from et_seco.j40_shapefile j
                where sf = $1
                and 1 in (tpli,dpmli)
            ) as subtable;`;
        const values = [state];
        const result = await pool.query(text, values);
        let featureCollection = {
            'type': 'FeatureCollection',
            'features': result.rows.map(e => JSON.parse(e.st_asgeojson))
        };
        response.status(200).send(featureCollection);
    } catch (error) {
        logger.error(error);
        response.status(500).send({ message: 'Internal server error' });
    }
}