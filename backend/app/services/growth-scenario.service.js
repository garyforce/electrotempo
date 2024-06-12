const logger = require("../../log");
const pool = require("../db");
const vehicleClassService = require("./vehicle-class.service");
const format = require("pg-format");
const { isOrganizationElectroTempo } = require("./orgUtil");
const { calculateEmissionByVehicleType } = require("./calculateEmissionByVehicle");

async function getAll(userOrgId, locationName) {
	const isUserAdmin = await isOrganizationElectroTempo(userOrgId);
	let text = "";
	let values = [userOrgId];

	// For Localhost there is no et_auth table, so just returning all scenarios as admin
	if (process.env.DB_HOST === "localhost") {
		text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, 'ElectroTempo' as orgname, 
    COALESCE(gs.context->>'location', null) AS location
    FROM et_prod.ev_growth_scenario gs
    WHERE gs.active = true
    ORDER BY gs.name ASC;`;
		const result = await pool.query(text);
		return { result: result.rows, admin: true };
	}

	if (isUserAdmin) {
		text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, org.name AS orgname,
    COALESCE(gs.context->>'location', null) AS location
    FROM et_prod.ev_growth_scenario gs
    JOIN et_auth.organization org ON gs.owner = org.id WHERE gs.active = true
    ORDER BY gs.name ASC;`;
		const result = await pool.query(text);
		return { result: result.rows, admin: true };
	} else {
		if (locationName) {
			locationName = locationName.toLowerCase();
			values.push(locationName);
			text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, org.name AS orgname,
      COALESCE(gs.context->>'location', null) AS location
      FROM et_prod.ev_growth_scenario gs
      JOIN et_auth.organization org ON gs.owner = org.id
      WHERE gs.active = true AND gs.owner = $1 AND (gs.context IS NULL OR (gs.context->>'location') = $2)
      ORDER BY gs.name ASC;`;
		} else {
			text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, org.name AS orgname,
      COALESCE(gs.context->>'location', null) AS location
      FROM et_prod.ev_growth_scenario gs
      JOIN et_auth.organization org ON gs.owner = org.id
      WHERE gs.active = true AND gs.owner = $1 
      ORDER BY gs.name ASC;`;
		}
		const result = await pool.query(text, values);
		return { result: result.rows, admin: false };
	}
}

