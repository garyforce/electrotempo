const { handleSNSNotifications } = require("../controllers/webhooks.controller");
const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();

router.post("/sns", bodyParser.text(), handleSNSNotifications);

module.exports = router;
