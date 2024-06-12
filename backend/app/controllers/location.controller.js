const locations = require("../services/location.service");

async function get(req, res, next) {
  try {
    const allLocations = await locations.getAll();
    if (req.query.evInsitesEnabled === "true") {
      res.json(allLocations.filter((location) => location.ev_insites_enabled));
      return;
    }
    if (res.locals.jwt === undefined) {
      res.status(401).json({ message: "No authorization token found." });
      return;
    }
    const locationPermissions = res.locals.jwt[
      process.env.AUTH_PERMISSIONS_SCOPE
    ].filter((permission) => permission.startsWith("location:"));

    let userLocations = allLocations.filter((location) => {
      return locationPermissions.some(
        (permission) => permission === `location:${location.name.toLowerCase()}`
      );
    });
    res.json(userLocations);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    res.json(await locations.create(req.body));
  } catch (err) {
    console.error(`Error while creating location`, err.message);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    res.json(await locations.update(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating location`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    res.json(await locations.remove(req.params.id));
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
