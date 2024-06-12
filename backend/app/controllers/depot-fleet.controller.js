const service = require("../services/depot-fleet.service");

async function get(req, res, next) {
  // if year is not a parsable year, return a 400 error
  if (req.query.year !== undefined && isNaN(Number(req.query.year))) {
    res.status(400).send("year must be a number");
    return;
  }

  const depotId =
    req.query.depotId === undefined ? undefined : Number(req.query.depotId);
  const year =
    req.query.year === undefined ? undefined : Number(req.query.year);
  try {
    const fleetSize = await service.get(depotId, year);
    res.json(fleetSize);
  } catch (err) {
    next(err);
  }
}

async function getByState(req, res, next) {
  // if year is not a parsable year, return a 400 error
  if (req.query.year !== undefined && isNaN(Number(req.query.year))) {
    res.status(400).send("year must be a number");
    return;
  }
  if (req.params.state === undefined || req.params.state === null) {
    res.status(400).send("state is required");
    return;
  }

  const depotId =
    req.query.depotId === undefined ? undefined : Number(req.query.depotId);
  const year =
    req.query.year === undefined ? undefined : Number(req.query.year);
  const stateAbbreviation = req.params.state;
  try {
    const fleetSize = await service.getByState(
      depotId,
      year,
      stateAbbreviation
    );
    res.json(fleetSize);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
  getByState,
};
