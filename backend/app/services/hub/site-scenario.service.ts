import { PrismaClient } from "@prisma/client";

import {
  ArrivalData,
  ArrivalHourData,
  getArrivalData,
  getPeakArrivalData,
} from "./arrivals.service";
import {
  ChargerBaseData,
  ChargerData,
  ChargerHourData,
  getChargerData,
} from "./chargers.service";
import {
  EnergyDemandData,
  EnergyDemandHourData,
  getEnergyDemandData,
} from "./energy-demand.service";
import { FinancialData, getFinancialData } from "./financial.service";
import { Decimal } from "@prisma/client/runtime/library";
import { shouldApplyFleetArrivals } from "./fleet-arrivals.service";

const prisma = new PrismaClient();

interface SiteScenarioData {
  id: number;
  name: string;
  address: string;
  external_id: string | null;
  highway_flow: number;
  num_warehouses: number;
  growth_rate: number;
  lat: number;
  lon: number;
  scenario: {
    id: number;
    name: string;
    area: number;
    year: number;
    trucks_parking_pct: number;
    trailers_parking_pct: number;
    nearby_parking: number;
    public_charger_pct: number;
    yearly_params: ScenarioYearData[];
    calculated_data: CalculatedData;
  };
}

interface SegmentData {
  vehicle_type_id: number;
  vehicle_type: string;
  vehicle_type_description: string | null;
  vehicle_energy_demand: number;
  vehicle_parking_space_requirement: number;
  parking_pct: number;
  year: number;
  capture_rate: number;
  subscription_capture_rate: number;
  ev_adoption_rate: number;
  max_utility_supply: number;
  charger_cost: number;
  vehicle_charger: Charger | null;
  arrivals: ArrivalData;
  chargers: ChargerData;
  energy_demand: EnergyDemandData;
  financial: FinancialData;
}

interface CalculatedData {
  aggregate_data: AggregateData;
  segment_data: SegmentData[];
}

interface AggregateData {
  arrivals: ArrivalData;
  chargers: ChargerBaseData;
  energy_demand: EnergyDemandData;
  financial: FinancialData;
}

export const calcSiteScenarioData = async (
  siteId: number,
  scenarioId: number,
  useOptimal: boolean = true,
  annualAveragePerCharger?: number
): Promise<SiteScenarioData> => {
  // When fleet arrivals are available calculate data for all years to get calculated yearly params
  if (await shouldApplyFleetArrivals(siteId)) {
    const siteScenarioData = await calcSiteScenarioDataAllYears(
      siteId,
      scenarioId,
      useOptimal,
      annualAveragePerCharger
    );

    // Filter calculated data for the selected year
    siteScenarioData.scenario.calculated_data =
      siteScenarioData.scenario.calculated_data[
        `${siteScenarioData.scenario.year}`
      ];

    return siteScenarioData;
  }

  const site = await fetchSiteData(siteId);
  const scenario = await fetchScenarioData(siteId, scenarioId);
  const siteVehicles = await fetchSiteVehicles(siteId);
  const scenarioYears = await fetchScenarioYears(
    scenarioId,
    scenario.evGrowthScenarioId
  );

  const calculatedData = await getCalculatedData(
    siteVehicles,
    site,
    scenario,
    useOptimal,
    annualAveragePerCharger
  );

  return {
    ...site,
    scenario: {
      ...scenario,
      yearly_params: scenarioYears,
      calculated_data: calculatedData,
    },
  };
};

