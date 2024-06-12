import { FeatureCollection } from "geojson";
import { downloadFile } from "utils/file";

export type Depots = {
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    id: number;
    owner: string;
    business_name: string;
    legal_area: number;
    lgl_area_u: string;
    gis_area: number;
    gis_area_u: string;
    description: string;
    family: string;
    land_value: number;
    imp_value: number;
    mkt_value: number;
    address: string;
    situs_num: number;
    street1: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
    google_places_list: string;
    datasource: string;
  };
};

const mapDataSourceToCategory = (datasource: string) => {
  const lowerDatasource = datasource.toLowerCase();
  if (lowerDatasource === "wdt") {
    return "Warehouse, Trucking, and Distribution Center";
  } else if (lowerDatasource.includes("fmcsa")) {
    return "Registered Longhaul Fleets";
  } else if (lowerDatasource === "highway-corridor") {
    return "Highway Corridor";
  } else if (lowerDatasource === "municipal-fleets") {
    return "Municipal Fleets";
  } else {
    return "Others";
  }
};

export type downloadDepotsProps = {
  type: string;
  features: Depots[];
};

const checkForNull = (data: any) => {
  if (data == null) {
    return "";
  }

  if (typeof data === "string") {
    data = data.replace(/,/g, " "); // Replace commas with spaces
    data = data.replace(/\s+/g, " "); // Replace multiple white spaces with a single space
  }

  return data;
};

const convertToCSV = (data: any): string => {
  const {
    properties: {
      id,
      owner,
      business_name,
      legal_area,
      lgl_area_u,
      gis_area,
      gis_area_u,
      family,
      land_value,
      imp_value,
      mkt_value,
      address,
      situs_num,
      street1,
      street2,
      city,
      state,
      zipcode,
      google_places_list,
      datasource,
    },
    geometry: { coordinates },
  } = data;

  const location = coordinates.reverse().toString();

  return `${checkForNull(id)},${checkForNull(owner)},${checkForNull(
    business_name
  )},${checkForNull(legal_area)},${checkForNull(lgl_area_u)},${checkForNull(
    gis_area
  )},${checkForNull(gis_area_u)},${checkForNull(family)},${checkForNull(
    land_value
  )},${checkForNull(imp_value)},${checkForNull(mkt_value)},${checkForNull(
    address
  )},${checkForNull(situs_num)},${checkForNull(street1)},${checkForNull(
    street2
  )},${checkForNull(city)},${checkForNull(state)},${checkForNull(
    zipcode
  )},${checkForNull(location)},${checkForNull(
    google_places_list?.split(",")?.[0]
  )},${checkForNull(mapDataSourceToCategory(datasource))}\n`;
};

export const downloadDepots = async (
  data: FeatureCollection | undefined
): Promise<boolean> => {
  try {
    const header =
      "Depot ID,Owner,Business Name,Legal Area,Legal Area Unit,Geographic Information System,Geographic Information System Unit,Family,Land Value,Important Value,Market Value,Address,Situs Number,Street1,Street2,City,State,Zipcode,Location,Google Place ID,Depot Category\n";
    const csvData = header + (data && data.features.map(convertToCSV).join(""));
    downloadFile(csvData, "depots.csv");
    return true;
  } catch (error) {
    console.error("Error during download:", error);
    return false;
  }
};
