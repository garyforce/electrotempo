const pool = require("../db");

async function getAll() {
	const query = `SELECT st_asgeojson(f.*, 'geom', 6) AS geojson
    					FROM (
      						SELECT unique_id as id, geom
      							FROM et_prod.v_depots_qad nd
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

async function getByState(stateAbbreviation, locationId, depotCategory) {
	let query,
		conditions = [],
		values;
	const filterItems = depotCategory.split(",");

	if (
		((filterItems.length === 1 && filterItems[0] === "") ||
			filterItems.length === 0) &&
		["TX", "CPS", "NBU", "LCRA", "AE", "FIRST_ENERGY"].includes(
			stateAbbreviation
		)
	) {
		return {
			type: "FeatureCollection",
			features: [],
		};
	}

	if (["TX", "CPS", "NBU", "LCRA", "AE"].includes(stateAbbreviation)) {
		if (filterItems.includes("registered-longhaul-fleets")) {
			conditions.push(" ( label_source like '%FMCSA%' ) ");
		}

		if (filterItems.includes("warehouse-distribution-trucking")) {
			conditions.push(" ( label_source = 'WDT' ) ");
		}

		if (filterItems.includes("highway-corridor")) {
			conditions.push(" ( label_source = 'highway-corridor' ) ");
		}

		if (filterItems.includes("others")) {
			conditions.push(
				" ( label_source = 'non-WDT rush' OR label_source = 'non-wdt general' OR label_source = 'other' ) "
			);
		}

		if (stateAbbreviation == "TX") {
			query = `
		  SELECT ST_AsGeoJSON(f.*, 'geom', 6) AS geojson
		  FROM (
			SELECT concat_prop_fips AS id, owner_name as owner, name_care as business_name, ST_Centroid(geom) AS geom, legal_area, lgl_area_u, gis_area, gis_area_u, legal_desc as description, stat_land_ as family, land_value, imp_value, mkt_value, situs_addr as address, situs_num, situs_st_1 as street1, situs_st_2 as street2, situs_city as city, situs_stat as state, situs_zip as zipcode, google_places_list, google_search_string_list, label_source as datasource
			  FROM et_texas.failsafe_depots_v7 WHERE active = true AND ( ${conditions.join(" or ")} )
		  ) AS f;`;
		} else {
			query = `
			SELECT ST_AsGeoJSON(f.*, 'geom', 6) AS geojson
			FROM (
			  SELECT concat_prop_fips AS id, owner_name as owner, name_care as business_name, ST_Centroid(geom) AS geom, legal_area, lgl_area_u, gis_area, gis_area_u, legal_desc as description, stat_land_ as family, land_value, imp_value, mkt_value, situs_addr as address, situs_num, situs_st_1 as street1, situs_st_2 as street2, situs_city as city, situs_stat as state, situs_zip as zipcode, google_places_list, google_search_string_list, label_source as datasource
				FROM et_texas.failsafe_depots_v7 where location_id = $1 and active = true AND ( ${conditions.join(" or ")} )
			) AS f;`;
			values = [locationId];
		}
	} else if (stateAbbreviation === "FIRST_ENERGY") {
		if (filterItems.includes("registered-longhaul-fleets")) {
			conditions.push(" ( label_source = 'fmcsa' ) ");
		}

		if (filterItems.includes("warehouse-distribution-trucking")) {
			conditions.push(
				" ( label_source = 'wdt' ) "
			);
		}

		if (filterItems.includes("highway-corridor")) {
			conditions.push(" ( label_source = 'highway-corridor' ) ");
		}

		if (filterItems.includes("municipal-fleets")) {
			conditions.push(" ( label_source = 'municipal-fleets' ) ");
		}

		if (filterItems.includes("others")) {
			conditions.push(
				`( label_source IN ('non_wdt_1', 'non_wdt_2', 'non_wdt_3', 'other' ) )`
			);
		}

		query = `SELECT ST_AsGeoJSON(f.*, 'geom', 6) AS geojson 
					FROM (
						SELECT 
							ST_Centroid(geom) AS geom,
							concat_parcel_geo AS id, 
							label_source AS datasource, 
							owner AS owner, 
							owner AS business_name, 
							legaldesc AS description, 
							mailadd AS address, 
							address AS street1,
							address2 AS street2,
							city, 
							county, 
							state2 AS state, 
							szip5 AS zipcode
						FROM et_pa.failsafe_depots_v3 pcpa
						WHERE active = true AND ( ${conditions.join(" OR ")} ) 
				) AS f;`;
	} else {
		query = `SELECT st_asgeojson(f.*, 'geom', 6) AS geojson FROM ( SELECT unique_id as id, geom FROM et_prod.v_depots_qad nd WHERE state = $1 ) AS f;`;
		values = [stateAbbreviation];
	}

	const results = await pool.query(query, values);
	const features = results.rows.map((row) => JSON.parse(row.geojson));
	const geoJSON = {
		type: "FeatureCollection",
		features: features,
	};
	return geoJSON;
}

// Method is deprecated, revisit this later
async function getById(id) {
	const query = `SELECT st_asgeojson(f.*, 'geom', 6) AS geojson
    					FROM (
      						SELECT 
								state, 
								unique_id as id, 
								depot_owner as owner, 
								business_name as business_name, 
								geom
      						FROM et_prod.v_depots_qad nd
      							WHERE nd.unique_id = $1
    				) AS f;`;
	const values = [id];
	const results = await pool.query(query, values);
	const feature = JSON.parse(results.rows[0].geojson);
	return feature;
}

async function getByIdAndState(id, stateAbbreviation) {
	let query, values;
	if (["TX", "CPS", "NBU", "LCRA", "AE"].includes(stateAbbreviation)) {
		query = `
		SELECT ST_AsGeoJSON(f.*, 'geom', 6) AS geojson
		FROM (
		  SELECT concat_prop_fips AS id, owner_name as owner, name_care as business_name, ST_Centroid(geom) AS geom, legal_area, lgl_area_u, gis_area, gis_area_u, legal_desc as description, stat_land_ as family, land_value, imp_value, mkt_value, situs_addr as address, situs_num, situs_st_1 as street1, situs_st_2 as street2, situs_city as city, situs_stat as state, situs_zip as zipcode, google_places_list, google_search_string_list, label_source as datasource
			FROM et_texas.failsafe_depots_v7 where concat_prop_fips = $1
		) AS f;`;
		values = [id];
	} else if (stateAbbreviation === "FIRST_ENERGY") {
		query = ` SELECT ST_AsGeoJSON(f.*, 'geom', 6) AS geojson 
					FROM (
						SELECT 
						ST_Centroid(geom) AS geom,
						concat_parcel_geo as id, 
						label_source as datasource, 
						owner, 
						owner as business_name, 
						legaldesc as description, 
						mailadd as address, 
						address as street1,
						address2 as street2,
						city, 
						county, 
						state2 as state, 
						szip5 as zipcode
      						FROM et_pa.failsafe_depots_v3 pcpd 
      							WHERE concat_parcel_geo = $1
    			) AS f;`;
		values = [id];
	} else {
		query = `SELECT st_asgeojson(f.*, 'geom', 6) AS geojson FROM (
      				SELECT state, unique_id as id, depot_owner as owner, business_name as business_name, geom FROM et_prod.v_depots_qad nd 
						WHERE nd.unique_id = $1 AND nd.state = $2
    			) AS f;`;
		values = [id, stateAbbreviation];
	}
	const results = await pool.query(query, values);
	const feature = JSON.parse(results.rows[0].geojson);
	return feature;
}

async function disableDepotById(id, stateAbbreviation) {
	let query = '';
	if (["TX", "CPS", "NBU", "LCRA", "AE"].includes(stateAbbreviation)) {
		query = `UPDATE et_texas.failsafe_depots_v7 SET active = false WHERE concat_prop_fips = $1`;
	}
	else if (stateAbbreviation === "FIRST_ENERGY") {
		query = `UPDATE et_pa.failsafe_depots_v3 SET active = false WHERE concat_parcel_geo = $1`;
	} else {
		return { success: false, message: 'Location NOT supported' };
	}
	const values = [id];
	try {
		const result = await pool.query(query, values);
		return { success: true, message: "Depot disabled successfully." };
	} catch (e) {
		return { success: false, message: e.message };
	}
}

module.exports = {
	getAll,
	getByState,
	getById,
	getByIdAndState,
	disableDepotById,
};
