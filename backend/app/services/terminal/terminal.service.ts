import { PrismaClient, VehicleTypes } from "@prisma/client";

import {
  FinancialCalculationInputs,
  InvestmentStrategy,
  calcFinancialData,
} from "./financial.service";
import { calcInstallationCost } from "./financial.service";
import {
  TerminalDownloadData,
  getDownloadDataByScenarioIds,
} from "./terminal-download.service";
import {
  UtilityRate,
  getUtilityRatesForOrganization,
  getUtilityRateById,
} from "../utility-rate";
import {
  NewTerminalScenarioData,
  OptimizationData,
  createTerminalScenarioAndOptimizationData,
  getDefaultNewTerminalScenarioData,
  getNewTerminalScenarioDataFromExistingScenario,
} from "./terminal-create-scenario";
import { getVehiclesByVehicleTypeId } from "../vehicle";

const prisma = new PrismaClient();

const isOrganizationElectroTempo = async (organizationId: number) => {
  // For Localhost there is no et_auth table, so just returning true
  if (process.env.DB_HOST === "localhost") return true;

  const ELECTROTEMPO_ORGANIZATION_NAME = "ElectroTempo";

  const organization: { id: number }[] | null | undefined =
    await prisma.$queryRaw`
  SELECT
    id
  FROM "et_auth"."organization"
  WHERE name = ${ELECTROTEMPO_ORGANIZATION_NAME}
  `;
  return organization?.[0].id === organizationId;
};

export const getAllTerminals = async (orgId: number) => {
  const isElectroTempo = await isOrganizationElectroTempo(orgId);

  // Only return scenarios that are active or status_updated_at one day ago
  // so we do not show a bunch of dead scenarios
  let statusUpdatedAtFilterDate = new Date();
  statusUpdatedAtFilterDate.setDate(statusUpdatedAtFilterDate.getDate() - 1);

  const terminals = await prisma.property.findMany({
    where: !isElectroTempo
      ? { organizationId: orgId, deletedAt: null }
      : { deletedAt: null },
    select: {
      id: true,
      name: true,
      address: true,
      lat: true,
      lon: true,
      terminalFacilities: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          propertyId: true,
          terminalScenarios: {
            where: {
              OR: [
                { active: true },
                {
                  statusUpdatedAt: {
                    gte: statusUpdatedAtFilterDate,
                  },
                },
              ],
              AND: {
                deletedAt: null,
              },
            },
            select: {
              id: true,
              propertyId: true,
              property: {
                select: {
                  id: true,
                  name: true,
                  organizationId: true,
                },
              },
              facilityId: true,
              facility: {
                select: {
                  id: true,
                  name: true,
                },
              },
              name: true,
              active: true,
              status: {
                select: {
                  id: true,
                  status: true,
                },
              },
              utilityRateId: true,
              scenarioVehicles: {
                where: {
                  deletedAt: null,
                },
                select: {
                  id: true,
                  numICEVehicles: true,
                },
              },
            },
            orderBy: [{ active: "desc" }, { id: "desc" }],
          },
        },
      },
    },
  });

  const terminalsWithFleetSizeSum = terminals.map((terminal) => {
    const terminalScenarioFleetSizeSum = terminal.terminalFacilities.reduce(
      (facilitySum: number, facility: any) => {
        facility.terminalScenarios.map((scenario: any) => {
          scenario.scenarioVehicles.map((scenarioVehicle: any) => {
            facilitySum += scenarioVehicle.numICEVehicles;
          });
        });
        return facilitySum;
      },
      0
    );

    return {
      ...terminal,
      fleetSizeSum: terminalScenarioFleetSizeSum,
    };
  });

  return terminalsWithFleetSizeSum;
};

