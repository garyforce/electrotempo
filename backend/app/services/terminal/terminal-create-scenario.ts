import { PrismaClient } from "@prisma/client";
import {
  UtilityRateStructure,
  getUtilityRateById,
  createCustomUtilityRateForTerminal,
  getUtilityRateStructureForOrganization,
  transformUtilityRateStructure,
} from "../utility-rate";
import {
  Charger,
  ChargerData,
  createCustomChargerForTerminal,
  getChargerById,
  getChargersForTerminalScenario,
  getRecommendedChargers,
} from "../charger";
import {
  Vehicle,
  VehicleData,
  createCustomVehicleForTerminal,
  getCustomVehiclesForTerminal,
  getEVOptionsForTerminal,
  getVehicleById,
} from "../vehicle";
import {
  AssumptionParameters,
  getAssumptionParameters,
} from "./financial.service";

const prisma = new PrismaClient();

export interface NewTerminalScenarioData {
  scenarioName: string | null;
  planningHorizonYears: number;
  chargerMaintenanceCostPct: number;
  chargerReplacementLifecycleYears: number;
  iceFuelCostPerGallon: number;
  shiftSchedule: number[];
  chargerOptions: ChargerData[];
  fleetMix: {
    vehicleTypeId: number | null;
    fleetSize: number;
    vehiclesPerShift: number;
    vehicleMaintenanceCostPct: number;
    vehicleReplacementLifecycleYears: number;
    batteryReplacementLifecycleYears: number;
    iceVehicleId: number | null;
    iceVehicleFuelConsumption: number;
    iceVehicleDowntime: number;
    evExpectedDowntime: number;
    evOptions: VehicleData[];
  };
  utilityRateStructure: UtilityRateStructure;
}

const defaultUtilityRateStructure: UtilityRateStructure = {
  id: null,
  name: null,
  generationChargePricePerKwh: 0,
  transmissionChargePricePerKwh: 0,
  distributionChargePricePerKwh: 0,
  generationDemandChargePricePerKw: 0,
  transmissionDemandChargePricePerKw: 0,
  distributionDemandChargePricePerKw: 0,
  ppaGenerationChargePricePerKwh: 0,
  ppaTransmissionChargePricePerKwh: 0,
  ppaDistributionChargePricePerKwh: 0,
  ppaGenerationDemandChargePricePerKw: 0,
  ppaTransmissionDemandChargePricePerKw: 0,
  ppaDistributionDemandChargePricePerKw: 0,
};

export const getDefaultNewTerminalScenarioData = async (
  propertyId: number
): Promise<NewTerminalScenarioData> => {
  const defaultNewTerminalScenarioData: NewTerminalScenarioData = {
    scenarioName: null,
    planningHorizonYears: 12,
    chargerMaintenanceCostPct: 0.05,
    chargerReplacementLifecycleYears: 12,
    iceFuelCostPerGallon: 4,
    chargerOptions: [],
    shiftSchedule: [],
    fleetMix: {
      vehicleTypeId: null,
      fleetSize: 0,
      vehiclesPerShift: 0,
      vehicleMaintenanceCostPct: 0.05,
      vehicleReplacementLifecycleYears: 12,
      batteryReplacementLifecycleYears: 6,
      iceVehicleId: null,
      iceVehicleFuelConsumption: 0,
      iceVehicleDowntime: 0.34,
      evExpectedDowntime: 0.2,
      evOptions: [],
    },
    utilityRateStructure: defaultUtilityRateStructure,
  };

  // Get charger options
  defaultNewTerminalScenarioData.chargerOptions =
    await getRecommendedChargers();

  // Get default organization utility rate structure
  const defaultOrgUtilityRateStructure =
    await getOrganizationUtilityRateStructureByPropertyId(propertyId);
  if (defaultOrgUtilityRateStructure) {
    defaultNewTerminalScenarioData.utilityRateStructure =
      defaultOrgUtilityRateStructure;
  }

  return defaultNewTerminalScenarioData;
};

