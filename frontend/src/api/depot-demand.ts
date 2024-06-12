export const loadDepotDemand = async (
  apiToken: string,
  depotId?: string,
  stateAbbr?: string,
  year?: number,
  hour?: number | "all",
  scenarioId?: string
) => {
  const urlParams = new URLSearchParams();
  if (scenarioId !== undefined) {
    urlParams.append("scenarioId", scenarioId);
  }

  if (depotId !== undefined) {
    urlParams.append("depotId", depotId);
  }

  if (stateAbbr !== undefined) {
    urlParams.append("state", stateAbbr);
  }

  if (year !== undefined) {
    urlParams.append("year", year.toString());
  }

  if (hour !== undefined) {
    urlParams.append("hour", hour.toString());
  }

  const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depot-demand?${urlParams}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(new Error("Failed to fetch depot demand."));
  }
};
