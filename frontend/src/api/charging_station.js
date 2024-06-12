export async function loadChargingStations(
  trafficModelId,
  apiToken,
  locationName,
  locationId
) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/charging-stations?${new URLSearchParams({
    trafficModelId,
    locationName,
    locationId,
  })}`;
  const chargingStationResponse = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (chargingStationResponse.ok) {
    let chargingStationFeatureGroup = await chargingStationResponse.json();
    return chargingStationFeatureGroup;
  } else {
    return Promise.reject(chargingStationResponse);
  }
}

export async function loadChargingStationNetworks(apiToken) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/charging-stations/networks`;
  const response = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (response.ok) {
    const evNetworks = await response.json();
    return evNetworks.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  } else {
    return Promise.reject(response);
  }
}
