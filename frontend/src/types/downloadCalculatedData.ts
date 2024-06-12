import { SitewithoutScenarioModel, ScenarioModel } from "types/site";

interface segmentDataType {
  capture_rate: number;
  subscription_capture_rate: number;
  ev_adoption_rate: number;
  arrivals: any;
  chargers: any;
  energy_demand: any;
  financial: any;
}
interface downloadScenarioData extends ScenarioModel {
  calculated_data: {
    [year: string]: {
      aggregate_data: {
        arrivals: any;
        chargers: any;
        energy_demand: any;
        financial: any;
      };
      segment_data: segmentDataType[];
    };
  };
}
export interface downloadedDataType extends SitewithoutScenarioModel {
  scenario: downloadScenarioData;
}
