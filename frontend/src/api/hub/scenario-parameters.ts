import { useEffect, useState } from "react";
import { HubScenarioParameters } from "types/hub-scenario-parameters";
import { useAccessToken } from "utils/get-access-token";

type UseScenarioParametersResult = {
  scenarioParameters: HubScenarioParameters | undefined;
  loading: boolean;
  error: Error | undefined;
};

const useScenarioParameters = (
  siteId: number,
  evGrowthScenarioId: number
): UseScenarioParametersResult => {
  const [scenarioParameters, setScenarioParameters] =
    useState<HubScenarioParameters>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const { getToken } = useAccessToken();

  const fetchData = async () => {
    setLoading(true);

    const apiToken = await getToken();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/${siteId}/scenarios/${evGrowthScenarioId}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      const data = await response.json();

      setScenarioParameters(data);
      setLoading(false);
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId, evGrowthScenarioId]);

  return { scenarioParameters, loading, error };
};

export default useScenarioParameters;