export const getNewTerminalScenarioDataFromExistingScenario = async (
  propertyId: number,
  scenarioId: number
): Promise<NewTerminalScenarioData> => {
  // Get scenario
  const scenario = await prisma.terminalScenario.findUniqueOrThrow({
    where: {
      id: scenarioId,
      deletedAt: null,
    },
  });

  // Get scenario vehicle
  const scenarioVehicle = await prisma.terminalScenarioVehicle.findFirstOrThrow(
    {
      where: {
        scenarioId: scenarioId,
        deletedAt: null,
      },
    }
  );

  // Get utility rate structure
  let utilityRateStructure: UtilityRateStructure;
  if (scenario.utilityRateId) {
    const utilityRate = await getUtilityRateById(scenario.utilityRateId);
    utilityRateStructure = transformUtilityRateStructure(utilityRate);
    // unset id for custom utility rate structures
    utilityRateStructure.id = utilityRate.terminalScenarioId
      ? null
      : utilityRateStructure.id;
  } else {
    const defaultOrgUtilityRateStructure =
      await getOrganizationUtilityRateStructureByPropertyId(propertyId);
    utilityRateStructure =
      defaultOrgUtilityRateStructure ?? defaultUtilityRateStructure;
  }

  // Get charger options
  const recommendedChargers = await getRecommendedChargers();
  const customChargers = await getChargersForTerminalScenario(scenarioId);
  const chargerOptions = recommendedChargers.concat(
    customChargers.map((customCharger) => {
      // unset id for custom chargers
      customCharger.id = null;
      return customCharger;
    })
  );

  // Get EV options
  const recommendedEVs = await getEVOptionsForTerminal(
    scenarioVehicle.vehicleTypeId
  );
  const customVehicles = await getCustomVehiclesForTerminal(scenarioVehicle.id);
  const evOptions = recommendedEVs.concat(
    customVehicles.map((customVehicle) => {
      // unset id for custom vehicles
      customVehicle.id = null;
      return customVehicle;
    })
  );

  return {
    scenarioName: scenario.name + " (Copy)",
    planningHorizonYears: scenario.planningHorizonYears,
    chargerMaintenanceCostPct: Number(scenario.chargerMaintenanceCostPct),
    chargerReplacementLifecycleYears: scenario.chargerReplacementLifecycleYears,
    iceFuelCostPerGallon: Number(scenario.iceFuelCostPerGallon),
    chargerOptions,
    shiftSchedule: scenarioVehicle.shiftSchedule,
    fleetMix: {
      vehicleTypeId: scenarioVehicle.vehicleTypeId,
      fleetSize: scenarioVehicle.numICEVehicles,
      vehiclesPerShift: scenarioVehicle.vehiclesPerShift,
      vehicleMaintenanceCostPct: Number(
        scenarioVehicle.vehicleMaintenanceCostPct
      ),
      vehicleReplacementLifecycleYears:
        scenarioVehicle.vehicleReplacementLifecycleYears,
      batteryReplacementLifecycleYears:
        scenarioVehicle.batteryReplacementLifecycleYears,
      iceVehicleId: scenarioVehicle.iceVehicleId,
      iceVehicleFuelConsumption: Number(scenarioVehicle.iceFuelConsumption),
      iceVehicleDowntime: Number(scenarioVehicle.iceDowntimePct),
      evExpectedDowntime: Number(scenarioVehicle.evDowntimePct),
      evOptions,
    },
    utilityRateStructure,
  };
};

export const createTerminalScenarioAndOptimizationData = async (
  propertyId: number,
  facilityId: number,
  newScenarioData: NewTerminalScenarioData
): Promise<OptimizationData> => {
  const organizationId = await getOrganizationIdFromProperty(propertyId);
  if (!organizationId) {
    throw new Error("Missing organizationId on terminal scenario creation");
  }

  const { scenarioId, chargerOptions, evOptions } =
    await createTerminalScenario(
      organizationId,
      propertyId,
      facilityId,
      newScenarioData
    );

  return await buildOptimizationData(
    scenarioId,
    chargerOptions,
    evOptions
  );
};

