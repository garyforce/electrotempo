const express = require("express");
const router = express.Router();
const salesRouter = require("../controllers/sales-data.controller");

/* GET locations. */
router.get("/", salesRouter.get);

module.exports = router;