export const calcSiteScenarioDataAllYears = async (
  siteId: number,
  scenarioId: number,
  useOptimal: boolean = true,
  annualAveragePerCharger?: number
) => {
  const site = await fetchSiteData(siteId);
  const scenario = await fetchScenarioData(siteId, scenarioId);
  const siteVehicles = await fetchSiteVehicles(siteId);
  const scenarioYears = await fetchScenarioYears(
    scenarioId,
    scenario.evGrowthScenarioId
  );

  // Get distinct years
  const selectedYears = [
    ...new Set(scenarioYears.map((scenarioYear) => scenarioYear.year)),
  ];

  const calculatedData: any = {};
  for (const selectedYear of selectedYears) {
    calculatedData[`${selectedYear}`] = await getCalculatedData(
      siteVehicles,
      site,
      scenario,
      useOptimal,
      annualAveragePerCharger,
      selectedYear
    );
  }

  // Extract calculated yearly params
  const yearlyParams = Object.values(calculatedData)
    .flat()
    .map((data: any) => data.segment_data)
    .flat()
    .map((segmentData) => ({
      vehicle_type_id: segmentData.vehicle_type_id,
      year: segmentData.year,
      ev_adoption_rate: segmentData.ev_adoption_rate,
      capture_rate: segmentData.capture_rate,
      subscription_capture_rate: segmentData.subscription_capture_rate,
      max_utility_supply: segmentData.max_utility_supply / 1000,
    }));

  return {
    ...site,
    scenario: {
      ...scenario,
      yearly_params: yearlyParams,
      calculated_data: calculatedData,
    },
  };
};

const getCalculatedData = async (
  siteVehicles: SiteVehicleData[],
  site: SiteData,
  scenario: ScenarioData,
  useOptimal: boolean = true,
  annualAveragePerCharger?: number,
  selectedYear?: number
): Promise<CalculatedData> => {
  let calcInputs: CalculationInput[] = [];
  for (const siteVehicle of siteVehicles) {
    const scenarioYear = await fetchScenarioYearData(
      scenario.id,
      scenario.evGrowthScenarioId,
      selectedYear || scenario.year,
      siteVehicle.vehicle_type_id
    );

    const calcInput = getCalculationInput(
      site,
      scenario,
      scenarioYear,
      siteVehicle,
      annualAveragePerCharger
    );

    calcInputs.push({ ...calcInput, annualAveragePerCharger });
  }

  if (useOptimal) {
    calcInputs = await calcOptimalChargers(calcInputs);
  }

  const segmentData: SegmentData[] = [];
  for (const calcInput of calcInputs) {
    const siteVehicleData = await calcSegmentData(calcInput);
    segmentData.push(siteVehicleData);
  }

  const aggregateArrivals = await calcAggregateArrivalData(segmentData);
  const aggregateChargers = calcAggregateChargerData(
    segmentData,
    aggregateArrivals
  );
  const aggregateEnergyDemand = calcAggregateEnergyDemandData(segmentData);
  const aggregateFinancial = calcAggregateFinancialData(segmentData);

  return {
    aggregate_data: {
      arrivals: aggregateArrivals,
      chargers: aggregateChargers,
      energy_demand: aggregateEnergyDemand,
      financial: aggregateFinancial,
    },
    segment_data: segmentData,
  };
};

