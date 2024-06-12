const service = require("../services/hub/hub.service");
const downloadService = require("../services/hub/hub-download.service");

async function listSites(req, res, next) {
  try {
    const orgId = res.locals.userOrgId;

    if (!orgId && orgId !== 0) {
      throw new Error("OrgId is undefined");
    }

    res.json(await service.getAllSites(orgId));
  } catch (err) {
    next(err);
  }
}

async function getChargers(req, res, next) {
  try {
    res.json(await service.getChargers());
  } catch (err) {
    next(err);
  }
}

async function getScenarioParameters(req, res, next) {
  try {
    const siteId = Number(req.params.siteId);
    const evGrowthScenarioId = Number(req.params.evGrowthScenarioId);
    const userAuth0Id = res.locals.userAuth0Id;

    res.json(
      await service.getScenarioParameters(
        siteId,
        evGrowthScenarioId,
        userAuth0Id
      )
    );
  } catch (err) {
    next(err);
  }
}

async function updateScenarioParameters(req, res, next) {
  try {
    const siteId = Number(req.params.siteId);
    const scenarioId = Number(req.params.scenarioId);

    res.json(
      await service.updateScenarioParameters(siteId, scenarioId, req.body)
    );
  } catch (err) {
    next(err);
  }
}

async function updateScenarioYears(req, res, next) {
  try {
    const scenarioId = Number(req.params.scenarioId);

    res.json(await service.updateScenarioYears(scenarioId, req.body));
  } catch (err) {
    next(err);
  }
}

async function getSiteDownloadData(req, res, next) {
  try {
    const siteId = Number(req.params.siteId);
    const scenarioId = Number(req.params.scenarioId);
    const sandboxMode = Boolean(Number(req.query.sandboxMode));

    res.json(
      await service.getSiteDownloadData(siteId, scenarioId, !sandboxMode)
    );
  } catch (err) {
    next(err);
  }
}

async function getSiteScenarioData(req, res, next) {
  try {
    const siteId = Number(req.params.siteId);
    const scenarioId = Number(req.params.scenarioId);
    const sandboxMode = Boolean(Number(req.query.sandboxMode));
    const annualAveragePerCharger = Number(req.query.annualAveragePerCharger);

    res.json(
      await service.getSiteScenarioData(
        siteId,
        scenarioId,
        !sandboxMode,
        annualAveragePerCharger
      )
    );
  } catch (err) {
    next(err);
  }
}

async function getFleetArrivals(req, res, next) {
  try {
    const siteId = Number(req.params.siteId);

    res.json(await service.getFleetArrivals(siteId));
  } catch (err) {
    next(err);
  }
}

async function uploadArrivals(req, res, next) {
  try {
    if (!req.file) {
      throw new Error("File must be csv");
    }
    const siteId = Number(req.params.siteId);
    const override = Boolean(Number(req.query.override));
    const auth0Id = res.locals.userOrgId || null;

    return res.json(
      await service.uploadArrivals(siteId, auth0Id, req.file.path, override)
    );
  } catch (err) {
    const errorMessage = typeof err === "string" ? err : err.message;
    res.status(400).json({ error: errorMessage });
  }
}

async function deleteFleetArrivals(req, res, next) {
  try {
    const siteId = Number(req.params.siteId);
    const { delete_ids } = req.body;

    if (!delete_ids || !delete_ids.length) {
      return res.status(400).json({ error: "Missing delete_ids" });
    }

    res.json(await service.deleteFleetArrivals(siteId, delete_ids));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getSiteUtilityRates(req, res, next) {
  try {
    const siteId = Number(req.params.siteId);

    res.json(await service.getSiteUtilityRates(siteId));
  } catch (err) {
    next(err);
  }
}

async function getSitesDownloadData(req, res, next) {
  const sites = req.query.sites;
  const auth0Id = res.locals.userOrgId || null;

  if (sites) {
    try {
      const sitesParams = JSON.parse(decodeURIComponent(sites));

      res.json(
        await downloadService.getHubScenarioDownloadData(sitesParams, auth0Id)
      );
    } catch (error) {
      res.status(400).send("Invalid sites parameter");
    }
  } else {
    res.status(400).send("Sites parameter is required");
  }
}

module.exports = {
  listSites,
  getChargers,
  getSiteUtilityRates,
  getScenarioParameters,
  updateScenarioParameters,
  updateScenarioYears,
  getSiteDownloadData,
  getSiteScenarioData,
  getFleetArrivals,
  uploadArrivals,
  deleteFleetArrivals,
  getSitesDownloadData,
};
