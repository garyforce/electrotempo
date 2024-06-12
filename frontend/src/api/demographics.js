export async function loadDemographics(
  trafficModelId,
  acsMetricId,
  acsSegmentId,
  invert,
  apiToken
) {
  // note for acsMetrricsId: poverty is 2, whites is 3
  acsSegmentId = 1; // was hardcoded before refactor
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/demographics?${new URLSearchParams({
    trafficModelId: trafficModelId,
    acsMetricId: acsMetricId,
    acsSegmentId: acsSegmentId,
    invert: invert,
  })}`;
  const demographicsResponse = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (demographicsResponse.ok) {
    const demographicsData = await demographicsResponse.json();
    let mappedDemographics = {};
    demographicsData.forEach((blockGroup) => {
      // conditionally creating demographic data object
      let demographicsData = {};
      // and populating it
      demographicsData[acsMetricId.toString()] = blockGroup.metric_value;
      mappedDemographics[blockGroup.block_group_id] = demographicsData;
    });
    return mappedDemographics;
  } else {
    return Promise.reject(demographicsResponse);
  }
}

export async function loadJustice40(state, apiToken) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/justice40?${new URLSearchParams({
    state: state,
  })}`;
  const apiResponse = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (apiResponse.ok) {
    const justice40Data = await apiResponse.json();
    return justice40Data;
  } else {
    return Promise.reject(apiResponse);
  }
}
