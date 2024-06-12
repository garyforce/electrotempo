const overlays = require("../services/overlays.service");

async function get(req, res, next) {
  try {
    const allOverlays = await overlays.getAll();
    res.json(allOverlays);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    res.json(await overlays.create(req.body));
  } catch (err) {
    console.error(`Error while creating location`, err.message);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    res.json(await overlays.update(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating location`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    res.json(await overlays.remove(req.params.id));
  } catch (err) {
    console.error(`Error while deleting location`, err.message);
    next(err);
  }
}

module.exports = {
  get,
  create,
  update,
  remove,
};
