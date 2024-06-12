const feederLineDemand = require("../services/feeder-line-demand.service");

async function get(req, res, next) {
  const feederLineId = req.query.feederLineId;
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
    const stateFeederLineDemand = await feederLineDemand.get(
      feederLineId,
      year,
      hour,
      state
    );
    res.json(stateFeederLineDemand);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
};
