import { useState, useEffect } from "react";

export type fleetsDataType = {
  [fleet: string]: {
    id: number;
    vehicle_type_id: number;
    num_arrivals: number;
  }[];
};

export const useFleetsDownloadData = (siteId: number) => {
  const [fleetsData, setFleetsData] = useState<fleetsDataType>({});
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const fetchSites = async () => {
    setLoadingData(true);
    try {
      if (siteId) {
        const response = await fetch(
          `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/${siteId}/arrivals`
        );
        const data: fleetsDataType = await response.json();
        setFleetsData(data);
        setLoadingData(false);
      } else {
        setError(new Error("Scenario Data is undefined"));
        setLoadingData(false);
      }
    } catch (error) {
      setError(error as Error);
      setLoadingData(false);
    }
  };
  useEffect(() => {
    fetchSites();
  }, [siteId]);
  const refetch = () => {
    fetchSites();
  };
  return { fleetsData, refetch, loadingData, error };
};

type ResponseData = {
  override: Object[];
};
export async function confirmDuplicate(
  siteId: number,
  data: FormData,
  id: number
): Promise<ResponseData> {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/${siteId}/arrivals?override=${id}`,
    {
      method: "POST",
      body: data,
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`${errorData.error}`);
  }

  const responseData = await response.json();
  return responseData;
}

export async function deleteFleetData(siteId: number, fleetIds: number[]) {
  const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/${siteId}/arrivals`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ delete_ids: fleetIds }),
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
