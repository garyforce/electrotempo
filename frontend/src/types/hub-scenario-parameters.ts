export interface HubScenarioControls {
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

export interface HubScenarioParameters extends HubScenarioControls {
  id: number;
  siteId: number;
  siteName: string;
  name: string;
}
