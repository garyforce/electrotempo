const feederLines = require("../services/feeder-lines.service");

async function get(req, res, next) {
  try {
    if (req.query.state) {
      const stateFeederLines = await feederLines.getByState(req.query.state);
      res.json(stateFeederLines);
    } else {
      const allFeederLines = await feederLines.getAll();
      res.json(allFeederLines);
    }
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  const id = req.params.id;
  try {
    const feederLine = await feederLines.getById(id);
    res.json(feederLine);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
  getById,
};
