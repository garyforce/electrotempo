const fetch = require("cross-fetch");

const service = require("../services/growth-scenario.service");

async function getAll(req, res, next) {
  try {
    const allGrowthScenarios = await service.getAll(res.locals.userOrgId, req.params.name);
    res.json(allGrowthScenarios);
  } catch (err) {
    next(err);
  }
}

async function getGrowthScenarioForDepots(req, res, next) {
  try {
    const allGrowthScenarios = await service.getGrowthScenarioForDepots(res.locals.userOrgId, req.params.name);
    res.json(allGrowthScenarios);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const allGrowthScenarios = await service.get(
      req.params.id,
    );
    res.json(allGrowthScenarios);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    res.json(await service.create(req.body, res.locals.userAuth0Id, res.locals.userOrgId));
  } catch (err) {
    console.error(`Error while creating growth scenario`, err.message);
    next(err);
  }
}

function incentivizeScrappageRate(scrappageRate, incentiveSize) {
  return scrappageRate * 1.2 * (1 + incentiveSize);
}

function incentivizeRetrofitRate(retrofitRate, incentiveSize) {
  return retrofitRate * (1 + incentiveSize);
}

async function runSimulation(req, res, next) {
  const growthScenario = req.body;
  const location = req.body.location;
  try {
    const simulationResultPromises = growthScenario.vehicleClasses.map(
      async (vehicleClass) => {
        let scrappageRate;
        if (vehicleClass.config.scrappageIncentive) {
          scrappageRate = incentivizeScrappageRate(
            vehicleClass.config.scrappageRate,
            vehicleClass.config.scrappageIncentiveSize
          );
        } else {
          scrappageRate = vehicleClass.config.scrappageRate;
        }
        let retrofitRate;
        if (vehicleClass.config.retrofitIncentive) {
          retrofitRate = incentivizeRetrofitRate(
            vehicleClass.config.retrofitRate,
            vehicleClass.config.retrofitIncentiveSize
          );
        } else {
          retrofitRate = vehicleClass.config.retrofitRate;
        }

        const simulationVehicleClass = {
          salesCurveSettings: vehicleClass.salesCurveSettings,
          simulationSettings: {
            initialNumVehicles: vehicleClass.config.startingPopulation,
            growthRate: vehicleClass.config.growthRate,
            scrappageRate: scrappageRate,
            evRetrofitRate: retrofitRate,
          },
        };
        const response = await fetch(
          process.env.EV_GROWTH_SIMULATION_ENDPOINT,
          {
            method: "POST",
            headers: {
              Authorization: req.headers.authorization,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(simulationVehicleClass),
          }
        );
        if (!response.ok) {
          throw new Error(
            `Error while running simulation for vehicle class ${vehicleClass.name}`
          );
        }
        const result = await response.json();
        vehicleClass.annualData = result;
        return vehicleClass;
      }
    );
    const simulationResults = await Promise.all(simulationResultPromises);
    growthScenario.vehicleClasses = simulationResults;
    const serviceResponse = await service.create(
      growthScenario,
      res.locals.userAuth0Id,
      res.locals.userOrgId,
      location
    );
    if (serviceResponse.success) {
      res.status(201).json(serviceResponse.message);
    } else {
      res.status(500).json(serviceResponse.message);
    }
  } catch (err) {
    console.error(`Error while creating growth scenario`, err.message);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating growth scenario`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    res.json(await service.remove(req.params.id));
  } catch (err) {
    console.error(`Error while deleting growth scenario`, err.message);
    next(err);
  }
}

module.exports = {
  getAll,
  get,
  create,
  runSimulation,
  update,
  remove,
  getGrowthScenarioForDepots
};
