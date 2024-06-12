const {
  getBlockGroupsForTerritories,
  getBlockGroupsByTrafficModel,
} = require("../services/block-group.service");

const getBlockGroups = async (req, res) => {
  const trafficModelId = Number(req.query.trafficModelId);
  const locationId = Number(req.query.location);

  const locationToTerritoryBlockGroupSearchParamsMap = {
    76: [
      { territoryId: 1, trafficModelId: 3 }, // Austin Energy
      { territoryId: 2, trafficModelId: 21 }, // CPS New
      { territoryId: 3, trafficModelId: 23 }, // NBU Dump
      { territoryId: 4, trafficModelId: 22 }, // LCRA
    ],
    78: [{ territoryId: 1, trafficModelId }], // Austin Energy
    79: [{ territoryId: 2, trafficModelId }], // CPS New
    80: [{ territoryId: 3, trafficModelId }], // NBU Dump
    81: [{ territoryId: 4, trafficModelId }], // LCRA
  };

  try {
    const searchParams =
      locationToTerritoryBlockGroupSearchParamsMap[locationId];

    if (searchParams) {
      return res
        .status(200)
        .json(await getBlockGroupsForTerritories(searchParams));
    }

    return res
      .status(200)
      .json(await getBlockGroupsByTrafficModel(trafficModelId));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getBlockGroups,
};