const calcSegmentData = async (
  calcInput: CalculationInput
): Promise<SegmentData> => {
  const {
    selectedYear,
    currentYear,
    numArrivals,
    vehicleTypeId,
    vehicleType,
    vehicleTypeDescription,
    siteId,
    siteGrowthRate,
    siteParkingArea,
    publicPct,
    vehicleParkingPct,
    vehicleParkingArea,
    vehicleCharger,
    chargerCost,
    chargerChargeRateKw,
    vehicleEnergyDemand,
    captureRate,
    subCaptureRate,
    evAdoptionRate,
    maxUtilitySupplyKw,
    utilityRateId,
    optPublicChargers,
    optSubChargers,
    annualAveragePerCharger,
  } = calcInput;

  const arrivalsData = await getArrivalData(
    siteId,
    numArrivals,
    vehicleTypeId,
    siteGrowthRate,
    selectedYear,
    currentYear,
    publicPct,
    evAdoptionRate,
    captureRate,
    subCaptureRate
  );

  const chargersData = getChargerData(
    siteParkingArea,
    vehicleParkingArea,
    vehicleParkingPct,
    chargerChargeRateKw,
    maxUtilitySupplyKw,
    publicPct,
    arrivalsData,
    optPublicChargers,
    optSubChargers
  );

  const energyDemandData = getEnergyDemandData(
    vehicleEnergyDemand,
    chargerChargeRateKw,
    maxUtilitySupplyKw,
    arrivalsData,
    chargersData
  );

  // TODO: Store utility rate foreign key on scenario and replace site id here
  const financialData = await getFinancialData(
    siteId,
    utilityRateId,
    chargerCost,
    chargerChargeRateKw,
    chargersData,
    energyDemandData,
    annualAveragePerCharger
  );

  return {
    vehicle_type_id: vehicleTypeId,
    vehicle_type: vehicleType,
    vehicle_type_description: vehicleTypeDescription,
    vehicle_energy_demand: vehicleEnergyDemand,
    vehicle_parking_space_requirement: vehicleParkingArea,
    parking_pct: vehicleParkingPct,
    year: selectedYear,
    capture_rate: arrivalsData.capture_rate || 0,
    subscription_capture_rate: arrivalsData.subscription_capture_rate || 0,
    ev_adoption_rate: evAdoptionRate,
    max_utility_supply: maxUtilitySupplyKw,
    charger_cost: chargerCost,
    vehicle_charger: vehicleCharger,
    arrivals: arrivalsData,
    chargers: chargersData,
    energy_demand: energyDemandData,
    financial: financialData,
  };
};

const calcAggregateArrivalData = async (
  segmentData: SegmentData[]
): Promise<ArrivalData> => {
  return segmentData.reduce(
    (aggData: ArrivalData, data: SegmentData) => {
      const { arrivals } = data;

      aggData.capture_arrivals += arrivals.capture_arrivals;
      aggData.subscription_capture_arrivals +=
        arrivals.subscription_capture_arrivals;
      aggData.public_arrivals += arrivals.public_arrivals;
      aggData.subscription_arrivals += arrivals.subscription_arrivals;

      aggData.hourly_data = calcAggregateArrivalHourlyData(
        aggData.hourly_data,
        arrivals.hourly_data
      );

      aggData.peaks = getPeakArrivalData(aggData.hourly_data);

      return aggData;
    },
    {
      capture_arrivals: 0,
      subscription_capture_arrivals: 0,
      public_arrivals: 0,
      subscription_arrivals: 0,
      peaks: {} as any,
      hourly_data: [],
    }
  );
};

const calcAggregateArrivalHourlyData = (
  aggArrivalHourlyData: ArrivalHourData[],
  arrivalHourlyData: ArrivalHourData[]
): ArrivalHourData[] => {
  return arrivalHourlyData.reduce(
    (aggData: ArrivalHourData[], data: ArrivalHourData) => {
      const { hour } = data;

      aggData[hour] = aggData[hour] || {};

      Object.keys(data).map((key) => {
        switch (key) {
          case "hour":
            aggData[hour][key as keyof ArrivalHourData] =
              data[key as keyof ArrivalHourData];
            break;
          default:
            aggData[hour][key as keyof ArrivalHourData] =
              (aggData[hour][key as keyof ArrivalHourData] || 0) +
              data[key as keyof ArrivalHourData];
        }
      });

      return aggData;
    },
    aggArrivalHourlyData
  );
};

