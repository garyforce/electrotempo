import { useEffect, useState } from "react";
import { HubUtilityRate } from "types/hub-utility-rate";
import { useAccessToken } from "utils/get-access-token";

type UseSiteUtilityRatesResult = {
  utilityRates: HubUtilityRate[];
  loadingSiteUtilityRates: boolean;
  error: Error | undefined;
};

const useSiteUtilityRates = (siteId: number): UseSiteUtilityRatesResult => {
  const [utilityRates, setUtilityRates] = useState<HubUtilityRate[]>([]);
  const [loadingSiteUtilityRates, setLoadingSiteUtilityRates] =
    useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const { getToken } = useAccessToken();

  const fetchData = async () => {
    setLoadingSiteUtilityRates(true);

    const apiToken = await getToken();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/${siteId}/utility-rates`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      const data: HubUtilityRate[] = await response.json();

      setUtilityRates(data);
      setLoadingSiteUtilityRates(false);
    } catch (error) {
      setError(error as Error);
      setLoadingSiteUtilityRates(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId]);

  return { utilityRates, loadingSiteUtilityRates, error };
};

export default useSiteUtilityRates;
