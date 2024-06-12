export async function processSitesFile(
  processSitesUrl,
  siteCollectionName,
  fileName,
  apiToken
) {
  const apiEndpoint = `${processSitesUrl}`;
  const response = await fetch(
    `${apiEndpoint}?${new URLSearchParams({
      fileName: fileName,
    })}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        fileName: fileName,
        siteCollectionName: siteCollectionName,
      }),
    }
  );
  if (response.ok) {
    return;
  } else {
    return Promise.reject(response);
  }
}

export async function loadSiteCollections(apiToken) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/site-collections`;
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

export async function loadSites(
  siteCollection,
  chargingDemandSimulationId,
  chargerLevels,
  evNetworks,
  access,
  apiToken
) {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/sites?${new URLSearchParams({
    siteCollectionId: siteCollection.id,
    chargingDemandSimulationId,
    chargerLevels: encodeURIComponent(JSON.stringify(chargerLevels)),
    evNetworks: encodeURIComponent(JSON.stringify(evNetworks)),
    access: encodeURIComponent(JSON.stringify(access)),
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
