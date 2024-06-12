import { useCallback, useState } from "react";
import { FinancialData, FinancialControls } from "types/terminal-financial";
import { useDebouncedEffect } from "dashboard/useDebouncedEffect";

const DEBOUNCE_DELAY = 500;

type UseFinancialData = {
  financialData: FinancialData | null;
  loadingFinancialData: boolean;
  errorLoadingFinancialData: Error | null;
  refetch: () => void;
};
type FinancialProps = {
  terminalId: number;
  facilityId: number;
  scenarioId: number;
  scenarioVehicleId: number;
  financialControls: FinancialControls;
};
export function useFinancialData({
  terminalId,
  facilityId,
  scenarioId,
  scenarioVehicleId,
  financialControls,
}: FinancialProps): UseFinancialData {
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [loadingFinancialData, setLoadingFinancialData] =
    useState<boolean>(false);
  const [errorLoadingFinancialData, setErrorLoadingFinancialData] =
    useState<Error | null>(null);

  const fetchData = async () => {
    setLoadingFinancialData(true);
    setErrorLoadingFinancialData(null);

    try {
      const urlParams = new URLSearchParams();

      Object.keys(financialControls).forEach((key) => {
        const value = financialControls[key as keyof typeof financialControls];
        urlParams.append(key, value.toString());
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/${terminalId}/facilities/${facilityId}/scenarios/${scenarioId}/${scenarioVehicleId}/financial?${urlParams}`
      );

      if (response.ok) {
        const result: FinancialData = await response.json();
        setFinancialData(result);
      } else {
        setFinancialData(null);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorLoadingFinancialData(error);
      }
    }

    setLoadingFinancialData(false);
  };

  const delayedFetchData = useCallback(fetchData, [
    terminalId,
    facilityId,
    scenarioId,
    scenarioVehicleId,
    financialControls,
  ]);

  useDebouncedEffect(
    delayedFetchData,
    [terminalId, facilityId, scenarioId, scenarioVehicleId, financialControls],
    DEBOUNCE_DELAY
  );
  const refetch = () => {
    fetchData();
  };

  return {
    financialData,
    loadingFinancialData,
    errorLoadingFinancialData,
    refetch,
  };
}
