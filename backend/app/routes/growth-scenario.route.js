const express = require("express");
const router = express.Router();
const controller = require("../controllers/growth-scenario.controller");

router.get("/getall/:name", controller.getAll);
router.get("/depot/getall/:name", controller.getGrowthScenarioForDepots);
router.get("/:id", controller.get);

router.post("/", controller.create);
router.post("/run-simulation", controller.runSimulation);

router.put("/:id", controller.update);

router.delete("/:id", controller.remove);

module.exports = router;
