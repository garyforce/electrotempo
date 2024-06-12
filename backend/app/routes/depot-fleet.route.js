const express = require("express");
const router = express.Router();
const controller = require("../controllers/depot-fleet.controller");

router.get("/", controller.get);
router.get("/:state/", controller.getByState);

module.exports = router;
