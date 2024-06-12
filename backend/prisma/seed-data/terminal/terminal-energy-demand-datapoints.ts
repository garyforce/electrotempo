const scenarioVehicle1Datapoints = Array.from({ length: 24 }, (_, i) => {
  return {
    scenarioVehicleId: 1,
    hour: i,
    energyDemandKwh: Math.round(Math.random() * 4) * 10,
    powerDemandKw: 120,
  };
});

const scenarioVehicle2Datapoints = Array.from({ length: 24 }, (_, i) => {
  return {
    scenarioVehicleId: 2,
    hour: i,
    energyDemandKwh: Math.round(Math.random() * 4) * 10,
    powerDemandKw: 60,
  };
});

export const terminalEnergyDatapoints = [
  ...scenarioVehicle1Datapoints,
  ...scenarioVehicle2Datapoints,
];
