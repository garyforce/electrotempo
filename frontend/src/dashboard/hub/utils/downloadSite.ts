import { ScenarioModel, SiteModel } from "types/site";
import { downloadFile, objectToCsv } from "utils/file";

type downloadSiteType = (
  sites: SiteModel[],
  scenarios: ScenarioModel[]
) => void;
export const downloadSiteData: downloadSiteType = (sites, scenarios) => {
  let csvData = "";
  const appendData = (data: string = "") => {
    csvData += data;
    csvData += "\n";
  };

  sites.forEach((site) => {
    const { name, address, highway_flow, num_warehouses } = site;
    if (site.scenarios.length > 0) {
      const {
        name: scenario_name,
        area,
        year,
        trucks_parking_pct,
        trailers_parking_pct,
        nearby_parking,
        num_chargers,
        public_charger_pct,
      } = scenarios[site.id];
      appendData(
        objectToCsv({
          name,
          address,
          highway_flow,
          num_warehouses,
          scenario_name,
          area,
          year,
          straight_trucks_parking_pct: trucks_parking_pct,
          tractor_trailers_parking_pct: trailers_parking_pct,
          nearby_parking,
          num_chargers,
          public_charger_pct,
        })
      );
    } else
      appendData(objectToCsv({ name, address, highway_flow, num_warehouses }));
    appendData();
  });
  downloadFile(csvData, "sites.csv");
};
