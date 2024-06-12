import { downloadFile } from "utils/file";

export type downloadSalesDataProps = {
  type: string;
  sales: SalesModel[];
};

export type SalesModel = {
  make: string;
  model: string;
  model_year: number;
  zip_code: number;
  registration_date: string;
  registration_expiry_date_inferred: string;
  vin_prefix: string;
  dmv_snapshot_id: number;
  dmv_snapshot_date: string;
  latest_dmv_snapshot_flag: number;
  state_abbreviation: string;
  county: string;
  technology: string;
  sale_price: string;
  price_quote_date: string;
  battery_capacity_kwh: number;
  max_charge_rate_kw: number;
};

const checkForNull = (data: any) => {
  return data ?? "";
};

const convertToCSV = (data: SalesModel): string => {
  const {
    make,
    model,
    model_year,
    zip_code,
    registration_date,
    registration_expiry_date_inferred,
    vin_prefix,
    dmv_snapshot_id,
    dmv_snapshot_date,
    latest_dmv_snapshot_flag,
    state_abbreviation,
    county,
    technology,
    sale_price,
    price_quote_date,
    battery_capacity_kwh,
    max_charge_rate_kw,
  } = data;

  return `${checkForNull(make)},${checkForNull(model)},${checkForNull(
    model_year
  )},${checkForNull(zip_code)},${checkForNull(
    registration_date
  )},${checkForNull(registration_expiry_date_inferred)},${checkForNull(
    vin_prefix
  )},${checkForNull(dmv_snapshot_id)},${checkForNull(
    dmv_snapshot_date
  )},${checkForNull(latest_dmv_snapshot_flag)},${checkForNull(
    state_abbreviation
  )},${checkForNull(county)},${checkForNull(technology)},"${checkForNull(
    sale_price?.trim()
  )}",${checkForNull(price_quote_date)},${checkForNull(
    battery_capacity_kwh
  )},${checkForNull(max_charge_rate_kw)}\n`;
};

export const downloadSalesData = async (
  data: downloadSalesDataProps,
  locationName: string
): Promise<boolean> => {
  try {
    const header =
      "Make,Model,Model Year,Zip Code,Registration Date,Registration Exp Date,VIN Prefix,DMV Snapshot ID,DMV Snapshot Date,Latest Snapshot,State Abbreviation,County,Technology (BEV/PHEV),Sale Price,Price Quote Date,Battery Capacity(kwh),Max Charge Rate(kw)\n";
    const csvData = header + data.sales.map(convertToCSV).join("");
    downloadFile(
      csvData,
      `ev-registration-${locationName.toLowerCase()}-data.csv`
    );
    return true;
  } catch (error) {
    console.error("Error during download:", error);
    return false;
  }
};
