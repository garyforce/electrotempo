import { PrismaClient, Vehicle as VehicleModel } from "@prisma/client";

const prisma = new PrismaClient();

export interface VehicleData {
  id?: number | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  vehicleTypeId: number;
  batteryCapacityKwh: number;
  batteryMaxChargeRateKw: number;
  priceUsd: number;
  buyAmericaCompliance: boolean;
}

export interface Vehicle extends VehicleData {
  id: number;
  isEV: boolean;
  organizationId: number | null;
}

export const getVehicleById = async (vehicleId: number): Promise<Vehicle> => {
  const vehicle = await prisma.vehicle.findUniqueOrThrow({
    where: {
      id: vehicleId,
      deletedAt: null,
    },
  });
  return transformVehicle(vehicle);
};

export const getVehiclesByVehicleTypeId = async (
  vehicleTypeId: number
): Promise<Vehicle[]> => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      vehicleTypeId,
      organizationId: null,
      terminalScenarioVehicleId: null,
      deletedAt: null,
    },
  });
  return vehicles.map((vehicle) => transformVehicle(vehicle));
};

export const getEVOptionsForTerminal = async (
  vehicleTypeId: number
): Promise<VehicleData[]> => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      vehicleTypeId,
      organizationId: null,
      terminalScenarioVehicleId: null,
      isEV: true,
      deletedAt: null,
    },
  });
  return vehicles.map((vehicle) => transformVehicleData(vehicle));
};

export const getCustomVehiclesForTerminal = async (
  terminalScenarioVehicleId: number
): Promise<VehicleData[]> => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      terminalScenarioVehicleId,
      deletedAt: null,
    },
  });
  return vehicles.map((vehicle) => transformVehicleData(vehicle));
};

export const createCustomVehicleForTerminal = async (
  vehicleData: VehicleData,
  organizationId: number,
  terminalScenarioVehicleId: number
): Promise<Vehicle> => {
  const { id: _, ...rest } = vehicleData;
  const vehicle = await prisma.vehicle.create({
    data: {
      ...rest,
      organizationId,
      terminalScenarioVehicleId,
      isEV: true,
    },
  });
  return transformVehicle(vehicle);
};

const transformVehicle = (vehicle: VehicleModel): Vehicle => {
  return {
    id: vehicle.id,
    organizationId: vehicle.organizationId,
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    vehicleTypeId: vehicle.vehicleTypeId,
    isEV: vehicle.isEV,
    batteryCapacityKwh: Number(vehicle.batteryCapacityKwh),
    batteryMaxChargeRateKw: Number(vehicle.batteryMaxChargeRateKw),
    priceUsd: Number(vehicle.priceUsd),
    buyAmericaCompliance: vehicle.buyAmericaCompliance,
  };
};

const transformVehicleData = (vehicle: VehicleModel | Vehicle) => {
  return {
    id: vehicle.id,
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    vehicleTypeId: vehicle.vehicleTypeId,
    batteryCapacityKwh: Number(vehicle.batteryCapacityKwh),
    batteryMaxChargeRateKw: Number(vehicle.batteryMaxChargeRateKw),
    priceUsd: Number(vehicle.priceUsd),
    buyAmericaCompliance: vehicle.buyAmericaCompliance,
  };
};