const calcAggregateChargerData = (
  segmentData: SegmentData[],
  aggregateArrivalData: ArrivalData
): ChargerBaseData => {
  return segmentData.reduce(
    (aggData: ChargerBaseData, data: SegmentData) => {
      const { chargers } = data;

      aggData.num_chargers_needed += chargers.num_chargers_needed;
      aggData.num_assignable_chargers += chargers.num_assignable_chargers;
      aggData.num_public_chargers += chargers.num_public_chargers;
      aggData.num_subscription_chargers += chargers.num_subscription_chargers;
      aggData.site_area_threshold += chargers.site_area_threshold;

      aggData.utility_constrained_feasible_chargers = Math.min(
        chargers.utility_threshold,
        aggData.utility_constrained_feasible_chargers +
          chargers.utility_constrained_feasible_chargers
      );
      aggData.parking_area_constrained_feasible_chargers = Math.min(
        chargers.site_area_threshold,
        aggData.parking_area_constrained_feasible_chargers +
          chargers.parking_area_constrained_feasible_chargers
      );

      aggData.utility_threshold += chargers.utility_threshold;

      aggData.hourly_data = calcAggregateChargerHourlyData(
        aggData.num_assignable_chargers,
        aggData.num_public_chargers,
        aggData.num_subscription_chargers,
        aggregateArrivalData.hourly_data,
        aggData.hourly_data,
        chargers.hourly_data
      );

      return aggData;
    },
    {
      utility_constrained_feasible_chargers: 0,
      parking_area_constrained_feasible_chargers: 0,
      num_chargers_needed: 0,
      num_assignable_chargers: 0,
      num_public_chargers: 0,
      num_subscription_chargers: 0,
      utility_threshold: 0,
      site_area_threshold: 0,
      hourly_data: [],
    }
  );
};

const calcAggregateChargerHourlyData = (
  aggNumAssignableChargers: number,
  aggNumPublicChargers: number,
  aggNumSubChargers: number,
  aggArrivalHourlyData: ArrivalHourData[],
  aggChargerHourlyData: ChargerHourData[],
  chargerHourlyData: ChargerHourData[]
): ChargerHourData[] => {
  return chargerHourlyData.reduce(
    (aggData: ChargerHourData[], data: ChargerHourData) => {
      const { hour } = data;

      aggData[hour] = aggData[hour] || {};

      Object.keys(data).map((key) => {
        switch (key) {
          case "hour":
            aggData[hour][key as keyof ChargerHourData] =
              data[key as keyof ChargerHourData];
            break;
          case "public_chargers_idle":
          case "public_util_rate":
          case "public_drop_rate":
          case "subscription_chargers_idle":
          case "subscription_util_rate":
          case "subscription_drop_rate":
          case "chargers_idle":
          case "chargers_util_rate":
          case "drop_rate":
            aggData[hour][key as keyof ChargerHourData] = 0;
            break;
          default:
            aggData[hour][key as keyof ChargerHourData] =
              (aggData[hour][key as keyof ChargerHourData] || 0) +
              data[key as keyof ChargerHourData];
        }
      });

      // public_chargers_idle
      aggData[hour].public_chargers_idle =
        aggNumPublicChargers - aggData[hour].public_chargers_in_use;
      // public_util_rate
      aggData[hour].public_util_rate =
        aggData[hour].public_chargers_in_use / aggNumPublicChargers || 0;
      // public_drop_rate
      aggData[hour].public_drop_rate =
        aggData[hour].public_dropped_arrivals /
          aggArrivalHourlyData[hour].public_arrivals || 0;
      // subscription_chargers_idle
      aggData[hour].subscription_chargers_idle =
        aggNumSubChargers - aggData[hour].subscription_chargers_in_use;
      // subscription_util_rate
      aggData[hour].subscription_util_rate =
        aggData[hour].subscription_chargers_in_use / aggNumSubChargers || 0;
      // subscription_drop_rate
      aggData[hour].subscription_drop_rate =
        aggData[hour].subscription_dropped_arrivals /
          aggArrivalHourlyData[hour].subscription_arrivals || 0;
      // chargers_idle
      aggData[hour].chargers_idle =
        aggNumAssignableChargers - aggData[hour].chargers_in_use;
      // chargers_util_rate
      aggData[hour].chargers_util_rate =
        aggData[hour].chargers_in_use / aggNumAssignableChargers || 0;
      // drop_rate
      aggData[hour].drop_rate =
        aggData[hour].dropped_arrivals /
          aggArrivalHourlyData[hour].capture_arrivals || 0;

      return aggData;
    },
    aggChargerHourlyData
  );
};

