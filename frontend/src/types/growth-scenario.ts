import { VehicleClass } from "./vehicle-class";

export type GrowthScenario = {
  id?: number;
  name: string;
  description: string;
  created?: string;
  orgname?: string;
  location?: string;
  vehicleClasses: VehicleClass[];
};

const LIGHT_DUTY_VEHICLE_CLASS_NAME = "Cars";
export function getLightDutyVehicleClass(
  growthScenario: GrowthScenario
): VehicleClass | undefined {
  if (growthScenario.vehicleClasses === undefined) return undefined;
  return growthScenario.vehicleClasses.find(
    (vehicleClass) => vehicleClass.name === LIGHT_DUTY_VEHICLE_CLASS_NAME
  );
}

const MHD_VEHICLE_CLASS_NAMES = ["Light Trucks", "Straight Trucks", "Tractors"];
export function growthScenarioHasMhdVehicleClass(
  growthScenario: GrowthScenario
): boolean {
  if (growthScenario.vehicleClasses === undefined) return false;
  return growthScenario.vehicleClasses.some((vehicleClass) =>
    MHD_VEHICLE_CLASS_NAMES.includes(vehicleClass.name)
  );
}

export function getMhdVehicleClasses(
  growthScenario: GrowthScenario
): VehicleClass[] {
  if (growthScenario.vehicleClasses === undefined) return [];
  return growthScenario.vehicleClasses.filter((vehicleClass) =>
    MHD_VEHICLE_CLASS_NAMES.includes(vehicleClass.name)
  );
}
