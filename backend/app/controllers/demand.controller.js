const utils = require("../utils.js");
const service = require("../services/demand.service");

const getBlockGroupDemands = async (req, res) => {
  const chargingDemandSimulationId = Number(
    req.query.chargingDemandSimulationId
  );
  const hour = req.query.hour !== "all" ? Number(req.query.hour) : undefined;
  const locationId = Number(req.query.location);
  const chargingStrategyIdString = decodeURIComponent(
    req.query.chargingStrategy
  );

  const chargingStrategyIds = chargingStrategyIdString
    .split(",")
    .map((e) => utils.getChargingStrategyIdFromName(e));

  const locationToTerritoryMap = {
    76: [1, 2, 3, 4],
    78: [1],
    79: [2],
    80: [3],
    81: [4],
  };

  try {
    const territoryIds = locationToTerritoryMap[locationId];

    if (territoryIds) {
      return res
        .status(200)
        .json(
          await service.getDemandForTerritories(
            territoryIds,
            chargingDemandSimulationId,
            chargingStrategyIds,
            hour
          )
        );
    }

    return res
      .status(200)
      .json(
        await service.getBlockGroupDemands(
          chargingDemandSimulationId,
          chargingStrategyIds,
          hour
        )
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getBlockGroupDemands,
};