export const createTerminalScenario = async (
  organizationId: number,
  propertyId: number,
  facilityId: number,
  newScenarioData: NewTerminalScenarioData
): Promise<{
  scenarioId: number;
  scenarioVehicleId: number;
  chargerOptions: Charger[];
  evOptions: Vehicle[];
}> => {
  // Create terminal scenario
  let scenario = await prisma.terminalScenario.create({
    data: {
      propertyId,
      facilityId,
      utilityRateId: newScenarioData.utilityRateStructure.id,
      name: newScenarioData.scenarioName ?? "Untitled Scenario",
      planningHorizonYears: newScenarioData.planningHorizonYears,
      chargerMaintenanceCostPct: newScenarioData.chargerMaintenanceCostPct,
      chargerReplacementLifecycleYears:
        newScenarioData.chargerReplacementLifecycleYears,
      iceFuelCostPerGallon: newScenarioData.iceFuelCostPerGallon,
    },
  });

  // Create terminal scenario vehicle
  const fleetData = newScenarioData.fleetMix;
  if (!fleetData.vehicleTypeId) {
    throw new Error(
      "Missing vehicleTypeId on terminal scenario vehicle creation"
    );
  }

  const scenarioVehicle = await prisma.terminalScenarioVehicle.create({
    data: {
      scenarioId: scenario.id,
      vehicleTypeId: fleetData.vehicleTypeId,
      iceVehicleId: fleetData.iceVehicleId,
      numICEVehicles: fleetData.fleetSize,
      vehiclesPerShift: fleetData.vehiclesPerShift,
      vehicleMaintenanceCostPct: fleetData.vehicleMaintenanceCostPct,
      vehicleReplacementLifecycleYears:
        fleetData.vehicleReplacementLifecycleYears,
      batteryReplacementLifecycleYears:
        fleetData.batteryReplacementLifecycleYears,
      iceFuelConsumption: fleetData.iceVehicleFuelConsumption,
      iceDowntimePct: fleetData.iceVehicleDowntime,
      evDowntimePct: fleetData.evExpectedDowntime,
      shiftSchedule: newScenarioData.shiftSchedule,
    },
  });

  // Create utility rate if not using default
  if (!scenario.utilityRateId) {
    const utilityRate = await createCustomUtilityRateForTerminal(
      newScenarioData.utilityRateStructure,
      organizationId,
      scenario.id
    );
    scenario = await prisma.terminalScenario.update({
      where: { id: scenario.id },
      data: { utilityRateId: utilityRate.id },
    });
  }

  // Create and get charger options
  const chargerOptions = await getChargerOptions(
    newScenarioData.chargerOptions,
    organizationId,
    scenario.id
  );

  // Create and get EV options
  const evOptions = await getEVOptions(
    fleetData.evOptions,
    organizationId,
    scenarioVehicle.id
  );

  return {
    scenarioId: scenario.id,
    scenarioVehicleId: scenarioVehicle.id,
    chargerOptions,
    evOptions,
  };
};

const getChargerOptions = async (
  chargersData: ChargerData[],
  organizationId: number,
  scenarioId: number
): Promise<Charger[]> => {
  return await Promise.all(
    chargersData.map(async (charger) => {
      return charger.id
        ? await getChargerById(charger.id)
        : await createCustomChargerForTerminal(
            charger,
            organizationId,
            scenarioId
          );
    })
  );
};

const getEVOptions = async (
  vehiclesData: VehicleData[],
  organizationId: number,
  scenarioVehicleId: number
): Promise<Vehicle[]> => {
  return await Promise.all(
    vehiclesData.map(async (vehicle) => {
      return vehicle.id
        ? await getVehicleById(vehicle.id)
        : await createCustomVehicleForTerminal(
            vehicle,
            organizationId,
            scenarioVehicleId
          );
    })
  );
};

export interface OptimizationData {
  scenarioId: number;
  scenarioName: string;
  planningHorizonYears: number;
  chargerMaintenanceCostPct: number;
  chargerReplacementLifecycleYears: number;
  iceFuelCostPerGallon: number;
  shiftSchedule: number[];
  chargerOptions: ChargerData[];
  fleetMix: {
    scenarioVehicleId: number;
    fleetSize: number;
    vehiclesPerShift: number;
    vehicleMaintenanceCostPct: number;
    vehicleReplacementLifecycleYears: number;
    batteryReplacementLifecycleYears: number;
    iceVehicleFuelConsumption: number;
    iceVehicleDowntime: number;
    evExpectedDowntime: number;
    evOptions: VehicleData[];
    vehicleType: {
      id: number;
      name: string;
      kwhPerHour: number;
      iceEfficiency: number;
      evEfficiency: number;
      hybridEfficiency: number;
    };
  };
  utilityRateStructure: UtilityRateStructure;
  assumptionParameters: AssumptionParameters;
}

