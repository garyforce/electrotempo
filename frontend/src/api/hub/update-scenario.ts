import { HubScenarioYear } from "types/hub-scenario-year";

export async function updateHubScenario(
  siteId: number,
  scenarioId: number,
  scenario: any
) {
  const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/${siteId}/scenarios/${scenarioId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scenario),
  });

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

export async function updateHubScenarioYears(
  siteId: number,
  scenarioId: number,
  scenarioYears: HubScenarioYear[]
) {
  const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/${siteId}/scenarios/${scenarioId}/years`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scenarioYears),
  });

  if (!response.ok) {
    throw new Error("Failed to update scenario years");
  }
  return response.json();
}
