const express = require("express");
const router = express.Router();
const controller = require("../controllers/terminal.controller");

router.get("/", controller.getAllTerminals);

router.get("/scenarios/download", controller.getTerminalScenariosDownloadData);
router.get("/utility-rates", controller.getUtilityRates);
router.get("/check-status", controller.checkScenariosStatuses);

router.delete(
  "/:propertyId/facilities/:facilityId/scenarios/:id",
  controller.deleteTerminalScenario
);

router.get(
  "/:propertyId/facilities/:facilityId/scenarios/:scenarioId/:scenarioVehicleId",
  controller.getTerminalScenarioVehicleData
);

router.put(
  "/:propertyId/facilities/:facilityId/scenarios/:scenarioId/update-costs",
  controller.updateScenarioCosts
);

router.post(
  "/:propertyId/facilities/:facilityId/scenario/create",
  controller.createTerminalScenario
);

router.get(
  "/:propertyId/facilities/:facilityId/scenario/create",
  controller.getCreateTerminalScenarioData
);

router.get("/vehicles", controller.getVehicleTypeInformation);

router.get(
  "/:propertyId/facilities/:facilityId/scenarios/:scenarioId/:scenarioVehicleId/financial",
  controller.getFinancialData
);

module.exports = router;
