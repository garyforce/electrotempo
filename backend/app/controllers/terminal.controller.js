const { invokeTerminalCalculator } = require("../lambda");
const service = require("../services/terminal/terminal.service");

async function getAllTerminals(req, res, next) {
  try {
    const orgId = res.locals.userOrgId;

    if (!orgId && orgId !== 0 && process.env.DB_HOST !== "localhost") {
      throw new Error("OrgId is undefined");
    }

    const terminals = await service.getAllTerminals(orgId);
    res.json(terminals);
  } catch (err) {
    next(err);
  }
}

async function deleteTerminalScenario(req, res, next) {
  try {
    const terminalId = Number(req.params.propertyId);
    const facilityId = Number(req.params.facilityId);
    const scenarioId = Number(req.params.id);
    res.json(
      await service.deleteTerminalScenarioById(
        terminalId,
        facilityId,
        scenarioId
      )
    );
  } catch (err) {
    next(err);
  }
}

async function getTerminalScenarioVehicleData(req, res, next) {
  try {
    const scenarioId = Number(req.params.scenarioId);
    const scenarioVehicleId = Number(req.params.scenarioVehicleId);

    res.json(
      await service.getScenarioVehicleData(scenarioId, scenarioVehicleId)
    );
  } catch (err) {
    next(err);
  }
}

async function updateScenarioCosts(req, res, next) {
  try {
    const scenarioId = Number(req.params.scenarioId);
    const { chargerCost, vehicleCost, installationCost } = req.body;

    res.json(
      await service.updateScenarioCosts(
        scenarioId,
        chargerCost,
        vehicleCost,
        installationCost
      )
    );
  } catch (err) {
    next(err);
  }
}

async function createTerminalScenario(req, res, next) {
  try {
    const propertyId = Number(req.params.propertyId);
    const facilityId = Number(req.params.facilityId);

    const optimizationData = await service.createTerminalScenario(
      propertyId,
      facilityId,
      req.body
    );

    try {
      await service.updateScenarioStatus(optimizationData.scenarioId, "IN-PROGRESS");
      await invokeTerminalCalculator(req.headers.authorization, optimizationData);
    } catch (err) {
      console.error(err);
      await service.updateScenarioStatus(optimizationData.scenarioId, "FAILED");
      throw err;
    }

    res.json(optimizationData);
  } catch (err) {
    next(err);
  }
}

async function getCreateTerminalScenarioData(req, res, next) {
  try {
    const propertyId = Number(req.params.propertyId);
    const scenarioId = Number(req.query.scenarioId) || undefined;

    res.json(await service.getCreateScenarioData(propertyId, scenarioId));
  } catch (err) {
    next(err);
  }
}

async function getVehicleTypeInformation(req, res, next) {
  try {
    const vehicleTypeId = Number(req.query.vehicleTypeId);
    const vehicles = await service.getVehicleTypeInformation(vehicleTypeId);
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}

async function getFinancialData(req, res, next) {
  try {
    const scenarioId = Number(req.params.scenarioId);
    const scenarioVehicleId = Number(req.params.scenarioVehicleId);
    const planningStartYear = Number(req.query.planningStartYear);
    const planningHorizonYears = Number(req.query.planningHorizonYears);
    const fuelCostGrowthRate = Number(req.query.fuelCostGrowthRate);
    const discountRate = Number(req.query.discountRate);
    const ppaRate = Number(req.query.ppaRate);
    const investmentStrategy = req.query.investmentStrategy.toLowerCase();
    const chargerCost = Number(req.query.chargerCost);
    const vehicleCost = Number(req.query.vehicleCost);
    const initInstallationCost = Number(req.query.installationCost);
    const utilityRateId = Number(req.query.utilityRateId);

    res.json(
      await service.getFinancialData(
        scenarioId,
        scenarioVehicleId,
        planningHorizonYears,
        discountRate,
        planningStartYear,
        fuelCostGrowthRate,
        ppaRate,
        investmentStrategy,
        chargerCost,
        vehicleCost,
        initInstallationCost,
        utilityRateId
      )
    );
  } catch (err) {
    next(err);
  }
}

async function getTerminalScenariosDownloadData(req, res, next) {
  try {
    const scenarioIds = req.query.ids.split(",").map((id) => Number(id));

    res.json(await service.getTerminalScenariosDownloadData(scenarioIds));
  } catch (err) {
    next(err);
  }
}

async function getUtilityRates(req, res, next) {
  try {
    const orgId = Number(req.query.orgId);

    res.json(await service.getUtilityRates(orgId));
  } catch (err) {
    next(err);
  }
}

async function checkScenariosStatuses(req, res, next) {
  try {
    const scenarioIds = req.query.ids.split(",").map((id) => Number(id));

    res.json(await service.checkScenariosStatuses(scenarioIds));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTerminals,
  deleteTerminalScenario,
  getTerminalScenarioVehicleData,
  updateScenarioCosts,
  createTerminalScenario,
  getCreateTerminalScenarioData,
  getVehicleTypeInformation,
  getFinancialData,
  getTerminalScenariosDownloadData,
  getUtilityRates,
  checkScenariosStatuses,
};
