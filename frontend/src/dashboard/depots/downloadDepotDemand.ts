import { DepotDemand } from "types/electric-demand";
import { downloadFile } from "utils/file";

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

const convertToCSV = (data: any, allDayCheckbox: boolean): string => {
  const {
    depot_id,
    hourid,
    simulation_year,
    power_demand_kw_summer,
    power_demand_kw_winter,
    power_demand_kw_shoulder,
    energy_demand_kwh_summer,
    energy_demand_kwh_winter,
    energy_demand_kwh_shoulder,
  } = data;

  if (allDayCheckbox) {
    return `${checkForNull(depot_id)},${checkForNull(
      simulation_year
    )},${checkForNull(power_demand_kw_summer)},${checkForNull(
      power_demand_kw_winter
    )},${checkForNull(power_demand_kw_shoulder)},${checkForNull(
      energy_demand_kwh_summer
    )},${checkForNull(energy_demand_kwh_winter)},${checkForNull(
      energy_demand_kwh_shoulder
    )}\n`;
  } else {
    return `${checkForNull(depot_id)},${checkForNull(hourid)},${checkForNull(
      simulation_year
    )},${checkForNull(power_demand_kw_summer)},${checkForNull(
      power_demand_kw_winter
    )},${checkForNull(power_demand_kw_shoulder)},${checkForNull(
      energy_demand_kwh_summer
    )},${checkForNull(energy_demand_kwh_winter)},${checkForNull(
      energy_demand_kwh_shoulder
    )}\n`;
  }
};

export const downloadDepotDemand = async (
  data: DepotDemand[] | undefined,
  allDayCheckbox: boolean
): Promise<boolean> => {
  try {
    let header;
    if (allDayCheckbox) {
      header =
        "Depot ID,Simulation Year,Power Demand (Summer),Power Demand (Winter),Power Demand (Shoulder), Energy Demand (Summer),Energy Demand (Winter),Energy Demand (Shoulder)\n";
    } else {
      header =
        "Depot ID,Hour ID,Simulation Year,Power Demand (Summer),Power Demand (Winter),Power Demand (Shoulder), Energy Demand (Summer),Energy Demand (Winter),Energy Demand (Shoulder)\n";
    }
    const csvData =
      header +
      (data && data.map((item) => convertToCSV(item, allDayCheckbox)).join(""));
    downloadFile(csvData, "depot-demands.csv");
    return true;
  } catch (error) {
    console.error("Error during download:", error);
    return false;
  }
};
