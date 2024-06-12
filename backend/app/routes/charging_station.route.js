const logger = require('winston');
const pool = require('../db.js');
const utils = require('../utils.js');
const authorizeAccessToken = require('../../auth');

function expandStatusCode(statusCode) {
    switch (statusCode) {
        case 'E':
            return 'Available';
        case 'P':
            return 'Planned';
        case 'T':
            return 'Temporarily Unavailable'
        default:
            return 'Unknown';
    }
}

function parsePlugTypes(plugTypesString) {
    if (typeof plugTypesString !== 'string') {
        return [];
    }
    return plugTypesString.replaceAll("'", "").split(", ");
}

module.exports = app => {
    const jwtAuthz = require('express-jwt-authz');
    const jwtAuthzOptions = {
        customScopeKey: process.env.AUTH_PERMISSIONS_SCOPE
    }
    app.use('/charging-stations', authorizeAccessToken);
    app.get("/charging-stations", jwtAuthz(['read:charging_stations'], jwtAuthzOptions), getChargingStations);
    app.use('/charging-stations/networks', authorizeAccessToken);
    app.get("/charging-stations/networks", jwtAuthz(['read:charging_stations'], jwtAuthzOptions), getChargingStationNetworks);
};

async function getChargingStations(request, response) {
    let trafficModelId = request.query.trafficModelId;
    let locationName = request.query.locationName;
    let locationId = request.query.locationId;
    let text, values = [], result;

    if (locationName === "TxPPC") {
        text = `SELECT DISTINCT vcs.id,
        ST_AsGeoJSON(coordinates) as coordinates,
        access,
        l1ports,
        l2ports,
        dcfastports,
        evnetwork,
        facilitytype,
        opendate,
        status,
        evconnectortypes
    FROM
        et_prod.charging_station vcs
    WHERE location_id IN (76, 78, 79, 80, 81)`;
    result = await pool.query(text);
    }

    else if (["CPS", "NBU", "LCRA", "Austin Energy"].includes(locationName)) {
        text = `SELECT DISTINCT vcs.id,
            ST_AsGeoJSON(coordinates) as coordinates,
            access,
            l1ports,
            l2ports,
            dcfastports,
            evnetwork,
            facilitytype,
            opendate,
            status,
            evconnectortypes
        FROM
            et_prod.charging_station vcs
        WHERE location_id  = ${locationId}`;
        result = await pool.query(text);
    } else {
        text = `SELECT DISTINCT vcs.id,
                    ST_AsGeoJSON(coordinates) as coordinates,
                    access,
                    l1ports,
                    l2ports,
                    dcfastports,
                    evnetwork,
                    facilitytype,
                    opendate,
                    status,
                    evconnectortypes
                FROM
                    et_prod.v_charging_station vcs,
                    et_prod.v_block_group vbg
                JOIN et_prod.v_block_group_demand vbgd ON vbgd.block_group_id = vbg.block_group_id
                JOIN et_prod.v_charging_demand_simulation vcds ON vcds.id = vbgd.charging_demand_simulation_id 
                JOIN et_prod.v_traffic_model vtm ON vtm.id = vcds.traffic_model_id
                WHERE ST_Within(vcs.coordinates, vbg.blkgrp_coordinates)
                AND vtm.id = $1;`;
        values.push(trafficModelId);
        result = await pool.query(text, values);
    }
    try {
        let featureCollection = {
            "type": "FeatureCollection",
            "features": []
        }
        result.rows.forEach(row => {
            let feature = {
                "type": "Feature",
                "properties": {
                    "id": row.id,
                    "l1Ports": Number(row.l1ports),
                    "l2Ports": Number(row.l2ports),
                    "dcFastPorts": Number(row.dcfastports),
                    "access": row.access,
                    "evNetwork": row.evnetwork,
                    "facilityType": row.facilitytype,
                    "openDate": row.opendate,
                    "status": expandStatusCode(row.status),
                    "plugTypes": parsePlugTypes(row.evconnectortypes)
                },
                "geometry": JSON.parse(row.coordinates)
            }
            featureCollection.features.push(feature);
        });
        response.status(200).send(featureCollection);
    } catch (error) {
        logger.error(error);
        response.status(500).send({ message: 'Internal server error' });
    }
}

async function getChargingStationNetworks(request, response) {
    const text = `SELECT DISTINCT evnetwork
        FROM et_prod.v_charging_station vcs;`;
    try {
        const result = await pool.query(text);
        response.status(200).send(result.rows.map(row => row.evnetwork ?? 'Unknown Network'));
    } catch (error) {
        logger.error(error);
        response.status(500).send({ message: 'Internal server error' });
    }
}