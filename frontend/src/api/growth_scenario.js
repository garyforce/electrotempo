export async function loadGrowthScenarios(apiToken, location) {
  if (location) {
    const response = await fetch(
      `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios/getall/${location.name}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
    if (response.ok) {
      let growthScenariosData = await response.json();
      return {
        scenarios: growthScenariosData.result,
        isAdmin: growthScenariosData.admin,
      };
    } else {
      return Promise.reject(new Error(response));
    }
  }
}

export async function loadDepotGrowthScenarios(apiToken, location) {
  if (location) {
    const response = await fetch(
      `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios/depot/getall/${location.name}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
    if (response.ok) {
      let growthScenariosData = await response.json();
      return growthScenariosData.result;
    } else {
      return Promise.reject(new Error(response));
    }
  }
}

export async function loadGrowthScenario(growthScenarioId, apiToken) {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios/${growthScenarioId}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(new Error(response));
  }
}

export async function loadGrowthScenarioAnnualData(growthScenario, apiToken) {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios/${growthScenario.id}/annual-data`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    data.sort((a, b) => a.year - b.year);
    return data;
  } else {
    return Promise.reject(new Error(response));
  }
}

export async function loadGrowthScenarioParameters(growthScenario, apiToken) {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios/${growthScenario.id}/parameters`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(new Error(response));
  }
}

export async function postGrowthScenario(growthScenario, apiToken) {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios`,
    {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        growthScenario,
      }),
    }
  );
  // assuming response isn't empty...
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }

  // response might be empty. This still fails when
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  return data;
}

export async function runGrowthScenarioSimulation(
  growthScenario,
  apiToken,
  location
) {
  growthScenario.location = location;
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios/run-simulation`,
    {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(growthScenario),
    }
  );
  // assuming response isn't empty...
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }

  // response might be empty. This still fails when
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  return data;
}

export async function deleteGrowthScenario(growthScenarioId, apiToken) {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/growth-scenarios/${growthScenarioId}`,
    {
      method: "delete",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(new Error(response));
  }
}
