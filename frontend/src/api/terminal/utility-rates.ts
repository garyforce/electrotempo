import { useEffect, useState } from "react";
import { UtilityRateStructure } from "types/terminal-financial";
import { useAccessToken } from "utils/get-access-token";

export function useUtilityRates(organizationId: number) {
  const [utilityRates, setUtilityRates] = useState<UtilityRateStructure[]>([]);
  const [loadingUtilityRates, setLoadingUtilityRates] = useState(false);
  const [errorLoadingUtilityRates, setErrorLoadingUtilityRates] =
    useState<Error | null>(null);

  const { getToken } = useAccessToken();

  const fetchData = async () => {
    setLoadingUtilityRates(true);
    setErrorLoadingUtilityRates(null);

    try {
      const apiToken = await getToken();

      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/utility-rates?orgId=${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (response.ok) {
        const result: any[] = await response.json();
        setUtilityRates(result);
      } else {
        setUtilityRates([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorLoadingUtilityRates(error);
      }
    }

    setLoadingUtilityRates(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    utilityRates,
    loadingUtilityRates,
    errorLoadingUtilityRates,
    refetch,
  };
}
