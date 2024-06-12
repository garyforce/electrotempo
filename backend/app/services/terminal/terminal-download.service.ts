import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_DISCOUNT_RATE,
  FinancialControls,
  FinancialData,
} from "./financial.service";
import { getFinancialData } from "./terminal.service";

const prisma = new PrismaClient();

export type TerminalDownloadData = {
  terminalName: string;
  facilityName: string;
  scenarioName: string;
  vehicleType: string;
  shiftSchedule: number[];
  utilityRateStructure: string;
  numShifts: number;
  vehiclesPerShift: number;
  numICEVehicles: number;
  optNumEvs: number;
  numChargers: number;
  optNumChargers: number;
  evVehicle: {
    name: string;
    make: string;
    model: string;
    batteryCapacityKwh: number;
    batteryMaxChargeRateKw: number;
    priceUsd: number;
  };
  charger: {
    name: string;
    make: string;
    model: string;
    chargeRateKw: number;
    voltage: number;
    amperage: number;
    priceUsd: number;
  };
  financial: {
    financialControls: FinancialControls;
    totalCapitalExpenses: number;
    totalOperationalExpenses: number;
    maxAnnualKwhUsage: number;
    maxAnnualPeakDemand: number;
  };
};

export const getDownloadDataByScenarioIds = async (
  scenarioIds: number[]
): Promise<TerminalDownloadData[]> => {
  const terminalScenarios = await fetchTerminalScenariosForDownload(
    scenarioIds
  );

  const downloadData: TerminalDownloadData[] = [];
  for (const terminalScenario of terminalScenarios) {
    if (!terminalScenario.scenarioVehicles.length) {
      continue;
    }

    const financialData = await getFinancialData(
      terminalScenario.id,
      terminalScenario.scenarioVehicles[0].id,
      terminalScenario.planningHorizonYears,
      DEFAULT_DISCOUNT_RATE
    );

    const transformedData = transformDownloadData(
      terminalScenario,
      financialData
    );

    downloadData.push(transformedData);
  }

  return downloadData;
};

const transformDownloadData = (
  terminalScenario: any,
  financialData: FinancialData
): TerminalDownloadData => {
  const scenarioVehicle = terminalScenario.scenarioVehicles[0];
  const { financialControls, financialInformation, maxEnergyDemand } =
    financialData;

  return {
    terminalName: terminalScenario.property.name,
    facilityName: terminalScenario.facility.name,
    scenarioName: terminalScenario.name,
    vehicleType: scenarioVehicle.vehicleType.name,
    shiftSchedule: scenarioVehicle.shiftSchedule,
    utilityRateStructure: terminalScenario.utilityRate.name,
    numShifts: scenarioVehicle.numShifts,
    vehiclesPerShift: scenarioVehicle.vehiclesPerShift,
    numICEVehicles: scenarioVehicle.numICEVehicles,
    optNumEvs: scenarioVehicle.fleetSize,
    numChargers: terminalScenario.numChargers,
    optNumChargers: terminalScenario.optNumChargers,
    evVehicle: {
      name: scenarioVehicle.evVehicle?.name ?? "",
      make: scenarioVehicle.evVehicle?.make ?? "",
      model: scenarioVehicle.evVehicle?.model ?? "",
      batteryCapacityKwh: Number(scenarioVehicle.evVehicle?.batteryCapacityKwh),
      batteryMaxChargeRateKw: Number(
        scenarioVehicle.evVehicle?.batteryMaxChargeRateKw
      ),
      priceUsd: Number(scenarioVehicle.evVehicle?.priceUsd),
    },
    charger: {
      name: terminalScenario.charger?.name ?? "",
      make: terminalScenario.charger?.make ?? "",
      model: terminalScenario.charger?.model ?? "",
      chargeRateKw: Number(terminalScenario.charger?.chargeRateKw),
      voltage: Number(terminalScenario.charger?.voltage),
      amperage: Number(terminalScenario.charger?.amperage),
      priceUsd: Number(terminalScenario.charger?.priceUsd),
    },
    financial: {
      financialControls,
      totalCapitalExpenses:
        financialInformation.totalCapitalExpenses.totalCapitalExpenses,
      totalOperationalExpenses:
        financialInformation.totalOperationalExpenses.totalOperationalExpenses,
      maxAnnualKwhUsage: maxEnergyDemand.energyUsageKwh,
      maxAnnualPeakDemand: maxEnergyDemand.peakDemandKw,
    },
  };
};

const fetchTerminalScenariosForDownload = async (scenarioIds: number[]) => {
  return await prisma.terminalScenario.findMany({
    where: {
      id: {
        in: scenarioIds,
      },
      active: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      planningHorizonYears: true,
      numChargers: true,
      optNumChargers: true,
      property: {
        select: {
          id: true,
          name: true,
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
        },
      },
      scenarioVehicles: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          vehiclesPerShift: true,
          numICEVehicles: true,
          fleetSize: true,
          shiftSchedule: true,
          vehicleType: {
            select: {
              id: true,
              name: true,
            },
          },
          energyConsumptionLevel: {
            select: {
              id: true,
              level: true,
            },
          },
          evVehicle: {
            select: {
              id: true,
              name: true,
              make: true,
              model: true,
              batteryCapacityKwh: true,
              batteryMaxChargeRateKw: true,
              priceUsd: true,
            },
          },
        },
      },
      charger: {
        select: {
          id: true,
          name: true,
          make: true,
          model: true,
          chargeRateKw: true,
          voltage: true,
          amperage: true,
          priceUsd: true,
        },
      },
      utilityRate: {
        select: {
          id: true,
          utilityId: true,
          name: true,
          organizationId: true,
          peakDemandChargePricePerKw: true,
          ppaPeakDemandChargePricePerKw: true,
          distributionDemandChargePricePerKw: true,
          ppaGenerationChargePricePerKwh: true,
          generationChargePricePerKwh: true,
          transmissionChargePricePerKwh: true,
          transmissionUsageKwh: true,
          totalUsageKwh: true,
          utility: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};
