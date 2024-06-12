import { TrafficModel } from "types/traffic-model";

export async function loadTrafficModels(
  locationId: string,
  apiToken: string
): Promise<TrafficModel[]> {
  const apiEndpoint = `${process.env.REACT_APP_API_HOST}:${
    process.env.REACT_APP_API_PORT
  }/traffic-models?${new URLSearchParams({
    locationId: String(locationId),
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
