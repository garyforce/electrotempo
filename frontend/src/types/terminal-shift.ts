export type TerminalShift = {
  id: number;
  scenarioVehicleId: number;
  startHour: number;
  endHour: number;
  breakStartHour: number;
  breakEndHour: number;
};

export type TerminalShiftSchedule = {
  id: number;
  shiftSchedule: number[];
};
