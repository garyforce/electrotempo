export type HubSite = {
  id: number;
  organization_id: number;
  name: string;
  address: string;
  locationId?: number;
  lat: number;
  lon: number;
  evGrowthScenarios: EvGrowthScenario[];
};

export interface EvGrowthScenario {
  id: number;
  name: string;
  description: string;
  location: string;
}
