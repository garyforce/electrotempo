import { useEffect, useState } from "react";
import { useAccessToken } from "utils/get-access-token";
import { Property } from "types/property";
import { Terminal } from "types/terminal";

export type UseTerminalsResult = {
  terminals: Terminal[];
  loadingTerminals: boolean;
  errorLoadingTerminals: Error | null;
  refetch: () => void;
};

export function useTerminals(): UseTerminalsResult {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loadingTerminals, setLoadingTerminals] = useState(false);
  const [errorLoadingTerminals, setErrorLoadingTerminals] =
    useState<Error | null>(null);

  const { getToken } = useAccessToken();

  const fetchData = async () => {
    setLoadingTerminals(true);
    setErrorLoadingTerminals(null);

    try {
      const apiToken = await getToken();

      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/terminals`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (response.ok) {
        const result: Terminal[] = await response.json();
        setTerminals(result);
      } else {
        setTerminals([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorLoadingTerminals(error);
      }
    }

    setLoadingTerminals(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    terminals,
    loadingTerminals,
    errorLoadingTerminals,
    refetch,
  };
}
