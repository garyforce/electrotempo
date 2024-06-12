const { sendMail } = require("../sendMail");
const depots = require("../services/depots.service");

async function get(req, res, next) {
  try {
    if (req.query.state && req.query.locationId) {
      const stateDepots = await depots.getByState(req.query.state, req.query.locationId, req.query.depotCategory);
      res.json(stateDepots);
    } else {
      const allDepots = await depots.getAll();
      res.json(allDepots);
    }
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  const id = Number(req.params.id);
  try {
    const depot = await depots.getById(id);
    res.json(depot);
  } catch (err) {
    next(err);
  }
}

async function getByIdAndState(req, res, next) {
  let id;
  const stateAbbreviation = req.params.state;
  if (["TX", "CPS", "NBU", "LCRA", "AE", "FIRST_ENERGY"].includes(stateAbbreviation)) {
    id = req.params.id;
  }
  else {
    id = Number(req.params.id);
  }
  try {
    const depot = await depots.getByIdAndState(id, stateAbbreviation);
    res.json(depot);
  } catch (err) {
    next(err);
  }
}

async function disableDepotById(req, res, next) {
  let id;
  const stateAbbreviation = req.params.state;
  if (["TX", "CPS", "NBU", "LCRA", "AE", "FIRST_ENERGY"].includes(stateAbbreviation)) {
    id = req.params.id;
  }
  else {
    id = Number(req.params.id);
  }
  try {
    const depot = await depots.disableDepotById(id, stateAbbreviation);
    res.json(depot);
  } catch (err) {
    next(err);
  }
}

async function reportMissingDepot(req, res, next) {
  const userInfo = res.locals;
  try {
    await sendMail(req.body, userInfo);
    res.json({ sucess: "Successfully send the request." })
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
  getById,
  getByIdAndState,
  disableDepotById,
  reportMissingDepot
};
