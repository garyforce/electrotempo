import { HubScenario, PrismaClient } from "@prisma/client";
import {
  calcSiteScenarioData,
  calcSiteScenarioDataAllYears,
} from "./site-scenario.service";
import {
  deleteFleetArrivalById,
  getFleetArrivalsGroupByLabel,
  importFleetArrivals,
} from "./fleet-arrivals.service";

const prisma = new PrismaClient();

const yearlyParams: any = [
  {
    cat3_ev_adoption_rate: 0.00780655,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 1,

    cat2_ev_adoption_rate: 0.0144609185,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 1,
  },
  {
    cat3_ev_adoption_rate: 0.02258727,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 2,

    cat2_ev_adoption_rate: 0.02637635,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 2,
  },
  {
    cat3_ev_adoption_rate: 0.033241507,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 2,

    cat2_ev_adoption_rate: 0.042226817,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 2,
  },
  {
    cat3_ev_adoption_rate: 0.047222726,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 4,

    cat2_ev_adoption_rate: 0.06334615,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 4,
  },
  {
    cat3_ev_adoption_rate: 0.06666667,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 8,

    cat2_ev_adoption_rate: 0.08857425,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 8,
  },
  {
    cat3_ev_adoption_rate: 0.0891562,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 15,

    cat2_ev_adoption_rate: 0.12056165,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 15,
  },
  {
    cat3_ev_adoption_rate: 0.09730842,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 20,

    cat2_ev_adoption_rate: 0.13112778,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 20,
  },
  {
    cat3_ev_adoption_rate: 0.10514802,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 25,

    cat2_ev_adoption_rate: 0.14153559,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 25
  },
  {
    cat3_ev_adoption_rate: 0.11278913,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 30,

    cat2_ev_adoption_rate: 0.1519434,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 30
  },
  {
    cat3_ev_adoption_rate: 0.12023666,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 35,

    cat2_ev_adoption_rate: 0.16235121,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 35
  },
  {
    cat3_ev_adoption_rate: 0.12749577,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 40,

    cat2_ev_adoption_rate: 0.17275902,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 40
  },
  {
    cat3_ev_adoption_rate: 0.1345719,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 45,

    cat2_ev_adoption_rate: 0.18307107,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 45
  },
  {
    cat3_ev_adoption_rate: 0.14146965,
    cat3_capture_rate: 0.5,
    cat3_subscription_capture_rate: 0.5,
    cat3_max_utility_supply: 50,

    cat2_ev_adoption_rate: 0.19338313,
    cat2_capture_rate: 0.5,
    cat2_subscription_capture_rate: 0.5,
    cat2_max_utility_supply: 50
  }
];

interface ScenarioControls {
  year: number;
  trucksParkingPct: number;
  trailersParkingPct: number;
  publicChargerPct: number;
  parkingArea: number;
  utilityRateId: number | null;
  truckChargerId: number | null;
  truckChargerCost: number;
  trailerChargerId: number | null;
  trailerChargerCost: number;
}

interface ScenarioParameters extends ScenarioControls {
  id: number;
  siteId: number;
  siteName: string;
  name: string;
}

interface ScenarioYearData {
  scenario_id: number;
  vehicle_type_id: number;
  year: number;
  ev_adoption_rate: number;
  capture_rate: number;
  subscription_capture_rate: number;
  max_utility_supply: number;
}

const isOrganizationElectroTempo = async (
  organizationId: number
): Promise<boolean> => {
  // For Localhost there is no et_auth table, so just returning true
  if (process.env.DB_HOST === "localhost") return true;

  const ELECTROTEMPO_ORGANIZATION_NAME = "ElectroTempo";

  const organization: { id: number }[] | null | undefined =
    await prisma.$queryRaw`
  SELECT
    id
  FROM "et_auth"."organization"
  WHERE name = ${ELECTROTEMPO_ORGANIZATION_NAME}
  `;
  return organization?.[0].id === organizationId;
};

