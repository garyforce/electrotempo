export type Terminal = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lon: number;
  terminalFacilities: TerminalFacility[];
  fleetSizeSum: number;
};

export type TerminalFacility = {
  id: number;
  name: string;
  propertyId: number;
  terminalScenarios: TerminalScenario[];
};

export type TerminalScenario = {
  id: number;
  propertyId: number;
  property: {
    id: number;
    name: string;
    organizationId: number;
  };
  facilityId: number;
  facility: {
    id: number;
    name: string;
  };
  name: string;
  active: boolean;
  status?: {
    id: number;
    status: string;
  };
  utilityRateId: number;
  scenarioVehicles: TerminalScenarioVehicle[];
};

export type TerminalScenarioVehicle = {
  id: number;
  numICEVehicles: number;
};

export type TerminalScenarioWithVehicle = {
  id: number;
  propertyId: number;
  facilityId: number;
  name: string;
  planningHorizonYears: number;
  numChargers: number;
  utilityRateId: number;
  scenarioVehicles: {
    id: number;
    vehicleType: {
      name: string;
    };
  }[];
};

export type selectedTerminalScenarioId = {
  terminalId: number;
  facilityId: number;
  scenarioId: number;
};

export type TerminalTableData = {
  id: number;
  name: string;
  terminalId: number;
  facilityName: string;
  facilityId: number;
  scenarioId: number;
};

export type VehicleTypeInfo = {
  id: number;
  name: string;
  make: string;
  model: string;
  vehicleTypeId: number;
  batteryCapacityKwh: number;
  batteryMaxChargeRateKw: number;
  priceUsd: number;
  isEV: boolean;
  organizationId: number;
  buyAmericaCompliance: boolean;
};