const calcAggregateEnergyDemandData = (
  segmentData: SegmentData[]
): EnergyDemandData => {
  const aggData = segmentData.reduce(
    (aggData: EnergyDemandData, data: SegmentData) => {
      const { energy_demand } = data;

      aggData.energy_demand += energy_demand.energy_demand;
      aggData.energy_supply += energy_demand.energy_supply;
      aggData.public_energy_demand += energy_demand.public_energy_demand;
      aggData.public_energy_supply += energy_demand.public_energy_supply;
      aggData.subscription_energy_demand +=
        energy_demand.subscription_energy_demand;
      aggData.subscription_energy_supply +=
        energy_demand.subscription_energy_supply;

      aggData.utility_threshold = energy_demand.utility_threshold;
      aggData.site_area_threshold += energy_demand.site_area_threshold;

      aggData.hourly_data = calcAggregateEnergyDemandHourlyData(
        aggData.hourly_data,
        energy_demand.hourly_data
      );

      return aggData;
    },
    {
      energy_demand: 0,
      energy_supply: 0,
      power_demand: 0,
      power_supply: 0,
      public_energy_demand: 0,
      public_energy_supply: 0,
      public_power_demand: 0,
      public_power_supply: 0,
      subscription_energy_demand: 0,
      subscription_energy_supply: 0,
      subscription_power_demand: 0,
      subscription_power_supply: 0,
      utility_threshold: 0,
      site_area_threshold: 0,
      hourly_data: [],
    }
  );

  aggData.hourly_data.map((data) => {
    aggData.power_demand = Math.max(aggData.power_demand, data.power_demand);
    aggData.power_supply = Math.max(aggData.power_supply, data.power_supply);
    aggData.public_power_demand = Math.max(
      aggData.public_power_demand,
      data.public_power_demand
    );
    aggData.public_power_supply = Math.max(
      aggData.public_power_supply,
      data.public_power_supply
    );
    aggData.subscription_power_demand = Math.max(
      aggData.subscription_power_demand,
      data.subscription_power_demand
    );
    aggData.subscription_power_supply = Math.max(
      aggData.subscription_power_supply,
      data.subscription_power_supply
    );
    return data;
  });

  return aggData;
};

const calcAggregateEnergyDemandHourlyData = (
  aggEnergyDemandHourlyData: EnergyDemandHourData[],
  energyDemandHourlyData: EnergyDemandHourData[]
): EnergyDemandHourData[] => {
  return energyDemandHourlyData.reduce(
    (aggData: EnergyDemandHourData[], data: EnergyDemandHourData) => {
      const { hour } = data;

      aggData[hour] = aggData[hour] || {};

      Object.keys(data).map((key) => {
        switch (key) {
          case "hour":
            aggData[hour][key as keyof EnergyDemandHourData] =
              data[key as keyof EnergyDemandHourData];
            break;
          default:
            aggData[hour][key as keyof EnergyDemandHourData] =
              (aggData[hour][key as keyof EnergyDemandHourData] || 0) +
              data[key as keyof EnergyDemandHourData];
        }
      });

      return aggData;
    },
    aggEnergyDemandHourlyData
  );
};

const calcAggregateFinancialData = (segmentData: SegmentData[]) => {
  return segmentData.reduce(
    (aggData: FinancialData, data: SegmentData) => {
      const { financial } = data;

      aggData.capital_expenses.charger_costs +=
        financial.capital_expenses.charger_costs;
      aggData.capital_expenses.chargers_installation_costs +=
        financial.capital_expenses.chargers_installation_costs;
      aggData.operational_costs.energy_cost +=
        financial.operational_costs.energy_cost;
      aggData.operational_costs.energy_demand_cost +=
        financial.operational_costs.energy_demand_cost;
      aggData.operational_costs.maintenance_cost +=
        financial.operational_costs.maintenance_cost;

      return aggData;
    },
    {
      capital_expenses: {
        charger_costs: 0,
        chargers_installation_costs: 0,
      },
      operational_costs: {
        energy_cost: 0,
        energy_demand_cost: 0,
        maintenance_cost: 0,
      },
    }
  );
};

