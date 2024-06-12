import { downloadFile } from "utils/file";

export type ChargingStation = {
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    id: number;
    l1Ports: number;
    l2Ports: number;
    openDate: string;
    access: string;
    dcFastPorts: number;
    evNetwork: string;
    facilityType: string;
    plugTypes: string[];
    status: string;
  };
};

export type DownloadStationsProps = {
  type: string;
  features: ChargingStation[];
};

const checkForNull = (data: any) => {
  return data ?? "";
};

const convertToCSV = (data: ChargingStation): string => {
  const {
    properties: {
      access,
      evNetwork,
      facilityType,
      l1Ports,
      l2Ports,
      dcFastPorts,
      openDate,
      plugTypes,
      status,
    },
    geometry: { coordinates },
  } = data;

  let location = coordinates.toString();
  location = location.replace(",", " ");
  const chargerType = plugTypes.toString().replaceAll(",", "/");

  return `${checkForNull(location)},${checkForNull(chargerType)},${checkForNull(
    evNetwork
  )},${checkForNull(access)},${checkForNull(facilityType)},${checkForNull(
    l1Ports
  )},${checkForNull(l2Ports)},${checkForNull(dcFastPorts)},${checkForNull(
    openDate
  )},${checkForNull(status)}\n`;
};

export const downloadStations = async (
  data: DownloadStationsProps
): Promise<boolean> => {
  try {
    const header =
      "Location,Plug Types,EV Network,Access,Facility Type,L1 Ports,L2 Ports,DC Fast Ports,Open Date,Status\n";
    const csvData = header + data.features.map(convertToCSV).join("");
    downloadFile(csvData, "charging-stations.csv");
    return true;
  } catch (error) {
    console.error("Error during download:", error);
    return false;
  }
};
