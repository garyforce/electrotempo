const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");

/* GET locations. */
router.get("/", locationController.get);

/* POST location */
router.post("/", locationController.create);

/* PUT location */
router.put("/:id", locationController.update);

/* DELETE location */
router.delete("/:id", locationController.remove);

module.exports = router;
