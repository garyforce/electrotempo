import { PrismaClient, Charger as ChargerModel } from "@prisma/client";

const prisma = new PrismaClient();

export interface ChargerData {
  id?: number | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  chargeRateKw: number;
  voltage: number;
  amperage: number;
  priceUsd: number;
}

export interface Charger extends ChargerData {
  id: number;
  organizationId: number | null;
}

export const getChargerById = async (chargerId: number): Promise<Charger> => {
  const charger = await prisma.charger.findUniqueOrThrow({
    where: {
      id: chargerId,
      deletedAt: null,
    },
  });
  return transformCharger(charger);
};

export const getRecommendedChargers = async (): Promise<ChargerData[]> => {
  const RECOMMENDED_CHARGER_IDS: number[] =
    process.env.DB_HOST === "localhost" ? [1, 2, 3, 4] : [290, 391, 392, 393];

  const recommendedChargers = await prisma.charger.findMany({
    where: {
      id: {
        in: RECOMMENDED_CHARGER_IDS,
      },
      deletedAt: null,
    },
  });

  return recommendedChargers.map((charger) => transformChargerData(charger));
};

export const getChargersForTerminalScenario = async (
  terminalScenarioId: number
): Promise<ChargerData[]> => {
  const chargers = await prisma.charger.findMany({
    where: {
      terminalScenarioId,
      deletedAt: null,
    },
  });
  return chargers.map((charger) => transformChargerData(charger));
};

export const createCustomChargerForTerminal = async (
  chargerData: ChargerData,
  organizationId: number,
  terminalScenarioId: number
): Promise<Charger> => {
  const { id: _, ...rest } = chargerData;
  const charger = await prisma.charger.create({
    data: {
      ...rest,
      organizationId,
      terminalScenarioId,
    },
  });
  return transformCharger(charger);
};

const transformCharger = (charger: ChargerModel): Charger => {
  return {
    id: charger.id,
    organizationId: charger.organizationId,
    name: charger.name,
    make: charger.make,
    model: charger.model,
    chargeRateKw: Number(charger.chargeRateKw),
    voltage: Number(charger.voltage),
    amperage: Number(charger.amperage),
    priceUsd: Number(charger.priceUsd),
  };
};

const transformChargerData = (charger: ChargerModel | Charger): ChargerData => {
  return {
    id: charger.id,
    name: charger.name,
    make: charger.make,
    model: charger.model,
    chargeRateKw: Number(charger.chargeRateKw),
    voltage: Number(charger.voltage),
    amperage: Number(charger.amperage),
    priceUsd: Number(charger.priceUsd),
  };
};
