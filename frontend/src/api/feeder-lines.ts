import { Feature } from "geojson";

export const loadFeederLines = async (stateAbbr: string, apiToken: string) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${
      process.env.REACT_APP_API_PORT
    }/feeder-lines?${new URLSearchParams({ state: stateAbbr })}`,
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
    return Promise.reject(new Error("Failed to fetch feeder lines."));
  }
};

export const loadFeederLine = async (
  id: string,
  apiToken: string
): Promise<Feature> => {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/feeder-lines/${id}`,
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
    return Promise.reject(new Error("Failed to fetch feeder line."));
  }
};
