const express = require("express");
const router = express.Router();
const overlaysController = require("../controllers/overlays.controller");

/* GET overlays. */
router.get("/", overlaysController.get);

module.exports = router;