const getAllLocations = async () => {
  return await prisma.location.findMany({
    select: {
      id: true,
      name: true,
    },
  });
};

const getHubTimelineScenariosByOrgIdAndLocation = async (
  orgId: number,
  locationName: string
) => {
  return await prisma.vHubTimelineLinkageScenario.findMany({
    where: {
      organizationId: orgId,
      location: {
        equals: locationName,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
    },
    orderBy: {
      id: "desc",
    },
  });
};

export const getAllSites = async (orgId: number) => {
  interface LocationNameById {
    [key: number]: string;
  }
  const isElectroTempo = await isOrganizationElectroTempo(orgId);
  const locations = await getAllLocations();
  const locationNameById = locations.reduce<LocationNameById>(
    (acc, location) => {
      acc[location.id] = location.name;
      return acc;
    },
    {}
  );

  let hubSites = await prisma.hubSite.findMany({
    where: !isElectroTempo
      ? {
          organization_id: orgId,
          deleted_at: null,
        }
      : {
          deleted_at: null,
        },
    select: {
      id: true,
      organization_id: true,
      locationId: true,
      name: true,
      address: true,
      lat: true,
      lon: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const scenariosCache: { [key: number]: any } = {};

  const allHubSites: any[] = await Promise.all(
    hubSites.map(async (hubSite) => {
      if (hubSite.locationId === null) {
        return { ...hubSite, evGrowthScenarios: [] };
      }

      const locationName = locationNameById[hubSite.locationId];

      if (!scenariosCache[hubSite.locationId]) {
        scenariosCache[hubSite.locationId] =
          await getHubTimelineScenariosByOrgIdAndLocation(orgId, locationName);
      }

      return {
        ...hubSite,
        evGrowthScenarios: scenariosCache[hubSite.locationId] || [],
      };
    })
  );

  return allHubSites;
};

export const getHubScenario = async (
  siteId: number,
  evGrowthScenarioId: number,
  userAuth0Id?: string | null
): Promise<HubScenario> => {
  let scenario = await prisma.hubScenario.findFirst({
    where: {
      site_id: siteId,
      evGrowthScenarioId,
      deleted_at: null,
    },
  });

  if (!scenario) {
    scenario = await createDefaultScenario(
      siteId,
      evGrowthScenarioId,
      userAuth0Id
    );
  }

  return scenario;
};

export const getScenarioParameters = async (
  siteId: number,
  evGrowthScenarioId: number,
  userAuth0Id?: string | null
): Promise<ScenarioParameters> => {
  const scenario = await getHubScenario(
    siteId,
    evGrowthScenarioId,
    userAuth0Id
  );

  const site = await prisma.hubSite.findUniqueOrThrow({
    where: {
      id: siteId,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      site_vehicles: {
        select: {
          vehicle_type_id: true,
          charger_id: true,
          charger_cost: true,
        },
      },
    },
  });

  const truckVehicle = site.site_vehicles.find(
    (vehicle) => vehicle.vehicle_type_id === 2
  );
  if (!truckVehicle) {
    throw new Error("Missing truck site vehicle data");
  }
  const trailerVehicle = site.site_vehicles.find(
    (vehicle) => vehicle.vehicle_type_id === 3
  );
  if (!trailerVehicle) {
    throw new Error("Missing trailer site vehicle data");
  }

  return {
    id: scenario.id,
    siteId: site.id,
    siteName: site.name,
    name: scenario.name,
    year: scenario.year,
    trucksParkingPct: scenario.trucks_parking_pct,
    trailersParkingPct: scenario.trailers_parking_pct,
    publicChargerPct: scenario.public_charger_pct,
    parkingArea: scenario.parking_area,
    utilityRateId: scenario.utility_rate_id,
    truckChargerId: truckVehicle.charger_id,
    truckChargerCost: Number(truckVehicle.charger_cost),
    trailerChargerId: trailerVehicle.charger_id,
    trailerChargerCost: Number(trailerVehicle.charger_cost),
  };
};

export const updateScenarioParameters = async (
  siteId: number,
  scenarioId: number,
  scenarioData: ScenarioControls
): Promise<ScenarioParameters> => {
  const scenario = await prisma.hubScenario.update({
    where: {
      id: scenarioId,
      site_id: siteId,
      deleted_at: null,
    },
    data: {
      year: scenarioData.year,
      trucks_parking_pct: scenarioData.trucksParkingPct,
      trailers_parking_pct: scenarioData.trailersParkingPct,
      public_charger_pct: scenarioData.publicChargerPct,
      parking_area: scenarioData.parkingArea,
      utility_rate_id: scenarioData.utilityRateId,
    },
    select: {
      id: true,
      name: true,
      year: true,
      trucks_parking_pct: true,
      trailers_parking_pct: true,
      public_charger_pct: true,
      parking_area: true,
      utility_rate_id: true,
      site: {
        select: {
          name: true,
        },
      },
      evGrowthScenario: {
        select: {
          name: true,
        },
      },
    },
  });

  const truckVehicle = await updateSiteVehicleChargerInfo(
    siteId,
    2,
    scenarioData.truckChargerId,
    scenarioData.truckChargerCost
  );

  const trailerVehicle = await updateSiteVehicleChargerInfo(
    siteId,
    3,
    scenarioData.trailerChargerId,
    scenarioData.trailerChargerCost
  );

  return {
    id: scenarioId,
    siteId: siteId,
    siteName: scenario.site.name,
    name: scenario.evGrowthScenario?.name ?? scenario.name,
    year: scenario.year,
    trucksParkingPct: scenario.trucks_parking_pct,
    trailersParkingPct: scenario.trailers_parking_pct,
    publicChargerPct: scenario.public_charger_pct,
    parkingArea: scenario.parking_area,
    utilityRateId: scenario.utility_rate_id,
    truckChargerId: truckVehicle.charger_id,
    truckChargerCost: Number(truckVehicle.charger_cost),
    trailerChargerId: trailerVehicle.charger_id,
    trailerChargerCost: Number(trailerVehicle.charger_cost),
  };
};

const updateSiteVehicleChargerInfo = async (
  siteId: number,
  vehicleTypeId: number,
  chargerId: number | null,
  chargerCost: number
) => {
  const { id } = await prisma.hubSiteVehicle.findFirstOrThrow({
    where: {
      site_id: siteId,
      vehicle_type_id: vehicleTypeId,
    },
    select: {
      id: true,
    },
  });

  return await prisma.hubSiteVehicle.update({
    where: {
      id,
    },
    data: {
      charger_id: chargerId,
      charger_cost: chargerCost,
    },
  });
};

const createDefaultScenario = async (
  siteId: number,
  evGrowthScenarioId: number,
  userAuth0Id?: string | null
) => {
  const userId = await getUserIdByAuth0Id(userAuth0Id);
  if (!userId) {
    throw new Error("User not found");
  }

  const evGrowthScenario =
    await prisma.vHubTimelineLinkageScenario.findUniqueOrThrow({
      where: {
        id: evGrowthScenarioId,
      },
    });

  const utilityRate = await prisma.hubUtilityRate.findFirst({
    where: {
      site_id: siteId,
    },
    select: {
      id: true,
    },
  });

  const scenario = await prisma.hubScenario.create({
    data: {
      user_id: userId,
      site_id: siteId,
      name: evGrowthScenario.name,
      area: 150000,
      year: new Date().getFullYear(),
      trucks_parking_pct: 0.5,
      trailers_parking_pct: 0.5,
      nearby_parking: 5000,
      public_charger_pct: 1,
      utility_rate_id: utilityRate?.id,
      parking_area: 150000,
      evGrowthScenarioId,
    },
  });

  await createDefaultScenarioYears(scenario.id);

  return scenario;
};

const createDefaultScenarioYears = async (scenarioId: number) => {
  const BOX_TRUCK_VEHICLE_ID = 2;
  const TRAILER_TRUCK_VEHICLE_ID = 3;
  const vehicleTypes = [BOX_TRUCK_VEHICLE_ID, TRAILER_TRUCK_VEHICLE_ID];

  for (const vehicleTypeId of vehicleTypes) {
    for (let deltaYear = 0; deltaYear < 13; deltaYear++) {
      await prisma.hubScenarioYear.create({
        data: {
          scenario_id: scenarioId,
          vehicle_type_id: vehicleTypeId,
          year: new Date().getFullYear() + deltaYear,
          ev_adoption_rate:
            yearlyParams[deltaYear][`cat${vehicleTypeId}_ev_adoption_rate`],
          capture_rate:
            yearlyParams[deltaYear][`cat${vehicleTypeId}_capture_rate`],
          subscription_capture_rate:
            yearlyParams[deltaYear][
              `cat${vehicleTypeId}_subscription_capture_rate`
            ],
          max_utility_supply:
            yearlyParams[deltaYear][`cat${vehicleTypeId}_max_utility_supply`],
        },
      });
    }
  }
};

export const updateScenarioYear = async (
  scenarioId: number,
  year: number,
  scenarioYearData: ScenarioYearData
) => {
  scenarioYearData.scenario_id = scenarioId;
  scenarioYearData.year = year;

  return await prisma.hubScenarioYear.updateMany({
    where: {
      scenario_id: scenarioId,
      year: year,
      vehicle_type_id: scenarioYearData.vehicle_type_id,
    },
    data: scenarioYearData,
  });
};

export const updateScenarioYears = async (
  scenarioId: number,
  scenarioYears: ScenarioYearData[]
) => {
  await Promise.all(
    scenarioYears.map((scenarioYearData) =>
      updateScenarioYear(scenarioId, scenarioYearData.year, scenarioYearData)
    )
  );
  return { ok: "Scenario years are successfully saved" };
};

export const getSiteDownloadData = async (
  siteId: number,
  scenarioId: number,
  useOptimal: boolean
) => {
  return await calcSiteScenarioDataAllYears(siteId, scenarioId, useOptimal);
};

export const getSiteScenarioData = async (
  siteId: number,
  scenarioId: number,
  useOptimal: boolean,
  annualAveragePerCharger: number
) => {
  return await calcSiteScenarioData(
    siteId,
    scenarioId,
    useOptimal,
    annualAveragePerCharger
  );
};

export const getChargers = async () => {
  return await prisma.hubCharger.findMany({
    where: {
      deleted_at: null,
    },
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
  });
};

export const getSiteUtilityRates = async (siteId: number) => {
  return await prisma.hubUtilityRate.findMany({
    where: {
      site_id: siteId,
    },
    select: {
      id: true,
      site_id: true,
      energy_charge_rate: true,
      demand_charge_rate: true,
      utility: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const uploadArrivals = async (
  siteId: number,
  auth0Id: string | null,
  filePath: string,
  override: boolean = false
) => {
  const userId = auth0Id ? await getUserIdByAuth0Id(auth0Id) : null;
  return await importFleetArrivals(siteId, userId, filePath, override);
};

const getUserIdByAuth0Id = async (
  auth0Id?: string | null
): Promise<number | null> => {
  if (process.env.DB_HOST === "localhost") return 1;
  if (!auth0Id) return null;

  const users: any = await prisma.$queryRaw`
      SELECT
        id
      FROM et_auth.user u
      WHERE u.auth0_id = ${auth0Id}
        AND u.active = true
      LIMIT 1;
    `;

  return users[0]?.id ?? null;
};

export const getFleetArrivals = async (siteId: number) => {
  return await getFleetArrivalsGroupByLabel(siteId);
};

export const deleteFleetArrivals = async (siteId: number, ids: number[]) => {
  const deletedArrivals = [];

  for (const id of ids) {
    deletedArrivals.push(await deleteFleetArrivalById(siteId, id));
  }

  return {
    success: deletedArrivals.length === ids.length,
    count: deletedArrivals.length,
  };
};
