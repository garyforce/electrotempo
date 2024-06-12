import { useEffect, useState } from "react";
import { HubCharger } from "types/hub-charger";
import { useAccessToken } from "utils/get-access-token";

type UseChargersResult = {
  chargers: HubCharger[];
  loadingChargers: boolean;
  error: Error | undefined;
};

const useChargers = (): UseChargersResult => {
  const [chargers, setChargers] = useState<HubCharger[]>([]);
  const [loadingChargers, setLoadingChargers] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { getToken } = useAccessToken();

  const fetchData = async () => {
    setLoadingChargers(true);

    const apiToken = await getToken();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/chargers`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      const data: HubCharger[] = await response.json();

      const chargers = data.sort(
        (c1, c2) => c1.charge_rate_kw - c2.charge_rate_kw
      );

      setChargers(chargers);
      setLoadingChargers(false);
    } catch (error) {
      setError(error as Error);
      setLoadingChargers(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { chargers, loadingChargers, error };
};

export default useChargers;
