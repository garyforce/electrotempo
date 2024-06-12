import FileSaver from "file-saver";
import { loadDemand } from "api/demand";
export const downloadData = async (
  location,
  selectedChargingDemandSimulation,
  demandTypes,
  blockGroups,
  ac,
  percentEvs,
  apiToken
) => {
  let success = true;
  try {
    let hourlyFetchPromises = [];
    for (let hour = 0; hour < 24; hour++) {
      hourlyFetchPromises.push(
        loadDemand(
          selectedChargingDemandSimulation.id,
          demandTypes,
          hour,
          apiToken
        )
      );
    }
    let hourlyDemandData = await Promise.all(hourlyFetchPromises);

    // make copy of block group feature group
    let blockGroupFeatureGroup = JSON.parse(JSON.stringify(blockGroups));
    blockGroupFeatureGroup.features.forEach((blockGroupFeature) => {
      // normal for loop because we want hour value
      let hourlyDemand = [];
      hourlyDemandData.forEach((anHour, index) => {
        // no block group with this data? assume 0 demand.
        hourlyDemand.push(anHour[blockGroupFeature.properties.geoid] || 0);
      });
      blockGroupFeature.properties.hourlyDemand = hourlyDemand;
    });
    blockGroupFeatureGroup.description = {
      dateGenerated: new Date().toISOString(),
      location: location,
      demandTypes: demandTypes,
      hourlyDemandUnits: "kWh",
      areaUnits: "square meters",
      notes:
        "Hourly demand data is an array of length 24. Index 0 is midnight, 1 is 1am, 2 is 2am, etc.",
      percentEvs: percentEvs,
    };
    const geojsonBlob = new Blob([JSON.stringify(blockGroupFeatureGroup)], {
      type: "application/json;charset=utf-8;",
    });
    const filename = `${location.name.toLowerCase()}_ldv_${demandTypes.join(
      "-"
    )}_charging_demand_${ac.toLowerCase()}-ac.geojson`;
    FileSaver.saveAs(geojsonBlob, filename);
  } catch (error) {
    console.error(error);
    success = false;
  }
  return success;
};