const calcOptimalChargers = async (
  calcInputs: CalculationInput[]
): Promise<CalculationInput[]> => {
  let maxConsumption = 0;
  let maxUtilitySupplyKw = 0;

  for (const calcInput of calcInputs) {
    const { peaks } = await getArrivalData(
      calcInput.siteId,
      calcInput.numArrivals,
      calcInput.vehicleTypeId,
      calcInput.siteGrowthRate,
      calcInput.selectedYear,
      calcInput.currentYear,
      calcInput.publicPct,
      calcInput.evAdoptionRate,
      calcInput.captureRate,
      calcInput.subCaptureRate
    );

    calcInput.optPublicChargers = peaks.peak_public_arrivals;
    calcInput.optSubChargers = peaks.peak_subscription_arrivals;

    maxUtilitySupplyKw = calcInput.maxUtilitySupplyKw;
    maxConsumption +=
      (peaks.peak_public_arrivals + peaks.peak_subscription_arrivals) *
      calcInput.chargerChargeRateKw;
  }

  if (maxConsumption > maxUtilitySupplyKw) {
    const chargerSplitRate = maxUtilitySupplyKw / maxConsumption;
    calcInputs.map((calcInput) => {
      calcInput.optPublicChargers = Math.round(
        (calcInput.optPublicChargers || 0) * chargerSplitRate
      );
      calcInput.optSubChargers = Math.round(
        (calcInput.optSubChargers || 0) * chargerSplitRate
      );
      return calcInput;
    });
  }

  return calcInputs;
};

interface CalculationInput {
  selectedYear: number;
  currentYear: number;
  numArrivals: number;
  vehicleTypeId: number;
  vehicleType: string;
  vehicleTypeDescription: string | null;
  siteId: number;
  siteGrowthRate: number;
  siteParkingArea: number;
  publicPct: number;
  vehicleParkingPct: number;
  vehicleParkingArea: number;
  vehicleCharger: Charger;
  chargerCost: number;
  chargerChargeRateKw: number;
  vehicleEnergyDemand: number;
  captureRate: number;
  subCaptureRate: number;
  evAdoptionRate: number;
  maxUtilitySupplyKw: number;
  utilityRateId: number | null;
  optPublicChargers?: number;
  optSubChargers?: number;
  annualAveragePerCharger?: number;
}

const getCalculationInput = (
  site: SiteData,
  scenario: ScenarioData,
  scenarioYear: ScenarioYearData,
  siteVehicle: SiteVehicleData,
  annualAveragePerCharger?: number
): CalculationInput => {
  const {
    area,
    public_charger_pct,
    trucks_parking_pct,
    trailers_parking_pct,
    utility_rate_id,
    parking_area,
  } = scenario;

  const {
    year,
    capture_rate,
    subscription_capture_rate,
    ev_adoption_rate,
    max_utility_supply,
  } = scenarioYear;

  const { num_daily_arrivals, vehicle_type, charger_cost } = siteVehicle;

  const selectedYear = year;
  const currentYear = new Date().getFullYear();

  const siteParkingArea = parking_area > 0 ? parking_area : area;

  const vehicleCharger = siteVehicle.charger
    ? siteVehicle.charger
    : siteVehicle.vehicle_type.charger;
  if (!vehicleCharger) {
    throw new Error(`No chargers assigned to site vehicle ${siteVehicle.id}`);
  }

  const chargerChargeRateKw = Number(vehicleCharger.charge_rate_kw);
  const chargerCost = Number(charger_cost) || Number(vehicleCharger.price);

  const { vehicleParkingPct, vehicleEnergyDemand } = getVehicleData(
    vehicle_type.id,
    trucks_parking_pct,
    trailers_parking_pct
  );

  const maxUtilitySupplyKw = max_utility_supply * 1000;

  return {
    selectedYear,
    currentYear,
    numArrivals: num_daily_arrivals,
    vehicleTypeId: vehicle_type.id,
    vehicleType: vehicle_type.type,
    vehicleTypeDescription: vehicle_type.description,
    siteId: site.id,
    siteGrowthRate: site.growth_rate,
    siteParkingArea,
    publicPct: public_charger_pct,
    vehicleParkingPct,
    vehicleParkingArea: vehicle_type.parking_area,
    vehicleCharger,
    chargerCost,
    chargerChargeRateKw,
    vehicleEnergyDemand,
    captureRate: capture_rate,
    subCaptureRate: subscription_capture_rate,
    evAdoptionRate: ev_adoption_rate,
    maxUtilitySupplyKw,
    utilityRateId: utility_rate_id,
    annualAveragePerCharger,
  };
};

