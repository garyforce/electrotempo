import { VehicleClass, VehicleClassName } from "types/vehicle-class";
import Color from "colorjs.io";

export function getFirstVehicleClassWithData(
  vehicleClasses: VehicleClass[]
): VehicleClass | undefined {
  return vehicleClasses.find((vehicleClass) => {
    if (vehicleClass.annualData !== undefined) {
      return vehicleClass.annualData.length > 0;
    }
    return false;
  });
}

export function getYearsWithData(vehicleClass: VehicleClass): number[] {
  return vehicleClass.annualData?.map((datum) => datum.year) ?? [];
}

export function getChartColorForVehicleClass(
  vehicleClass: VehicleClass
): Color {
  switch (vehicleClass.name) {
    case "Cars":
      return new Color("rgb(5, 194, 204)");
    case "Light Trucks":
      return new Color("rgb(255, 99, 255)");
    case "Straight Trucks":
      return new Color("rgb(253, 190, 2)");
    case "Tractors":
      return new Color("rgb(5, 255, 132)");
    default:
      return new Color("rgb(255, 99, 132)");
  }
}

export function getDailyTotalMhdDemandKwhForVehicleClass(
  numVehicles: number,
  vehicleClassName: VehicleClassName
): number {
  /* Daily demand in units of kWh
   * Class    Winter      Summer      Shoulder    Annual Average
   * Light    45.5697394	17.21522723	16.06754542 23.73
   * Straight 556.8619175	210.3700346	189.33305   286.47
   * Tractor  598.0612545	225.9342268	203.3408245 307.67
   *
   * Annual average is calculated as:
   *  (winter + summer + 2 * shoulder) / 4
   * There are two shoulder seasons, so they are counted twice.
   *
   * Source: qa042123 on SharePoint
   
   *New change: refer core-3503
   */
  const kwhPerLightTruck = 17.817;
  const kwhPerStraightTruck = 61.921;
  const kwhPerTractor = 319.477;
  switch (vehicleClassName) {
    case "Light Trucks":
      return numVehicles * kwhPerLightTruck;
    case "Straight Trucks":
      return numVehicles * kwhPerStraightTruck;
    case "Tractors":
      return numVehicles * kwhPerTractor;
    default:
      throw new Error(
        "Only light trucks, straight trucks, and tractors have MHD demand."
      );
  }
}

export function isLightDutyVehicleClass(vehicleClass: VehicleClass): boolean {
  return vehicleClass.name === "Cars";
}