async function getGrowthScenarioForDepots(userOrgId, locationName) {
	const isUserAdmin = await isOrganizationElectroTempo(userOrgId);
	let text = "", values = [];
	locationName = locationName.toLowerCase();
	const isTxPPC = ["txppc", "cps", "nbu", "lcra", "austin energy"].includes(locationName);
	const isFirstEnergy = ["first energy"].includes(locationName);
	const txppcTable = "et_texas.daily_power_energy_apr4";
	const firstEnergyTable = "et_pa.daily_power_energy_apr4";

	// For Localhost there is no et_auth table, so just returning all scenarios as admin
	if (process.env.DB_HOST === "localhost" || isUserAdmin) {
		if (isFirstEnergy) {
			text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, org.name AS orgname,
					COALESCE(gs.context->>'location', null) AS location
					FROM et_prod.ev_growth_scenario gs
					JOIN et_auth.organization org ON gs.owner = org.id WHERE gs.active = true AND gs.context->>'location' = '${locationName}'
						AND gs.id IN (select DISTINCT scenario_id from ${firstEnergyTable}) ORDER BY gs.name ASC;`;
		} else if (isTxPPC) {
			text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, org.name AS orgname,
						COALESCE(gs.context->>'location', null) AS location
						FROM et_prod.ev_growth_scenario gs
						JOIN et_auth.organization org ON gs.owner = org.id WHERE gs.active = true AND gs.context->>'location' = '${locationName}'
							AND gs.id IN (select DISTINCT scenario_id from ${txppcTable}) ORDER BY gs.name ASC;`;
		} else {
			return { error: "Unsupported location" }
		}
	}
	else {
		if (isFirstEnergy) {
			values = [userOrgId, locationName];
			text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, org.name AS orgname,
						COALESCE(gs.context->>'location', null) AS location
						FROM et_prod.ev_growth_scenario gs
						JOIN et_auth.organization org ON gs.owner = org.id WHERE gs.active = true 
							AND gs.context->>'location' = $2 AND gs.owner = $1
								AND gs.id IN (select DISTINCT scenario_id from ${firstEnergyTable}) ORDER BY gs.name ASC;`;
		}
		else if (isTxPPC) {
			values = [userOrgId, locationName];
			text = `SELECT gs.id, gs.name, gs.description, gs.inserted_timestamp AS created, org.name AS orgname,
						COALESCE(gs.context->>'location', null) AS location
						FROM et_prod.ev_growth_scenario gs
						JOIN et_auth.organization org ON gs.owner = org.id WHERE gs.active = true 
							AND gs.context->>'location' = $2 AND gs.owner = $1
								AND gs.id IN (select DISTINCT scenario_id from ${txppcTable}) ORDER BY gs.name ASC;`;
		}
		else {
			return { error: "Unsupported location" }
		}
	}

	const result = await pool.query(text, values);
	return { result: result.rows, admin: isUserAdmin };
}


async function get(id) {
	const growthScenarioQuery = `SELECT id, name, description, "owner", context
  FROM et_prod.ev_growth_scenario vegs 
  WHERE vegs.id = $1;`;
	const growthScenarioValues = [id];
	const growthScenarioResults = await pool.query(
		growthScenarioQuery,
		growthScenarioValues
	);

	const vehicleClasses = await getGrowthScenarioVehicleClasses(id);

	const growthScenario = {
		id: growthScenarioResults.rows[0].id,
		name: growthScenarioResults.rows[0].name,
		description: growthScenarioResults.rows[0].description,
		vehicleClasses: vehicleClasses,
	};

	return growthScenario;
}

async function getGrowthScenarioVehicleClasses(id) {
	const vehicleClasses = await vehicleClassService.getAll();
	const annualDataQuery = `SELECT
      vvc."name",
      vvc.vehicle_class_id,
      vegsad."year",
      vegsad.count_of_all_vehicles,
      vegsad.ev_fraction_of_sales,
      vegsad.ev_fraction_of_all_vehicles,
      vegsad.num_evs,
      vegsad.ice_fraction_of_all_vehicles,
      vegsad.num_of_remaining_ice
    FROM et_prod.v_ev_growth_scenario_annual_data vegsad
    JOIN et_prod.v_ev_growth_scenario_simulation_parameters vegssp ON vegssp.id = vegsad.growth_scenario_simulation_parameters_id
    JOIN et_prod.v_vehicle_class vvc ON vvc.vehicle_class_id = vegssp.vehicle_class_id 
    WHERE vegssp.ev_growth_scenario_id = $1
    ORDER BY vegsad."year" ASC;`;
	const annualDataValues = [id];
	const annualDataResult = await pool.query(annualDataQuery, annualDataValues);

	const parametersQuery = `SELECT
      id,
      ev_growth_scenario_id,
      vehicle_class_id,
      initial_num_vehicles,
      ev_retrofit_rate,
      vehicle_population_growth_rate,
      scrappage_incentive_size_frac,
      target_year_market_share_frac,
      target_year, current_market_share_frac,
      final_market_share_frac,
      final_year,
      scrappage_incentive_program,
      ev_retrofit_incentive_program, 
      current_year,
      start_year,
      start_year_market_share_frac,
      scrappage_rate,
      ev_retrofit_incentive_size_frac
    FROM et_prod.v_ev_growth_scenario_simulation_parameters
    WHERE ev_growth_scenario_id = $1;`;
	const parametersValues = [id];
	const parametersResult = await pool.query(parametersQuery, parametersValues);

	const hydratedVehicleClasses = parametersResult.rows.map((parameterRow) => {
		const vehicleClass = vehicleClasses.find(
			(vehicleClass) =>
				vehicleClass.vehicle_class_id === parameterRow.vehicle_class_id
		);
		return {
			...vehicleClass,
			config: {
				startingPopulation: Number(parameterRow.initial_num_vehicles),
				retrofitRate: Number(parameterRow.ev_retrofit_rate),
				growthRate: Number(parameterRow.vehicle_population_growth_rate),
				scrappageIncentiveSize: Number(
					parameterRow.scrappage_incentive_size_frac
				),
				targetMarketshare: Number(parameterRow.target_year_market_share_frac),
				targetYear: Number(parameterRow.target_year),
				currentMarketshare: Number(parameterRow.current_market_share_frac),
				finalMarketshare: Number(parameterRow.final_market_share_frac),
				finalYear: Number(parameterRow.final_year),
				scrappageIncentive: Boolean(parameterRow.scrappage_incentive_program),
				retrofitIncentive: Boolean(parameterRow.ev_retrofit_incentive_program),
				currentYear: Number(parameterRow.current_year),
				startYear: Number(parameterRow.start_year),
				startMarketshare: Number(parameterRow.start_year_market_share_frac),
				scrappageRate: Number(parameterRow.scrappage_rate),
				retrofitIncentiveSize: Number(
					parameterRow.ev_retrofit_incentive_size_frac
				),
			},
			annualData: annualDataResult.rows
				.filter(
					(annualDataRow) =>
						annualDataRow.vehicle_class_id === parameterRow.vehicle_class_id && annualDataRow.year >= 2020
				)
				.map((annualDataRow, index) => {
					return {
						year: Number(annualDataRow.year),
						countOfAllVehicles: Number(annualDataRow.count_of_all_vehicles),
						evFractionOfSales: Number(annualDataRow.ev_fraction_of_sales),
						evFractionOfAllVehicles: Number(
							annualDataRow.ev_fraction_of_all_vehicles
						),
						numEvs: Number(annualDataRow.num_evs),
						iceFractionOfAllVehicles: Number(
							annualDataRow.ice_fraction_of_all_vehicles
						),
						numOfRemainingIce: Number(annualDataRow.num_of_remaining_ice),
						emissions: calculateEmissionByVehicleType(
							Number(annualDataRow.vehicle_class_id),
							Number(annualDataRow.num_evs),
							Number(annualDataRow.num_of_remaining_ice),
							index
						),
					};
				}),
		};
	});

	return hydratedVehicleClasses;
}

async function create(growthScenario, userAuth0Id, userOrgId, location) {
	// note: we don't try/catch this because if connecting throws an exception
	// we don't need to dispose of the client (it will be undefined)
	let client;
	const locationName = location.name.toLowerCase();
	try {
		client = await pool.connect();
		await client.query("BEGIN");

		const vehicleClassQuery = `SELECT vehicle_class_id, name, description FROM et_prod.v_vehicle_class;`;
		const vehicleClassResults = await client.query(vehicleClassQuery);
		const savedVehicleClasses = vehicleClassResults.rows;

		/* Insert Growth Scenario */
		const growthScenarioQuery = `INSERT INTO et_prod.ev_growth_scenario ("name",description,inserted_by,"owner", "context")
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id;`;
		const growthScenarioValues = [
			growthScenario.name,
			growthScenario.description,
			userAuth0Id,
			userOrgId,
			{ location: locationName, orgId: userOrgId, userId: userAuth0Id },
		];
		const growthScenarioResults = await client.query(
			growthScenarioQuery,
			growthScenarioValues
		);
		const newGrowthScenarioId = growthScenarioResults.rows[0].id;
		logger.info(`Inserted growth scenario with id ${newGrowthScenarioId}`);

		const vehicleClassPromises = growthScenario.vehicleClasses.map(
			async (vehicleClass) => {
				const { annualData, simulationSettings, config } = vehicleClass;
				const vehicleClassId = savedVehicleClasses.find(
					(vc) => vc.name === vehicleClass.name
				).vehicle_class_id;
				/* Insert Simulation Settings */
				const simulationSettingsQuery = `INSERT INTO et_prod.ev_growth_scenario_simulation_parameters (
          ev_growth_scenario_id,
          vehicle_class_id,
          initial_num_vehicles,
          ev_retrofit_incentive_program,
          ev_retrofit_rate,
          ev_retrofit_incentive_size_frac,
          vehicle_population_growth_rate,
          scrappage_rate,
          scrappage_incentive_program,
          scrappage_incentive_size_frac,
          target_year_market_share_frac,
          target_year,
          current_market_share_frac,
          current_year,
          final_market_share_frac,
          final_year,
          start_year_market_share_frac,
          start_year,
          inserted_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        RETURNING id;`;
				const simulationSettingsValues = [
					newGrowthScenarioId,
					vehicleClassId,
					config.startingPopulation,
					config.retrofitIncentive,
					config.retrofitRate,
					config.retrofitIncentiveSize,
					config.growthRate,
					config.scrappageRate,
					config.scrappageIncentive,
					config.scrappageIncentiveSize,
					config.targetMarketshare,
					config.targetYear,
					config.currentMarketshare,
					config.currentYear,
					config.finalMarketshare,
					config.finalYear,
					config.startMarketshare,
					config.startYear,
					userAuth0Id,
				];
				const simulationSettingsResults = await client.query(
					simulationSettingsQuery,
					simulationSettingsValues
				);
				const newSimulationSettingsId = simulationSettingsResults.rows[0].id;
				logger.info(
					`Inserted simulation settings with id ${newSimulationSettingsId}`
				);

				/* Insert Simulation Results */
				const growthScenarioAnnualDataQuery = `INSERT INTO et_prod.ev_growth_scenario_annual_data (
          growth_scenario_simulation_parameters_id,
          scale_year,
          "year",
          count_of_all_vehicles,
          count_of_all_vehicles_bought,
          ev_fraction_of_sales,
          ev_fraction_of_all_vehicles,
          num_evs,
          ice_fraction_of_all_vehicles,
          num_of_remaining_ice,
          inserted_by
        )
        VALUES %L;`;
				const growthScenarioAnnualDataValues = annualData.map((e) => {
					return [
						newSimulationSettingsId,
						e.scaleYear,
						e.year,
						e.countOfAllVehicles,
						e.countOfAllVehiclesBought,
						e.evFractionOfSales,
						e.evFractionOfAllVehicles,
						e.numEvs,
						e.iceFractionOfAllVehicles,
						e.numRemainingIce,
						userAuth0Id,
					];
				});
				await client.query(
					format(growthScenarioAnnualDataQuery, growthScenarioAnnualDataValues),
					[]
				);
				logger.info(
					`Inserted growth scenario annual data with growth_scenario_id ${newGrowthScenarioId}`
				);
			}
		);

		await Promise.all(vehicleClassPromises);

		/* Finalize DB Commit */
		await client.query("COMMIT");

		return { success: true, message: "Growth scenario created successfully." };
	} catch (e) {
		logger.error(e);
		await client.query("ROLLBACK");
		return { success: false, message: e.message };
	} finally {
		client.release();
	}
}

async function update(id, growthScenario) { }

async function remove(id) {
	// Soft delete the scenario
	const text = `UPDATE et_prod.ev_growth_scenario SET active = false WHERE id = $1;`;
	const values = [id];
	try {
		const result = await pool.query(text, values);
		return { success: true, message: "Growth scenario deleted successfully." };
	} catch (e) {
		return { success: false, message: e.message };
	}
}

module.exports = {
	getAll,
	get,
	create,
	update,
	remove,
	getGrowthScenarioForDepots
};