const getVehicleData = (
  vehicleTypeId: number,
  trucksParkingPct: number,
  trailerParkingPct: number
): {
  vehicleParkingPct: number;
  vehicleEnergyDemand: number;
} => {
  const TRUCK_TYPE_ID = 2;
  const TRAILER_TYPE_ID = 3;
  // TODO: Store these values in vehicle_types
  const TRUCK_ENERGY_DEMAND = 150; // kilowatt
  const TRAILER_ENERGY_DEMAND = 364; // kilowatt

  // TODO: Move parking pct to site_vehicle or scenario_year
  const vehicleParkingPct =
    vehicleTypeId === TRUCK_TYPE_ID ? trucksParkingPct : trailerParkingPct;

  const vehicleEnergyDemand =
    vehicleTypeId === TRUCK_TYPE_ID
      ? TRUCK_ENERGY_DEMAND
      : TRAILER_ENERGY_DEMAND;

  return {
    vehicleParkingPct,
    vehicleEnergyDemand,
  };
};

interface SiteData {
  id: number;
  name: string;
  address: string;
  external_id: string | null;
  highway_flow: number;
  num_warehouses: number;
  growth_rate: number;
  lat: number;
  lon: number;
}

const fetchSiteData = async (siteId: number): Promise<SiteData> => {
  return await prisma.hubSite.findUniqueOrThrow({
    where: {
      id: siteId,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      address: true,
      external_id: true,
      highway_flow: true,
      num_warehouses: true,
      growth_rate: true,
      lat: true,
      lon: true,
    },
  });
};

interface ScenarioData {
  id: number;
  name: string;
  area: number;
  year: number;
  trucks_parking_pct: number;
  trailers_parking_pct: number;
  nearby_parking: number;
  public_charger_pct: number;
  utility_rate_id: number | null;
  parking_area: number;
  evGrowthScenarioId: number | null;
  utility_rate: {
    id: number;
    utility: {
      id: number;
      name: string;
    };
    energy_charge_rate: number;
    demand_charge_rate: number;
  } | null;
}

const fetchScenarioData = async (
  siteId: number,
  scenarioId: number
): Promise<ScenarioData> => {
  const scenarioData = await prisma.hubScenario.findUniqueOrThrow({
    where: {
      id: scenarioId,
      site_id: siteId,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      area: true,
      year: true,
      trucks_parking_pct: true,
      trailers_parking_pct: true,
      nearby_parking: true,
      public_charger_pct: true,
      utility_rate_id: true,
      parking_area: true,
      evGrowthScenarioId: true,
      evGrowthScenario: {
        select: {
          id: true,
          name: true,
        },
      },
      utility_rate: {
        select: {
          id: true,
          utility: {
            select: {
              id: true,
              name: true,
            },
          },
          energy_charge_rate: true,
          demand_charge_rate: true,
        },
      },
    },
  });

  const { evGrowthScenario: _, ...rest } = scenarioData;

  if (scenarioData.evGrowthScenario) {
    // Use timeline scenario name
    return {
      ...rest,
      name: scenarioData.evGrowthScenario.name,
    };
  }

  return rest;
};

interface SiteVehicleData {
  id: number;
  num_daily_arrivals: number;
  vehicle_type_id: number;
  vehicle_type: {
    id: number;
    type: string;
    description: string | null;
    parking_area: number;
    charger: Charger | null;
  };
  charger: Charger | null;
  charger_cost: Decimal;
}