const buildOptimizationData = async (
  scenarioId: number,
  chargerOptions: Charger[],
  evOptions: Vehicle[]
): Promise<OptimizationData> => {
  const scenarioData = await prisma.terminalScenario.findUniqueOrThrow({
    where: {
      id: scenarioId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      planningHorizonYears: true,
      chargerMaintenanceCostPct: true,
      chargerReplacementLifecycleYears: true,
      iceFuelCostPerGallon: true,
      utilityRateId: true,
    },
  });

  const scenarioVehicleData =
    await prisma.terminalScenarioVehicle.findFirstOrThrow({
      where: {
        scenarioId: scenarioData.id,
        deletedAt: null,
      },
      select: {
        id: true,
        numICEVehicles: true,
        vehiclesPerShift: true,
        vehicleMaintenanceCostPct: true,
        vehicleReplacementLifecycleYears: true,
        batteryReplacementLifecycleYears: true,
        iceFuelConsumption: true,
        iceDowntimePct: true,
        evDowntimePct: true,
        shiftSchedule: true,
        vehicleType: {
          select: {
            id: true,
            name: true,
            kwhPerHour: true,
            iceEfficiency: true,
            evEfficiency: true,
            hybridEfficiency: true,
          },
        },
      },
    });

  if (!scenarioData.utilityRateId) {
    throw new Error(
      `Missing utility rate for terminal scenario id ${scenarioData.id}`
    );
  }

  const utilityRate = await getUtilityRateById(scenarioData.utilityRateId);
  const assumptionParameters = getAssumptionParameters(utilityRate);

  return {
    scenarioId: scenarioData.id,
    scenarioName: scenarioData.name,
    planningHorizonYears: scenarioData.planningHorizonYears,
    chargerMaintenanceCostPct: Number(scenarioData.chargerMaintenanceCostPct),
    chargerReplacementLifecycleYears:
      scenarioData.chargerReplacementLifecycleYears,
    iceFuelCostPerGallon: Number(scenarioData.iceFuelCostPerGallon),
    shiftSchedule: scenarioVehicleData.shiftSchedule,
    chargerOptions,
    fleetMix: {
      scenarioVehicleId: scenarioVehicleData.id,
      fleetSize: scenarioVehicleData.numICEVehicles,
      vehiclesPerShift: scenarioVehicleData.vehiclesPerShift,
      vehicleMaintenanceCostPct: Number(
        scenarioVehicleData.vehicleMaintenanceCostPct
      ),
      vehicleReplacementLifecycleYears:
        scenarioVehicleData.vehicleReplacementLifecycleYears,
      batteryReplacementLifecycleYears:
        scenarioVehicleData.batteryReplacementLifecycleYears,
      iceVehicleFuelConsumption: Number(scenarioVehicleData.iceFuelConsumption),
      iceVehicleDowntime: Number(scenarioVehicleData.iceDowntimePct),
      evExpectedDowntime: Number(scenarioVehicleData.evDowntimePct),
      evOptions,
      vehicleType: {
        id: scenarioVehicleData.vehicleType.id,
        name: scenarioVehicleData.vehicleType.name,
        kwhPerHour: Number(scenarioVehicleData.vehicleType.kwhPerHour),
        iceEfficiency: Number(scenarioVehicleData.vehicleType.iceEfficiency),
        evEfficiency: Number(scenarioVehicleData.vehicleType.evEfficiency),
        hybridEfficiency: Number(
          scenarioVehicleData.vehicleType.hybridEfficiency
        ),
      },
    },
    utilityRateStructure: utilityRate,
    assumptionParameters,
  };
};

const getOrganizationUtilityRateStructureByPropertyId = async (
  propertyId: number
): Promise<UtilityRateStructure | undefined> => {
  const organizationId = await getOrganizationIdFromProperty(propertyId);
  const [defaultOrgUtilityRateStructure] =
    await getUtilityRateStructureForOrganization(organizationId);
  return defaultOrgUtilityRateStructure;
};

const getOrganizationIdFromProperty = async (
  propertyId: number
): Promise<number> => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
      deletedAt: null,
    },
  });
  return property.organizationId;
};
