import { useEffect, useState } from "react";
import { TerminalScenarioVehicle } from "types/terminal-scenario-vehicle";

type UseTerminalScenarioVehicleResult = {
  terminalScenarioVehicle: TerminalScenarioVehicle | null;
  loadingTerminalScenarioVehicle: boolean;
  errorLoadingScenarioVehicle: Error | null;
  refetch: () => void;
};

export function useTerminalScenarioVehicle(
  propertyId: number,
  facilityId: number,
  scenarioId: number,
  scenarioVehicleId: number
): UseTerminalScenarioVehicleResult {
  const [terminalScenarioVehicle, setTerminalScenarioVehicle] =
    useState<TerminalScenarioVehicle | null>(null);
  const [loadingTerminalScenarioVehicle, setLoadingTerminalScenarioVehicle] =
    useState(false);
  const [errorLoadingScenarioVehicle, setErrorLoadingScenarioVehicle] =
    useState<Error | null>(null);

  const fetchData = async () => {
    setLoadingTerminalScenarioVehicle(true);
    setErrorLoadingScenarioVehicle(null);

    try {
      if (!scenarioVehicleId) {
        setTerminalScenarioVehicle(null);
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/${propertyId}/facilities/${facilityId}/scenarios/${scenarioId}/${scenarioVehicleId}`
      );

      if (response.ok) {
        const result: TerminalScenarioVehicle = await response.json();
        setTerminalScenarioVehicle(result);
      } else {
        setTerminalScenarioVehicle(null);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorLoadingScenarioVehicle(error);
      }
    }

    setLoadingTerminalScenarioVehicle(false);
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, facilityId, scenarioId, scenarioVehicleId]);

  const refetch = () => {
    fetchData();
  };

  return {
    terminalScenarioVehicle,
    loadingTerminalScenarioVehicle,
    errorLoadingScenarioVehicle,
    refetch,
  };
}
