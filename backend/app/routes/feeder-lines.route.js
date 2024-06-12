const express = require("express");
const router = express.Router();
const controller = require("../controllers/feeder-lines.controller");

router.get("/", controller.get);
router.get("/:id", controller.getById);

module.exports = router;
