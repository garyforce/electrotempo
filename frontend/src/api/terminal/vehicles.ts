import { useEffect, useState } from "react";
import { VehicleTypeInfo } from "types/terminal";
import { useAccessToken } from "utils/get-access-token";

export function useVehicles(vehicleTypeId: number) {
  const [vehicles, setVehicles] = useState<VehicleTypeInfo[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [errorLoadingVehicles, setErrorLoadingVehicles] =
    useState<Error | null>(null);

  const { getToken } = useAccessToken();

  const fetchData = async (vehicleTypeId: number) => {
    setLoadingVehicles(true);
    setErrorLoadingVehicles(null);

    try {
      const apiToken = await getToken();

      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals/vehicles?vehicleTypeId=${vehicleTypeId}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (response.ok) {
        const result: VehicleTypeInfo[] = await response.json();
        setVehicles(result);
      } else {
        setVehicles([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorLoadingVehicles(error);
      }
    }

    setLoadingVehicles(false);
  };

  useEffect(() => {
    if (vehicleTypeId > 0) {
      fetchData(vehicleTypeId);
    }
  }, [vehicleTypeId]);

  return {
    vehicles,
    loadingVehicles,
    errorLoadingVehicles,
  };
}
