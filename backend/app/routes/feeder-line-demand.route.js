const express = require("express");
const router = express.Router();
const controller = require("../controllers/feeder-line-demand.controller");

router.get("/", controller.get);

module.exports = router;