export const deleteTerminalScenarioById = async (
  terminalId: number,
  facilityId: number,
  scenarioId: number
) => {
  return await prisma.terminalScenario.update({
    where: {
      propertyId: terminalId,
      facilityId: facilityId,
      id: scenarioId,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const getScenarioVehicleData = async (
  scenarioId: number,
  scenarioVehicleId: number
) => {
  const scenarioVehicleData =
    await prisma.terminalScenarioVehicle.findUniqueOrThrow({
      where: {
        id: scenarioVehicleId,
        scenarioId: scenarioId,
        deletedAt: null,
      },
      select: {
        id: true,
        fleetSize: true,
        vehiclesPerShift: true,
        numICEVehicles: true,
        numICEVehiclesToElectrify: true,
        evReserve: true,
        evDowntimePct: true,
        iceDowntimePct: true,
        iceFuelConsumption: true,
        vehicleMaintenanceCostPct: true,
        vehicleReplacementLifecycleYears: true,
        batteryReplacementLifecycleYears: true,
        shiftSchedule: true,
        scenario: {
          select: {
            id: true,
            name: true,
            planningHorizonYears: true,
            numChargers: true,
            optNumChargers: true,
            chargerMaintenanceCostPct: true,
            chargerReplacementLifecycleYears: true,
            iceFuelCostPerGallon: true,
            utilityRateId: true,
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
                name: true,
              },
            },
          },
        },
        vehicleType: {
          select: {
            id: true,
            name: true,
            kwhPerHour: true,
            iceReferenceCostUsd: true,
          },
        },
        iceVehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true,
            batteryCapacityKwh: true,
            batteryMaxChargeRateKw: true,
            priceUsd: true,
            engineType: true,
            buyAmericaCompliance: true
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
            engineType: true,
            buyAmericaCompliance: true
          },
        },
        energyConsumptionLevel: {
          select: {
            id: true,
            level: true,
          },
        },
        energyDemandDatapoints: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            hour: true,
            energyDemandKwh: true,
            powerDemandKw: true,
          },
          orderBy: {
            hour: "asc",
          },
        },
        vehicleStatusDatapoints: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            hour0: true,
            hour1: true,
            hour2: true,
            hour3: true,
            hour4: true,
            hour5: true,
            hour6: true,
            hour7: true,
            hour8: true,
            hour9: true,
            hour10: true,
            hour11: true,
            hour12: true,
            hour13: true,
            hour14: true,
            hour15: true,
            hour16: true,
            hour17: true,
            hour18: true,
            hour19: true,
            hour20: true,
            hour21: true,
            hour22: true,
            hour23: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

  // Populate vehicle statuses
  if (scenarioVehicleData.vehicleStatusDatapoints.length) {
    const vehicleStatuses = await prisma.vehicleStatuses.findMany();
    const statuses = vehicleStatuses.reduce((status, vehicleStatuses) => {
      status[vehicleStatuses.id] = vehicleStatuses.status;
      return status;
    }, [] as any);

    scenarioVehicleData.vehicleStatusDatapoints.map(
      (vehicleStatusDatapoint) => {
        Array.from({ length: 24 }, (_, i) => {
          const key = `hour${i}` as keyof typeof vehicleStatusDatapoint;
          vehicleStatusDatapoint[key] = statuses[vehicleStatusDatapoint[key]];
        });
        return vehicleStatusDatapoint;
      }
    );
  }

  const scenario = await prisma.terminalScenario.findUniqueOrThrow({
    where: {
      id: scenarioId,
      deletedAt: null,
    },
    select: {
      chargerCost: true,
      vehicleCost: true,
      installationCost: true,
    },
  });

  let { chargerCost, vehicleCost, installationCost } = scenario;

  if (
    chargerCost === null ||
    vehicleCost === null ||
    installationCost === null
  ) {
    vehicleCost = Number(scenarioVehicleData.evVehicle?.priceUsd);
    chargerCost = Number(scenarioVehicleData.scenario.charger?.priceUsd);
    installationCost = calcInstallationCost(
      scenarioVehicleData.scenario.optNumChargers,
      Number(scenarioVehicleData.scenario.charger?.chargeRateKw ?? 0)
    );

    await updateScenarioCosts(
      scenarioId,
      chargerCost,
      vehicleCost,
      installationCost
    );
  }

  return {
    ...scenarioVehicleData,
    vehicleCost,
    scenario: {
      ...scenarioVehicleData.scenario,
      chargerCost,
      installationCost,
    },
  };
};

export const updateScenarioCosts = async (
  scenarioId: number,
  chargerCost: number,
  vehicleCost: number,
  installationCost: number
) => {
  await prisma.terminalScenario.update({
    where: {
      id: scenarioId,
      deletedAt: null,
    },
    data: {
      chargerCost,
      vehicleCost,
      installationCost,
    },
  });

  return "Update scenario costs succesfully!";
};

export const getCreateScenarioData = async (
  propertyId: number,
  scenarioId?: number
) => {
  const newTerminalScenarioData = scenarioId
    ? await getNewTerminalScenarioDataFromExistingScenario(
        propertyId,
        scenarioId
      )
    : await getDefaultNewTerminalScenarioData(propertyId);

  const vehicleTypes = await prisma.vehicleTypes.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      iceReferenceFuelConsumption: true,
    },
  });

  return {
    newTerminalScenarioData,
    vehicleTypes: vehicleTypes.map((vehicleType) => {
      return {
        ...vehicleType,
        iceReferenceFuelConsumption: Number(
          vehicleType.iceReferenceFuelConsumption
        ),
      };
    }),
  };
};

