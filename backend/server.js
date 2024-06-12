// dotenv must be first because logger relies on it
require("dotenv").config();

const logger = require("./log.js");
logger.info(`Logger initialized.`);

const https = require("https");
const http = require("http");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const jwtDecode = require("jwt-decode");
const growthScenarioRouter = require("./app/routes/growth-scenario.route");
const locationRouter = require("./app/routes/location.route");
const overlayRouter = require("./app/routes/overlays.route");
const feederLineRouter = require("./app/routes/feeder-lines.route");
const feederLineDemandRouter = require("./app/routes/feeder-line-demand.route");
const depotDemandRouter = require("./app/routes/depot-demand.route");
const depotRouter = require("./app/routes/depots.route");
const depotFleetSizeRouter = require("./app/routes/depot-fleet.route.js");
const hubRouter = require("./app/routes/hub.route.js");
const terminalRouter = require("./app/routes/terminal.route.js");
const salesRouter = require("./app/routes/sales-data.route.js");
const webhooksRouter = require("./app/routes/webhooks.route.js");

const authorizeAccessToken = require("./auth.js");

let credentials = {};
if (process.env.USE_HTTPS == "true") {
  // naive boolean comparison because of how dotenv works
  credentials = {
    key: fs.readFileSync(process.env.HTTPS_PRIVATE_KEY),
    cert: fs.readFileSync(process.env.HTTPS_CERT),
  };
}
logger.debug(`Using HTTPS: ${process.env.USE_HTTPS}`);
const app = express();

app.use(cors());
app.options("*", cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// log every request
app.use(function (req, res, next) {
  logger.info(`Received ${req.method} ${req.originalUrl}`);
  res.on("finish", function () {
    logger.info(`Responded to ${req.method} ${req.originalUrl}`);
  });
  next();
});

// store userAuth0Id after authentication, if we need it later
app.use(function (req, res, next) {
  try {
    const token = jwtDecode(req.headers.authorization);
    res.locals.userAuth0Id = token.sub;
    res.locals.jwt = token;
    res.locals.userOrgId = token[process.env.AUTH_ORG_ID_CLAIM];
  } catch (error) {
    res.locals.userAuth0Id = undefined;
  }
  next();
});

//All the routes under app/routes
app.use("/webhooks", webhooksRouter);
require("./app/routes/block_group.route.js")(app);
app.use("/growth-scenarios", growthScenarioRouter);
require("./app/routes/demand.route.js")(app);
require("./app/routes/charging_station.route.js")(app);
require("./app/routes/substation.route.js")(app);
require("./app/routes/demographics.route.js")(app);
app.use("/locations", locationRouter);
app.use("/overlays", overlayRouter);
app.use("/feeder-lines", feederLineRouter);
app.use("/feeder-line-demand", feederLineDemandRouter);
app.use("/depots", depotRouter);
app.use("/depot-demand", depotDemandRouter);
app.use("/depot-fleets", depotFleetSizeRouter);
app.use("/hub", hubRouter);
app.use("/terminals", terminalRouter);
app.use("/sales-data", salesRouter);
require("./app/routes/justice40.route.js")(app);
require("./app/routes/user.route.js")(app);
require("./app/routes/traffic_model.route.js")(app);
require("./app/routes/charging_demand_simulation.route.js")(app);
require("./app/routes/sites.route.js")(app);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = 500;
  logger.error(`${err.message}\n${err.stack}`);
  res.status(statusCode).json({ message: "Internal server error." });
  return;
});

if (process.env.USE_HTTPS == "true") {
  https.createServer(credentials, app).listen(process.env.PORT);
  logger.info(`Created HTTPS server on port ${process.env.PORT}`);
} else {
  http.createServer(app).listen(process.env.PORT);
  logger.info(`Created HTTP server on port ${process.env.PORT}`);
}