interface Charger {
  id: number;
  name: string;
  make: string;
  model: string;
  charge_rate_kw: Decimal;
  voltage: Decimal;
  amperage: Decimal;
  price: Decimal;
}

const fetchSiteVehicles = async (
  siteId: number
): Promise<SiteVehicleData[]> => {
  const chargerSelect = {
    select: {
      id: true,
      name: true,
      make: true,
      model: true,
      charge_rate_kw: true,
      voltage: true,
      amperage: true,
      price: true,
    },
  };

  return await prisma.hubSiteVehicle.findMany({
    where: {
      site_id: siteId,
    },
    select: {
      id: true,
      num_daily_arrivals: true,
      vehicle_type_id: true,
      vehicle_type: {
        select: {
          id: true,
          type: true,
          description: true,
          parking_area: true,
          charger: chargerSelect,
        },
      },
      charger: chargerSelect,
      charger_cost: true,
    },
    orderBy: {
      vehicle_type_id: "asc",
    },
  });
};

interface ScenarioYearData {
  vehicle_type_id: number;
  year: number;
  capture_rate: number;
  subscription_capture_rate: number;
  ev_adoption_rate: number;
  max_utility_supply: number;
}

const fetchScenarioYearData = async (
  scenarioId: number,
  evGrowthScenarioId: number | null,
  year: number,
  vehicleTypeId: number
): Promise<ScenarioYearData> => {
  const scenarioYear = await prisma.hubScenarioYear.findFirstOrThrow({
    where: {
      scenario_id: scenarioId,
      year,
      vehicle_type_id: vehicleTypeId,
    },
    select: {
      vehicle_type_id: true,
      year: true,
      ev_adoption_rate: true,
      capture_rate: true,
      subscription_capture_rate: true,
      max_utility_supply: true,
    },
  });

  if (evGrowthScenarioId) {
    const evPenetrationRate = await fetchEvPenetrationRate(
      evGrowthScenarioId,
      year,
      vehicleTypeId
    );

    return {
      ...scenarioYear,
      ev_adoption_rate: evPenetrationRate,
    };
  }

  return scenarioYear;
};

const fetchScenarioYears = async (
  scenarioId: number,
  evGrowthScenarioId: number | null
): Promise<ScenarioYearData[]> => {
  const scenarioYears = await prisma.hubScenarioYear.findMany({
    where: {
      scenario_id: scenarioId,
    },
    select: {
      vehicle_type_id: true,
      year: true,
      ev_adoption_rate: true,
      capture_rate: true,
      subscription_capture_rate: true,
      max_utility_supply: true,
    },
  });

  if (evGrowthScenarioId) {
    const scenarioYearsData: ScenarioYearData[] = [];
    for (const scenarioYear of scenarioYears) {
      const evPenetrationRate = await fetchEvPenetrationRate(
        evGrowthScenarioId,
        scenarioYear.year,
        scenarioYear.vehicle_type_id
      );

      scenarioYearsData.push({
        ...scenarioYear,
        ev_adoption_rate: evPenetrationRate,
      });
    }

    return scenarioYearsData;
  }

  return scenarioYears;
};

const fetchEvPenetrationRate = async (
  evGrowthScenarioId: number,
  year: number,
  vehicleTypeId: number
): Promise<number> => {
  const vehicleTypeToVehicleClassIdMap = {
    1: 2,
    2: 3,
    3: 4,
  };

  const vehicleClassId =
    vehicleTypeToVehicleClassIdMap[
      vehicleTypeId as keyof typeof vehicleTypeToVehicleClassIdMap
    ];

  const evPenetrationRateData =
    await prisma.vHubTimelineLinkageAnnualData.findFirst({
      where: {
        evGrowthScenarioId,
        vehicleClassId,
        year,
      },
      select: {
        evGrowthScenarioId: true,
        vehicleClassId: true,
        year: true,
        evPenetrationRate: true,
      },
    });

  return evPenetrationRateData
    ? Number(evPenetrationRateData.evPenetrationRate)
    : 0;
};
