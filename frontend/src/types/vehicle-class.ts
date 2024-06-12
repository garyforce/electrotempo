export type VehicleClassName =
  | "Cars"
  | "Light Trucks"
  | "Straight Trucks"
  | "Tractors";

export type SalesCurveSettings = {
  logisticL: number;
  logisticK: number;
  logisticX0: number;
};

export type VehicleClass = {
  id?: number;
  name: VehicleClassName;
  description: string;
  annualData?: VehicleClassAnnualDatum[];
  config: VehicleClassConfiguration;
  active: boolean;
  permission?: string;
};

export type VehicleClassAnnualDatum = {
  year: number;
  countOfAllVehicles: number;
  evFractionOfSales: number;
  evFractionOfAllVehicles: number;
  numEvs: number;
  iceFractionOfAllVehicles: number;
  numOfRemainingIce: number;
  emissions: EmissionsType;
};

export type EmissionsType = {
  nox: number;
  voc: number;
  pm10: number;
  pm25: number;
  sox: number;
  co2: number;
  [key: string]: number;
};

export type VehicleClassConfiguration = {
  startMarketshare: number;
  startYear: number;
  currentMarketshare: number;
  currentYear: number;
  targetMarketshare: number;
  targetYear: number;
  finalMarketshare: number;
  finalYear: number;
  startingPopulation: number;
  growthRate: number;
  retrofitRate: number;
  retrofitIncentive: boolean;
  retrofitIncentiveSize: number;
  scrappageRate: number;
  scrappageIncentive: boolean;
  scrappageIncentiveSize: number;
};
