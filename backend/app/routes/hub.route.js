const express = require("express");
const multer = require("multer");
const { resolve } = require('path');

const router = express.Router();
const controller = require("../controllers/hub.controller");

router.get("/", controller.listSites);
router.get("/chargers", controller.getChargers);
router.get("/sites/:siteId/utility-rates", controller.getSiteUtilityRates);
router.get("/sites/:siteId/scenarios/:evGrowthScenarioId", controller.getScenarioParameters);
router.get("/sites/:siteId/scenarios/:scenarioId/calculate", controller.getSiteScenarioData);
router.get("/site/:siteId/scenario/:scenarioId/download", controller.getSiteDownloadData);

router.put("/sites/:siteId/scenarios/:scenarioId", controller.updateScenarioParameters);
router.put("/sites/:siteId/scenarios/:scenarioId/years", controller.updateScenarioYears);

const uploadArrivals = multer({
  storage: multer.diskStorage({
    destination: resolve('./uploads/'),
    filename: function (req, file, callback) {
      const timestamp = Date.now();
      const [originalName, ext] = file.originalname.split('.');
      const newFileName = `site-${req.params.siteId}-${originalName}-${timestamp}.${ext}`;
      callback(null, newFileName);
    },
  }),
  fileFilter: function (req, file, callback) {
    if (!['text/csv', 'application/vnd.ms-excel'].includes(file.mimetype)) {
      console.log(`Invalid file type: ${file.mimetype}`);
      return callback(null, false);
    }
    callback(null, true)
  },
  limits: {
    files: 1,
    fileSize: 1024 * 1024, // 1MB
  },
}).single('upload-arrivals');
router.post("/sites/:siteId/arrivals", uploadArrivals, controller.uploadArrivals);
router.get('/sites/:siteId/arrivals', controller.getFleetArrivals);
router.delete('/sites/:siteId/arrivals', controller.deleteFleetArrivals);
router.get("/sites/download", controller.getSitesDownloadData);

module.exports = router;
