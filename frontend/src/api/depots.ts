import { Feature } from "geojson";
import { useEffect, useState } from "react";

export const loadDepots = async (
  stateAbbr: string,
  locationId: string,
  depotCategory: string,
  apiToken: string
) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${
      process.env.REACT_APP_API_PORT
    }/depots?${new URLSearchParams({
      state: stateAbbr,
      locationId: locationId,
      depotCategory: depotCategory,
    })}`,
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
    return Promise.reject(new Error("Failed to fetch depots."));
  }
};

export const loadDepot = async (
  depotId: string,
  apiToken: string
): Promise<Feature> => {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depots/${depotId}`,
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
    return Promise.reject(new Error("Failed to fetch depot."));
  }
};

export function useDepot(depotId: number) {
  const [depot, setDepot] = useState<Feature | null>(null);
  const [loadingDepot, setLoadingDepot] = useState(false);
  const [errorLoadingDepot, setErrorLoadingDepot] = useState<Error | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoadingDepot(true);
      setErrorLoadingDepot(null);

      try {
        const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depots/${depotId}`;

        const response = await fetch(url);
        const result: Feature = await response.json();

        setDepot(result);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorLoadingDepot(error);
        } else {
          setErrorLoadingDepot(new Error("Unknown error"));
        }
      }

      setLoadingDepot(false);
    };

    fetchData();
  }, [depotId]);

  return { depot, loadingDepot, errorLoadingDepot };
}

export function useDepotInState(depotId: number, stateAbbreviation: string) {
  const [depot, setDepot] = useState<Feature | null>(null);
  const [loadingDepot, setLoadingDepot] = useState(false);
  const [errorLoadingDepot, setErrorLoadingDepot] = useState<Error | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoadingDepot(true);
      setErrorLoadingDepot(null);

      try {
        const urlParams = new URLSearchParams();

        if (stateAbbreviation !== undefined) {
          urlParams.append("state", stateAbbreviation);
        }
        if (depotId !== undefined) {
          urlParams.append("depotId", depotId.toString());
        }

        const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depots/${stateAbbreviation}/${depotId}`;

        const response = await fetch(url);
        const result: Feature = await response.json();

        setDepot(result);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorLoadingDepot(error);
        } else {
          setErrorLoadingDepot(new Error("Unknown error"));
        }
      }

      setLoadingDepot(false);
    };

    fetchData();
  }, [depotId, stateAbbreviation]);

  return { depot, loadingDepot, errorLoadingDepot };
}

export const disableDepotInformation = async (
  apiToken: string,
  depotId: string,
  stateAbbreviation: string
) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depots/disable/${depotId}/${stateAbbreviation}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(new Error("Failed to fetch depots."));
  }
};
