import { useEffect, useState } from "react";
import { SiteScenarioData } from "types/hub-scenario-data";
import { useAccessToken } from "utils/get-access-token";

type UseSiteScenarioDataResult = {
  siteScenarioData: SiteScenarioData | undefined;
  loadingSiteScenarioData: boolean;
  error: Error | undefined;
  refetch: () => void;
};
const useSiteScenarioData = (
  siteId: number,
  scenarioId: number | undefined,
  optimalStatus: boolean,
  annualAveragePerCharger: number
): UseSiteScenarioDataResult => {
  const [siteScenarioData, setSiteScenarioData] = useState<SiteScenarioData>();
  const [loadingSiteScenarioData, setLoadingSiteScenarioData] =
    useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { getToken } = useAccessToken();

  const fetchSiteScenarioData = async () => {
    setLoadingSiteScenarioData(true);
    const apiToken = await getToken();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/hub/sites/${siteId}/scenarios/${scenarioId}/calculate${
          !optimalStatus ? "?sandboxMode=1&" : "?"
        }annualAveragePerCharger=${annualAveragePerCharger}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      const data = await response.json();

      setSiteScenarioData(data);
      setLoadingSiteScenarioData(false);
    } catch (error) {
      setError(error as Error);
      setLoadingSiteScenarioData(false);
    }
  };

  useEffect(() => {
    if (scenarioId) {
      fetchSiteScenarioData();
    }
  }, [siteId, scenarioId, optimalStatus, annualAveragePerCharger]);

  const refetch = () => {
    if (scenarioId) {
      fetchSiteScenarioData();
    }
  };

  return {
    siteScenarioData,
    loadingSiteScenarioData,
    error,
    refetch,
  };
};

export default useSiteScenarioData;
