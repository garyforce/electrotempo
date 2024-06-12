import { useEffect, useState } from "react";

export type DepotFleet = {
  depotId: number;
  actCategory: number;
  vehicleClassName: string;
  simulationYear: number;
  totalVehicles: number;
  totalEvs: number;
};

export type UseDepotFleetResult = {
  depotFleet: DepotFleet[] | null;
  loadingDepotFleet: boolean;
  errorLoadingDepotFleet: Error | null;
};

export function useDepotFleet(
  depotId: number,
  year: number
): UseDepotFleetResult {
  const [depotFleet, setDepotFleet] = useState<DepotFleet[] | null>(null);
  const [loadingDepotFleet, setLoadingDepotFleet] = useState(false);
  const [errorLoadingDepotFleet, setErrorLoadingDepotFleet] =
    useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingDepotFleet(true);
      setErrorLoadingDepotFleet(null);

      try {
        const urlParams = new URLSearchParams();
        if (depotId !== undefined) {
          urlParams.append("depotId", depotId.toString());
        }

        if (year !== undefined) {
          urlParams.append("year", year.toString());
        }

        const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depot-fleets?${urlParams}`;

        const response = await fetch(url);
        const result: DepotFleet[] = await response.json();

        setDepotFleet(result);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorLoadingDepotFleet(error);
        } else {
          setErrorLoadingDepotFleet(new Error("Unknown error"));
        }
      }

      setLoadingDepotFleet(false);
    };

    fetchData();
  }, [depotId, year]);

  return { depotFleet, loadingDepotFleet, errorLoadingDepotFleet };
}

export function useDepotFleetByState(
  depotId: number,
  year: number,
  stateAbbreviation: string,
  isTxPPC: boolean
): UseDepotFleetResult {
  const [depotFleet, setDepotFleet] = useState<DepotFleet[] | null>(null);
  const [loadingDepotFleet, setLoadingDepotFleet] = useState(false);
  const [errorLoadingDepotFleet, setErrorLoadingDepotFleet] =
    useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingDepotFleet(true);
      setErrorLoadingDepotFleet(null);

      try {
        const urlParams = new URLSearchParams();
        if (depotId !== undefined) {
          urlParams.append("depotId", depotId.toString());
        }

        if (year !== undefined) {
          urlParams.append("year", year.toString());
        }

        const url =
          stateAbbreviation !== undefined
            ? `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depot-fleets/${stateAbbreviation}?${urlParams}`
            : `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depot-fleets/${urlParams}`;

        const response = await fetch(url);
        const result: DepotFleet[] = await response.json();

        if (result.length) {
          setDepotFleet(result);
        } else {
          setDepotFleet([]);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorLoadingDepotFleet(error);
        } else {
          setErrorLoadingDepotFleet(new Error("Unknown error"));
        }
      }

      setLoadingDepotFleet(false);
    };

    if (!isTxPPC) {
      fetchData();
    }
  }, [depotId, year, stateAbbreviation, isTxPPC]);

  return { depotFleet, loadingDepotFleet, errorLoadingDepotFleet };
}
