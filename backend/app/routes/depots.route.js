const express = require("express");
const router = express.Router();
const controller = require("../controllers/depots.controller");

router.get("/", controller.get);
router.get("/:id", controller.getById);
router.get("/:state/:id", controller.getByIdAndState);
router.put("/disable/:id/:state", controller.disableDepotById);
router.post("/report", controller.reportMissingDepot);

module.exports = router;
