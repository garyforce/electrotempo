const depotDemand = require("../services/depot-demand.service");

async function get(req, res, next) {
  const state = req.query.state;
  const isTxPPC = ["TX", "CPS", "NBU", "LCRA", "AE", "FIRST_ENERGY"].includes(state);
  const depotId =
    req.query.depotId === undefined ? undefined : isTxPPC ? req.query.depotId : Number(req.query.depotId);
  const year =
    req.query.year === undefined ? undefined : Number(req.query.year);
  let hour;
  if (req.query.hour === undefined) {
    hour = undefined;
  } else if (typeof req.query.hour === "string" && req.query.hour.toLowerCase() === "all") {
    hour = req.query.hour.toLowerCase();
  } else {
    hour = Number(req.query.hour);
  }
  const scenarioId =
    req.query.scenarioId === undefined ? undefined : Number(req.query.scenarioId);

  if ((hour !== undefined && hour < 0) || hour > 23 && typeof hour !== "string") {
    res.status(400).send("hour must be between 0 and 23");
    return;
  }

  try {
    const stateDepotDemand = await depotDemand.get(depotId, year, hour, state, scenarioId);
    res.json(stateDepotDemand);
  } catch (err) {
    next(err);
  }
}

async function getByState(req, res, next) {
  const depotId =
    req.query.depotId === undefined ? undefined : Number(req.query.depotId);
  const state = req.query.state;
  const year =
    req.query.year === undefined ? undefined : Number(req.query.year);
  const hour =
    req.query.hour === undefined ? undefined : Number(req.query.hour);

  if ((hour !== undefined && hour < 0) || hour > 23) {
    res.status(400).send("hour must be between 0 and 23");
    return;
  }

  try {
    const stateDepotDemand = await depotDemand.getByState(
      depotId,
      year,
      hour,
      state
    );
    res.json(stateDepotDemand);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
  getByState,
};