export const getUtilityRates = async (
  orgId: number
): Promise<UtilityRate[]> => {
  return await getUtilityRatesForOrganization(orgId);
};

export const createTerminalScenario = async (
  propertyId: number,
  facilityId: number,
  newScenarioData: NewTerminalScenarioData
): Promise<OptimizationData> => {
  return await createTerminalScenarioAndOptimizationData(
    propertyId,
    facilityId,
    newScenarioData
  );
};

export const getVehicleTypeInformation = async (vehicleTypeId: number) => {
  return await getVehiclesByVehicleTypeId(vehicleTypeId);
};

export const getFinancialData = async (
  scenarioId: number,
  scenarioVehicleId: number,
  planningHorizonYears: number,
  discountRate: number,
  planningStartYear?: number,
  fuelCostGrowthRate?: number,
  ppaRate?: number,
  investmentStrategy?: InvestmentStrategy,
  chargerCost?: number,
  vehicleCost?: number,
  initInstallationCost?: number,
  utilityRateId?: number
) => {
  const scenarioVehicleData =
    await prisma.terminalScenarioVehicle.findFirstOrThrow({
      where: {
        id: scenarioVehicleId,
        scenarioId,
        deletedAt: null,
      },
      select: {
        id: true,
        fleetSize: true,
        shiftSchedule: true,
        vehiclesPerShift: true,
        numICEVehicles: true,
        numICEVehiclesToElectrify: true,
        vehicleMaintenanceCostPct: true,
        vehicleReplacementLifecycleYears: true,
        batteryReplacementLifecycleYears: true,
        iceFuelConsumption: true,
        iceDowntimePct: true,
        evDowntimePct: true,
        evReserve: true,
        scenario: {
          select: {
            id: true,
            planningHorizonYears: true,
            numChargers: true,
            optNumChargers: true,
            chargerMaintenanceCostPct: true,
            chargerReplacementLifecycleYears: true,
            utilityRateId: true,
            charger: {
              select: {
                id: true,
                chargeRateKw: true,
                priceUsd: true,
              },
            },
          },
        },
        evVehicle: {
          select: {
            id: true,
            priceUsd: true,
            batteryCapacityKwh: true,
            batteryMaxChargeRateKw: true,
          },
        },
        vehicleType: {
          select: {
            id: true,
            iceReferenceCostUsd: true,
            iceReferenceFuelConsumption: true,
          },
        },
        energyDemandDatapoints: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            energyDemandKwh: true,
            powerDemandKw: true,
          },
        },
      },
    });

  const utilityRate = await getUtilityRateById(
    Number(utilityRateId ?? scenarioVehicleData.scenario.utilityRateId)
  );

  const financialCalculationInputs: FinancialCalculationInputs = {
    planningHorizonYears: scenarioVehicleData.scenario.planningHorizonYears,
    numVehicles:
      scenarioVehicleData.fleetSize ??
      scenarioVehicleData.numICEVehiclesToElectrify,
    numICEVehicles: scenarioVehicleData.numICEVehicles,
    shiftSchedule: scenarioVehicleData.shiftSchedule,
    vehiclesPerShift: scenarioVehicleData.vehiclesPerShift,
    iceReferenceCostUsd: Number(
      scenarioVehicleData.vehicleType.iceReferenceCostUsd
    ),
    iceFuelConsumption: Number(
      scenarioVehicleData.iceFuelConsumption ||
        scenarioVehicleData.vehicleType.iceReferenceFuelConsumption
    ),
    iceDowntimePct: Number(scenarioVehicleData.iceDowntimePct),
    evDowntimePct: Number(scenarioVehicleData.evDowntimePct),
    evReserve: scenarioVehicleData.evReserve,
    numChargers: scenarioVehicleData.scenario.optNumChargers,
    chargerChargeRateKw: Number(
      scenarioVehicleData.scenario.charger?.chargeRateKw ?? 0
    ),
    chargerPrice: Number(scenarioVehicleData.scenario.charger?.priceUsd ?? 0),
    vehiclePrice: Number(scenarioVehicleData.evVehicle?.priceUsd ?? 0),
    vehicleBatteryCapacityKwh: Number(
      scenarioVehicleData.evVehicle?.batteryCapacityKwh ?? 0
    ),
    vehicleBatteryMaxChargeRateKw: Number(
      scenarioVehicleData.evVehicle?.batteryMaxChargeRateKw ?? 0
    ),
    vehicleMaintenanceCostPct: Number(
      scenarioVehicleData.vehicleMaintenanceCostPct
    ),
    chargerMaintenanceCostPct: Number(
      scenarioVehicleData.scenario.chargerMaintenanceCostPct
    ),
    batteryReplacementLifecycleYears:
      scenarioVehicleData.batteryReplacementLifecycleYears,
    chargerReplacementLifecycleYears:
      scenarioVehicleData.scenario.chargerReplacementLifecycleYears,
    vehicleReplacementLifecycleYears:
      scenarioVehicleData.vehicleReplacementLifecycleYears,
    energyDemandDatapoints: scenarioVehicleData.energyDemandDatapoints,
    utilityRate,
  };

  return calcFinancialData(
    financialCalculationInputs,
    planningHorizonYears,
    planningStartYear,
    fuelCostGrowthRate,
    discountRate,
    ppaRate,
    investmentStrategy,
    chargerCost,
    vehicleCost,
    initInstallationCost
  );
};

