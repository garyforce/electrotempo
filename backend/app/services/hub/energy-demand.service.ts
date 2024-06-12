import { ArrivalData, ArrivalHourData } from "./arrivals.service";
import { ChargerData, ChargerHourData } from "./chargers.service";

export interface EnergyDemandData extends EnergyDemandBaseData {
  utility_threshold: number;
  site_area_threshold: number;
  hourly_data: EnergyDemandHourData[];
}

export interface EnergyDemandHourData extends EnergyDemandBaseData {
  hour: number;
}

export interface EnergyDemandBaseData {
  energy_demand: number;
  energy_supply: number;
  power_demand: number;
  power_supply: number;
  public_energy_demand: number;
  public_energy_supply: number;
  public_power_demand: number;
  public_power_supply: number;
  subscription_energy_demand: number;
  subscription_energy_supply: number;
  subscription_power_demand: number;
  subscription_power_supply: number;
}

export const getEnergyDemandData = (
  vehicleEnergyDemand: number,
  chargerChargeRateKw: number,
  maxUtilitySupplyKw: number,
  arrivalsData: ArrivalData,
  chargersData: ChargerData
): EnergyDemandData => {
  const energyDemandHourlyData = getHourlyData(
    vehicleEnergyDemand,
    chargerChargeRateKw,
    arrivalsData.hourly_data,
    chargersData.hourly_data
  );

  const energyDemandData = energyDemandHourlyData.reduce(
    (energyDemandData: any, hourlyData: EnergyDemandHourData) => {
      Object.keys(hourlyData).map(key => {
        switch (key) {
          case "hour":
            break;
          case "power_demand":
          case "power_supply":
          case "public_power_demand":
          case "public_power_supply":
          case "subscription_power_demand":
          case "subscription_power_supply":
            // Use peak data
            energyDemandData[key] = Math.max(
              energyDemandData[key] || 0,
              hourlyData[key as keyof EnergyDemandHourData]
            );
            break;
          default:
            energyDemandData[key] =
              (energyDemandData[key] || 0) +
              hourlyData[key as keyof EnergyDemandHourData];
        }
      });

      return energyDemandData;
    },
    {}
  );

  const siteAreaThreshold =
    chargersData.site_area_threshold * chargerChargeRateKw;

  return {
    ...energyDemandData,
    utility_threshold: maxUtilitySupplyKw,
    site_area_threshold: siteAreaThreshold,
    hourly_data: energyDemandHourlyData,
  };
};

const getHourlyData = (
  vehicleEnergyDemand: number,
  chargerChargeRateKw: number,
  arrivalsHourlyData: ArrivalHourData[],
  chargersHourlyData: ChargerHourData[]
): EnergyDemandHourData[] => {
  const energyDemandData = [];

  for (let h = 0; h < 24; h++) {
    const { hour, public_arrivals, subscription_arrivals, capture_arrivals } =
      arrivalsHourlyData[h];
    const {
      public_chargers_in_use,
      subscription_chargers_in_use,
      chargers_in_use,
    } = chargersHourlyData[h];

    const publicEnergyPower = calcEnergyPowerSupplyDemand(
      public_arrivals,
      public_chargers_in_use,
      vehicleEnergyDemand,
      chargerChargeRateKw
    );
    const subEnergyPower = calcEnergyPowerSupplyDemand(
      subscription_arrivals,
      subscription_chargers_in_use,
      vehicleEnergyDemand,
      chargerChargeRateKw
    );
    const energyPower = calcEnergyPowerSupplyDemand(
      capture_arrivals,
      chargers_in_use,
      vehicleEnergyDemand,
      chargerChargeRateKw
    );

    energyDemandData.push({
      hour,
      energy_demand: energyPower.energy_demand,
      energy_supply: energyPower.energy_supply,
      power_demand: energyPower.power_demand,
      power_supply: energyPower.power_supply,
      public_energy_demand: publicEnergyPower.energy_demand,
      public_energy_supply: publicEnergyPower.energy_supply,
      public_power_demand: publicEnergyPower.power_demand,
      public_power_supply: publicEnergyPower.power_supply,
      subscription_energy_demand: subEnergyPower.energy_demand,
      subscription_energy_supply: subEnergyPower.energy_supply,
      subscription_power_demand: subEnergyPower.power_demand,
      subscription_power_supply: subEnergyPower.power_supply,
    });
  }

  return energyDemandData;
};

const calcEnergyPowerSupplyDemand = (
  numArrivals: number,
  numChargersInUse: number,
  vehicleEnergyDemand: number,
  chargerChargeRateKw: number
): {
  energy_demand: number;
  energy_supply: number;
  power_demand: number;
  power_supply: number;
} => {
  const energyDemand = numArrivals * vehicleEnergyDemand;
  const energySupply = numChargersInUse * vehicleEnergyDemand;

  const powerDemand = numArrivals * chargerChargeRateKw;
  const powerSupply = numChargersInUse * chargerChargeRateKw;

  return {
    energy_demand: energyDemand,
    energy_supply: energySupply,
    power_demand: powerDemand,
    power_supply: powerSupply,
  };
};
