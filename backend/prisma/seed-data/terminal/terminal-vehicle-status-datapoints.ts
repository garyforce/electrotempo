export const terminal1VehicleStatusDatapoints = Array.from(
  { length: 12 },
  (_, i) => {
    const record = {
      scenarioVehicleId: 1,
    } as any;

    Array.from({ length: 24 }, (_, j) => {
      record[`hour${j}`] = Math.floor(Math.random() * 4) + 1;
    });

    return record;
  }
);

export const terminal2VehicleStatusDatapoints = Array.from(
  { length: 12 },
  (_, i) => {
    const record = {
      scenarioVehicleId: 2,
    } as any;

    Array.from({ length: 24 }, (_, j) => {
      record[`hour${j}`] = Math.floor(Math.random() * 4) + 1;
    });

    return record;
  }
);

export const terminalVehicleStatusDatapoints = [
  ...terminal1VehicleStatusDatapoints,
  ...terminal2VehicleStatusDatapoints,
];