export const getTerminalScenariosDownloadData = async (
  scenarioIds: number[]
): Promise<TerminalDownloadData[]> => {
  return await getDownloadDataByScenarioIds(scenarioIds);
};

type ScenarioStatus = {
  id: number;
  active: boolean;
  status: string | null;
};

export const checkScenariosStatuses = async (scenarioIds: number[]) => {
  const scenariosStatuses = await prisma.terminalScenario.findMany({
    where: {
      id: {
        in: scenarioIds,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      active: true,
      status: {
        select: {
          status: true,
        },
      },
    },
  });

  return scenariosStatuses.reduce(
    (statuses: ScenarioStatus[], scenariosStatus) => {
      statuses.push({
        ...scenariosStatus,
        status: scenariosStatus.status?.status ?? null,
      });
      return statuses;
    },
    []
  );
};

export type TerminalScenarioStatus =
  | "SUCCESS"
  | "FAILED"
  | "TIMEOUT"
  | "IN-PROGRESS";

export const updateScenarioStatus = async (
  scenarioId: number,
  status: TerminalScenarioStatus,
  active: boolean = false
) => {
  const statusMap = {
    SUCCESS: 1,
    FAILED: 2,
    TIMEOUT: 3,
    "IN-PROGRESS": 4,
  };

  const scenario = await prisma.terminalScenario.findFirstOrThrow({
    where: {
      id: scenarioId,
    },
    select: {
      id: true,
      active: true,
      status: true,
    },
  });

  if (
    !scenario.active &&
    (!scenario.status || scenario.status?.status === "IN-PROGRESS")
  ) {
    await prisma.terminalScenario.update({
      where: {
        id: scenarioId,
      },
      data: {
        statusId: statusMap[status],
        statusUpdatedAt: new Date(),
        active,
      },
    });
    console.log(
      `Updated terminal scenario (id=${scenarioId}) status to ${status}`
    );
  }
};
