import { useEffect, useState } from "react";
import { useAccessToken } from "utils/get-access-token";
import { HubSite } from "types/hub-site";

type UseSiteResult = {
  sites: HubSite[];
  loadingSites: boolean;
  error: Error | undefined;
  refetch: () => void;
};

const useSite = (): UseSiteResult => {
  const [sites, setSites] = useState<HubSite[]>([]);
  const [loadingSites, setLoadingSites] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { getToken } = useAccessToken();

  const fetchSites = async () => {
    setLoadingSites(true);

    const apiToken = await getToken();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      const data = await response.json();
      setSites(data);
      setLoadingSites(false);
    } catch (error) {
      setError(error as Error);
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const refetch = () => {
    fetchSites();
  };

  return { sites, loadingSites, error, refetch };
};

export default useSite;
