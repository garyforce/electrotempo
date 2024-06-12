import { DownloadIds } from "dashboard/hub/HubPage";
import { downloadFile } from "utils/file";

const generateCsvContent = (
  downloadData: { site: any; scenario: any; evGrowthScenario: any }[]
) => {
  let csvContent = "";

  const SITE_DOWNLOAD_HEADERS = [
    "Site ID",
    "Site Name",
    "Address",
    "Latitude",
    "Longitude",
    "Location ID",
    "Highway Flow",
    "Num Warehouses",
    "Growth Rate",
    "Scenario ID",
    "Scenario Name",
    "Scenario Year",
    "Area",
    "Trucks Parking Pct",
    "Trailers Parking Pct",
    "Nearby Parking",
    "Num Chargers",
    "Public Charger Pct",
    "Utility Rate ID",
    "Parking Area",
    "EV Growth Scenario ID",
    "EV Growth Scenario Name",
    "EV Growth Scenario Description",
    "Location",
  ];
  csvContent += SITE_DOWNLOAD_HEADERS.join(",") + "\n";

  downloadData.forEach(({ site, scenario, evGrowthScenario }) => {
    evGrowthScenario.forEach((ev: any) => {
      const matchingScenarios = scenario.filter(
        (sc: { evGrowthScenarioId: any }) => sc.evGrowthScenarioId === ev.id
      );

      if (matchingScenarios.length > 0) {
        matchingScenarios.forEach((sc: any) => {
          const row = [
            site.id,
            site.name,
            `"${site.address}"`,
            site.lat,
            site.lon,
            site.locationId ?? "",
            site.highwayFlow,
            site.numWarehouses,
            site.growthRate,
            sc.id,
            sc.name,
            sc.year,
            sc.area,
            sc.trucksParkingPct,
            sc.trailersParkingPct,
            sc.nearbyParking,
            sc.numChargers,
            sc.publicChargerPct,
            sc.utilityRateId ?? "",
            sc.parkingArea,
            ev.id,
            ev.name,
            `"${ev.description}"`,
            ev.location,
          ];
          csvContent += row.join(",") + "\n";
        });
      }
    });
  });

  return csvContent;
};

export const downloadEvGrowthSiteScenarios = async (
  downloadIds: DownloadIds[]
) => {
  try {
    const encodedSites = encodeURIComponent(JSON.stringify(downloadIds));

    const response = await fetch(
      `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/sites/download/?sites=${encodedSites}`
    );

    if (response.ok) {
      const result = await response.json();

      const csvContent = generateCsvContent(result);

      downloadFile(csvContent, "sites.csv");
    } else {
      throw new Error("Failed to download sites");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `An error occurred while downloading sites: ${error.message}`
      );
    } else {
      throw new Error("An unknown error occurred while downloading sites");
    }
  }
};
