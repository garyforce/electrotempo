import { useEffect, useState } from "react";
import { downloadedDataType } from "types/downloadCalculatedData";

interface useDownloadDataHookReturntype {
  downloadData?: downloadedDataType | null;
  error?: Error | undefined;
}
export const getDownloadData = async (
  siteId: number | undefined,
  scenarioId: number | undefined,
  optimalStatus: boolean
): Promise<useDownloadDataHookReturntype> => {
  try {
    if (scenarioId) {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/hub/site/${siteId}/scenario/${scenarioId}/download${
          !optimalStatus ? "?sandboxMode=1" : ""
        }`
      );
      const downloadData = await response.json();
      return { downloadData };
    } else {
      return { error: new Error("Scenario Data is undefined") };
    }
  } catch (error) {
    return { error: new Error("Unable to fetch Scenario Data") };
  }
};
