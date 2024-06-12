import { useState } from "react";

type UseUpdateScenarioCostsResult = {
  updateScenarioCosts: (
    propertyId: number,
    facilityId: number,
    scenarioId: number,
    chargerCost: number,
    vehicleCost: number,
    installationCost: number
  ) => Promise<void>;
  loadingScenarioCosts: boolean;
  errorScenarioCosts: Error | null;
};

export function useUpdateScenarioCosts(): UseUpdateScenarioCostsResult {
  const [loadingScenarioCosts, setLoadingScenarioCosts] =
    useState<boolean>(false);
  const [errorScenarioCosts, setErrorScenarioCosts] = useState<Error | null>(
    null
  );

  const updateScenarioCosts = async (
    propertyId: number,
    facilityId: number,
    scenarioId: number,
    chargerCost: number,
    vehicleCost: number,
    installationCost: number
  ) => {
    setLoadingScenarioCosts(true);
    setErrorScenarioCosts(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/${propertyId}/facilities/${facilityId}/scenarios/${scenarioId}/update-costs`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chargerCost,
            vehicleCost,
            installationCost,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update scenario costs");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorScenarioCosts(error);
      }
    } finally {
      setLoadingScenarioCosts(false);
    }
  };

  return {
    updateScenarioCosts,
    loadingScenarioCosts,
    errorScenarioCosts,
  };
}
