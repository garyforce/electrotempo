import { loadDemand } from "api/demand";
import { VehicleClassAnnualDatum } from "types/vehicle-class";
import { scaleDemandByGrowthScenarioYear } from "utils/demand";
import { downloadFile } from "utils/file";
import { DemandPageProps } from "./DemandPage";

export const downloadDemand = async (
  data: any,
  props: DemandPageProps,
  annualData: VehicleClassAnnualDatum[] | undefined,
  year: number | undefined,
  demandTypes: string[],
  growthScenarioName?: string,
  apiToken?: string
) => {
  let downloadSuccess = true;

  try {
    const locationName = props.location?.name
      .toLowerCase()
      .replaceAll(" ", "_");
    growthScenarioName = growthScenarioName?.replaceAll(" ", "_");
    const keys = Object.keys(data);

    const demandTypesString = demandTypes.join("|");

    let csvData = "";
    const appendData = (data: string = "") => {
      csvData += data;
      csvData += "\n";
    };

    appendData("Block Group Info,,,,,,Demand (kWh) by hour");

    appendData(
      "Year,Season,Demand Types,Location,Block Group GeoId,Area (sq. mi.),12am,1am,2am,3am,4am,5am,6am,7am," +
        "8am,9am,10am,11am,12pm,1pm,2pm,3pm,4pm,5pm," +
        "6pm,7pm,8pm,9pm,10pm,11pm"
    );

    let hourlyFetchPromises = [];
    for (let hour = 0; hour < 24; hour++) {
      hourlyFetchPromises.push(
        loadDemand(
          props.selectedChargingDemandSimulation.id,
          demandTypes,
          hour,
          props.location?.id,
          apiToken
        )
      );
    }
    let hourlyDemandData = await Promise.all(hourlyFetchPromises);

    let demandSum = 0;
    for (let i = 0; i < hourlyDemandData.length; i++) {
      demandSum += Object.values(hourlyDemandData[i]).reduce(
        (a: number, b: number) => a + b,
        0
      );
    }

    let scaledHourlyDemand = [];
    if (
      annualData !== undefined &&
      props.selectedTrafficModel?.numVehicles !== undefined &&
      year !== undefined &&
      demandSum !== 0
    ) {
      for (let i = 0; i < hourlyDemandData.length; i++) {
        scaledHourlyDemand.push(
          scaleDemandByGrowthScenarioYear(
            annualData,
            year,
            hourlyDemandData[i],
            demandSum,
            demandTypes
          )
        );
      }
    }

    // verify that the number of block groups matches the number of demand values
    // before attempting to write the data to a CSV file
    if (
      Object.keys(scaledHourlyDemand[0]).length !==
      props.blockGroups?.features.length
    ) {
      console.warn(
        "The number of block groups does not match the number of demand values"
      );
    }

    const squareMetersToSquareMiles = 3.86102e-7;
    for (let i = 0; i < keys.length; i++) {
      appendData(
        `${year ?? ""},${
          props.ac === "high" ? "Winter/Summer" : "Spring/Fall"
        },${demandTypesString},${props.location?.name ?? ""},${keys[i]},${
          props.blockGroups?.features[i]?.properties?.area *
            squareMetersToSquareMiles ?? ""
        },${scaledHourlyDemand[0][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[1][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[2][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[3][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[4][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[5][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[6][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[7][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[8][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[9][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[10][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[11][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[12][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[13][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[14][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[15][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[16][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[17][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[18][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[19][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[20][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[21][keys[i]].toFixed(2) ?? ""
        },${scaledHourlyDemand[22][keys[i]].toFixed(2) ?? ""},${
          scaledHourlyDemand[23][keys[i]].toFixed(2) ?? ""
        }`
      );
    }

    const filename = `${locationName}_${year}_${growthScenarioName}_charging_demand.csv`;
    downloadFile(csvData, filename);
  } catch (error) {
    console.log(error);
    downloadSuccess = false;
  }
  return downloadSuccess;
};
