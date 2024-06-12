export async function loadDemand(
  chargingDemandSimulationId,
  chargingStrategy,
  hour,
  location = "",
  apiToken
) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/demand?${new URLSearchParams({
    chargingDemandSimulationId,
    chargingStrategy,
    hour,
    location,
  })}`;
  const demandResponse = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (demandResponse.ok) {
    const demandData = await demandResponse.json();
    let mappedDemand = {};
    demandData.forEach((blockGroup) => {
      mappedDemand[blockGroup.block_group_id] = blockGroup.demand_kwh;
    });
    return mappedDemand;
  } else {
    return Promise.reject(new Error(demandResponse));
  }
}

export async function loadChargingCapacity(
  chargingDemandSimulationId,
  selectedChargerLevels,
  evNetworks,
  access,
  apiToken
) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/charging-capacity?${new URLSearchParams({
    chargingDemandSimulationId,
    chargerLevels: encodeURIComponent(JSON.stringify(selectedChargerLevels)),
    evNetworks: encodeURIComponent(JSON.stringify(evNetworks)),
    access: encodeURIComponent(JSON.stringify(access)),
  })}`;
  const chargingCapacityResponse = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (chargingCapacityResponse.ok) {
    const chargingCapacity = await chargingCapacityResponse.json();
    let mapped = {};
    chargingCapacity.forEach((blockGroup) => {
      mapped[blockGroup.block_group_id] =
        blockGroup.daily_charging_capacity_kwh;
    });
    return mapped;
  } else {
    return Promise.reject(new Error(chargingCapacityResponse));
  }
}
