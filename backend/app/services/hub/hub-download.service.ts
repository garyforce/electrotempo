import { PrismaClient } from "@prisma/client";

import { getHubScenario } from "./hub.service";

interface DownloadSites {
  siteId: number;
  evGrowthScenarioId: number;
}

const prisma = new PrismaClient();

export const getHubScenarioDownloadData = async (
  sites: DownloadSites[],
  userAuth0Id?: string | null
) => {
  const siteIdToEvGrowthScenarioIds = sites.reduce(
    (acc, { siteId, evGrowthScenarioId }) => {
      if (!acc.has(siteId)) {
        acc.set(siteId, []);
      }
      acc.get(siteId)?.push(evGrowthScenarioId);
      return acc;
    },
    new Map<number, number[]>()
  );
  const uniqueSiteIds = [...new Set(sites.map((request) => request.siteId))];
  const uniqueEvGrowthScenarioIds = [
    ...new Set(sites.map((site) => site.evGrowthScenarioId)),
  ];

  const sitesWithScenarios = await prisma.hubSite.findMany({
    where: { id: { in: uniqueSiteIds } },
  });

  const evGrowthScenarios = await prisma.vHubTimelineLinkageScenario.findMany({
    where: {
      id: { in: uniqueEvGrowthScenarioIds },
    },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
    },
  });

  const resultPromises = sitesWithScenarios.map(async (site) => {
    const evGrowthScenarioIdsForSite =
      siteIdToEvGrowthScenarioIds.get(site.id) || [];

    const scenarios = await Promise.all(
      evGrowthScenarioIdsForSite.map((id) =>
        getHubScenario(site.id, id, userAuth0Id)
      )
    );

    return {
      site: {
        id: site.id,
        name: site.name,
        address: site.address,
        lat: site.lat,
        lon: site.lon,
        locationId: site.locationId,
        highwayFlow: site.highway_flow,
        numWarehouses: site.num_warehouses,
        growthRate: site.growth_rate,
      },
      scenario: scenarios?.map(
        (scenario: {
          id: any;
          user_id: any;
          site_id: any;
          name: any;
          area: any;
          year: any;
          trucks_parking_pct: any;
          trailers_parking_pct: any;
          nearby_parking: any;
          num_chargers: any;
          public_charger_pct: any;
          utility_rate_id: any;
          parking_area: any;
          evGrowthScenarioId: any;
        }) => ({
          id: scenario.id,
          userId: scenario.user_id,
          siteId: scenario.site_id,
          name: scenario.name,
          area: scenario.area,
          year: scenario.year,
          trucksParkingPct: scenario.trucks_parking_pct,
          trailersParkingPct: scenario.trailers_parking_pct,
          nearbyParking: scenario.nearby_parking,
          numChargers: scenario.num_chargers,
          publicChargerPct: scenario.public_charger_pct,
          utilityRateId: scenario.utility_rate_id,
          parkingArea: scenario.parking_area,
          evGrowthScenarioId: scenario.evGrowthScenarioId,
        })
      ),
      evGrowthScenario: evGrowthScenarios.filter((scenario) =>
        evGrowthScenarioIdsForSite.includes(scenario.id)
      ),
    };
  });

  const result = await Promise.all(resultPromises);
  return result;
};
