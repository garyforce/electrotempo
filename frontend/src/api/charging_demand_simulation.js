export async function loadChargingDemandSimulations(trafficModelId, apiToken) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/charging-demand-simulations?${new URLSearchParams({
    trafficModelId,
  })}`;
  const response = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (response.ok) {
    let data = await response.json();
    return data;
  } else {
    return Promise.reject(response);
  }
}
