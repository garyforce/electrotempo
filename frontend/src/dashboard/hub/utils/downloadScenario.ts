import { ScenarioModel, SiteModel } from "types/site";
import { arrayToCsv, downloadFile, objectToCsv } from "utils/file";
import { downloadedDataType } from "types/downloadCalculatedData";
import { download } from "dashboard/timeline/download";

export const downloadScenarioData = (downloadData: downloadedDataType) => {
  let csvData = "";
  const appendData = (data: string = "") => {
    csvData += data;
    csvData += "\n";
  };
  // site level data
  appendData("Site Level Data");
  appendData(`Site name, ${downloadData.name}`);
  appendData(`Address, ${downloadData.address}`);
  appendData(`Scenario, ${downloadData.scenario.name}`);
  appendData(
    `Annual Truck Population Growth Rate %, ${downloadData.growth_rate * 100}`
  );
  //next release
  // appendData(`Site Square Footage , `)
  // appendData(`% of Square Footage Used for Charging, `)
  appendData();
  //Projected Demand
  appendData("Projected Demand");
  const yearArray = Object.keys(downloadData.scenario.calculated_data);
  const trackData: string[] = [];
  yearArray.forEach((year) => {
    const segmentData =
      downloadData.scenario.calculated_data[year].segment_data;
    segmentData.forEach((segment: any) => {
      if (trackData.indexOf(segment.vehicle_type) === -1) {
        trackData.push(segment.vehicle_type);
      }
    });
  });
  trackData.forEach((vehicleType: string, index) => {
    appendData(`${index + 1}) ${vehicleType}`);
    let title = "Year",
      data1 = "Number of daily arrivals",
      data2 = "EV adoption level %",
      data3 = "Public_capture_rate %",
      data4 = "Subscription_capture_rate %",
      data5 = "Maximum Utility Supply(MW)";
    yearArray.forEach((year) => {
      title += `, ${year}`;
      data1 += `, ${downloadData.scenario.calculated_data[year].segment_data[index]?.arrivals.capture_arrivals}`;
      data2 += `, ${
        downloadData.scenario.calculated_data[year].segment_data[index]
          ?.ev_adoption_rate * 100
      }`;
      data3 += `, ${
        downloadData.scenario.calculated_data[year].segment_data[index]
          ?.capture_rate * 100
      }`;
      data4 += `, ${
        downloadData.scenario.calculated_data[year].segment_data[index]
          ?.subscription_capture_rate * 100
      }`;
      data5 += `, ${
        downloadData.scenario.calculated_data[year].segment_data[index]
          .energy_demand?.utility_threshold / 1000 ?? 0
      }`;
    });
    appendData(title);
    appendData(data1);
    appendData(data2);
    appendData(data3);
    appendData(data4);
    appendData(data5);
    //Hourly electric truck arrivals
    appendData("Hourly electric truck arrivals");
    title = "Hour";
    const hourData = new Array(24).fill(0).map((_, index) => index.toString());
    yearArray.forEach((year) => {
      title += `, ${year}`;
      downloadData.scenario.calculated_data[year].segment_data[
        index
      ].arrivals.hourly_data.forEach((hourArrival: any) => {
        const { hour, capture_arrivals } = hourArrival;
        hourData[hour] = `${hourData[hour]}, ${capture_arrivals}`;
      });
    });
    appendData(title);
    hourData.forEach((data) => appendData(data));
    appendData();
  });

  appendData("Energy");
  let title = "Year";
  yearArray.forEach((year) => {
    title += `, ${year}`;
  });
  appendData(title);
  appendData("Hourly latent energy demand (kWh)"); //Used energyDemand
  appendData(title);
  for (let hour = 0; hour < 24; hour++) {
    let hourData = `${hour}`;
    yearArray.forEach((year) => {
      hourData += `, ${downloadData.scenario.calculated_data[year].aggregate_data.energy_demand.hourly_data[hour].energy_demand}`;
    });
    appendData(hourData);
  }
  appendData("Hourly charging demand (kW)"); //Used energyDemand
  appendData(title);
  for (let hour = 0; hour < 24; hour++) {
    let hourData = `${hour}`;
    yearArray.forEach((year) => {
      hourData += `, ${downloadData.scenario.calculated_data[year].aggregate_data.energy_demand.hourly_data[hour].power_demand}`;
    });
    appendData(hourData);
  }
  appendData();

  //Chargers data
  appendData("Chargers");
  appendData(title);
  let chargersNeeded = "Chargers needed",
    chargersInstallable = "Chargers installable";
  yearArray.forEach((year) => {
    chargersNeeded += `, ${downloadData.scenario.calculated_data[year].aggregate_data.chargers.num_chargers_needed}`;
    chargersInstallable += `, ${downloadData.scenario.calculated_data[year].aggregate_data.chargers.num_feasible_chargers}`;
  });
  appendData(chargersNeeded);
  appendData(chargersInstallable);
  appendData();

  //Financial Data
  appendData("Financials");
  appendData(title);
  let capEx = "CapEx",
    opex = "OpEx";
  yearArray.forEach((year) => {
    capEx += `, ${downloadData.scenario.calculated_data[year].aggregate_data.financial.capital_expenses.charger_costs}`;
    opex += `, ${downloadData.scenario.calculated_data[year].aggregate_data.financial.operational_costs.energy_cost}`;
  });
  appendData(capEx);
  appendData(opex);
  downloadFile(csvData, "output.csv");
};
