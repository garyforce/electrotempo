export async function loadSubstations(trafficModelId, apiToken) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/substations?${new URLSearchParams({
    trafficModelId: trafficModelId,
  })}`;
  const substationResponse = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (substationResponse.ok) {
    let substationFeatureGroup = await substationResponse.json();
    return substationFeatureGroup;
  } else {
    return Promise.reject(substationResponse);
  }
}
