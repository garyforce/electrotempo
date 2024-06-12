import { useEffect, useState } from "react";
import {
  TerminalScenario,
  NewTerminalScenarioData,
} from "types/terminal-scenario";
import { NewTerminalVehicleType } from "types/vehicle-types";

type UseCreateScenarioDataResult = {
  newTerminalScenarioData: NewTerminalScenarioData;
  vehicleTypes: NewTerminalVehicleType[];
};

export function useCreateScenarioData(
  terminalId: number,
  facilityId: number,
  scenarioId?: number
) {
  const [createScenarioData, setCreateScenarioData] =
    useState<UseCreateScenarioDataResult>();
  const [loadingCreateScenarioData, setLoadingCreateScenarioData] =
    useState(false);
  const [errorLoadingCreateScenarioData, setErrorLoadingCreateScenarioData] =
    useState<Error | null>(null);

  const fetchData = async () => {
    setLoadingCreateScenarioData(true);
    setErrorLoadingCreateScenarioData(null);

    const queryParams = new URLSearchParams({});

    if (scenarioId !== undefined) {
      queryParams.append("scenarioId", scenarioId.toString());
    }

    const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/${terminalId}/facilities/${facilityId}/scenario/create?${queryParams}`;

    try {
      const response = await fetch(url);

      if (response.ok) {
        const result: UseCreateScenarioDataResult = await response.json();
        setCreateScenarioData(result);
      } else {
        setCreateScenarioData(undefined);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorLoadingCreateScenarioData(error);
      }
    }

    setLoadingCreateScenarioData(false);
  };

  useEffect(() => {
    fetchData();
  }, [scenarioId]);

  const refetch = () => {
    fetchData();
  };

  return {
    createScenarioData,
    loadingCreateScenarioData,
    errorLoadingCreateScenarioData,
    refetch,
  };
}

export async function postTerminalScenario(
  terminalId: number,
  facilityId: number,
  apiToken: string,
  data: NewTerminalScenarioData
): Promise<TerminalScenario> {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/${terminalId}/facilities/${facilityId}/scenario/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create terminal scenario");
  }

  return response.json();
}

export async function deleteTerminalScenario(
  terminalId: number,
  facilityId: number,
  terminalScenarioId: number
) {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/${terminalId}/facilities/${facilityId}/scenarios/${terminalScenarioId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
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
