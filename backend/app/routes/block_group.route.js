const { getBlockGroups } = require("../controllers/block-group.controller");

const authorizeAccessToken = require("../../auth");

module.exports = (app) => {
  app.use("/block-groups", authorizeAccessToken);
  app.get("/block-groups", getBlockGroups);
};
