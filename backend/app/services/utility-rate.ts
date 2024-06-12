import { PrismaClient, UtilityRate as UtilityRateModel } from "@prisma/client";

const prisma = new PrismaClient();

export interface UtilityRateStructure {
  id: number | null;
  name: string | null;
  generationChargePricePerKwh: number;
  transmissionChargePricePerKwh: number;
  distributionChargePricePerKwh: number;
  generationDemandChargePricePerKw: number;
  transmissionDemandChargePricePerKw: number;
  distributionDemandChargePricePerKw: number;
  ppaGenerationChargePricePerKwh: number;
  ppaTransmissionChargePricePerKwh: number;
  ppaDistributionChargePricePerKwh: number;
  ppaGenerationDemandChargePricePerKw: number;
  ppaTransmissionDemandChargePricePerKw: number;
  ppaDistributionDemandChargePricePerKw: number;
}

export interface UtilityRate extends UtilityRateStructure {
  id: number;
  utilityId: number | null;
  organizationId: number | null;
  terminalScenarioId: number | null;
  peakDemandChargePricePerKw: number;
  ppaPeakDemandChargePricePerKw: number;
  transmissionUsageKwh: number;
  totalUsageKwh: number;
}

export const getUtilityRateById = async (
  utilityRateId: number
): Promise<UtilityRate> => {
  const utilityRate = await prisma.utilityRate.findUniqueOrThrow({
    where: {
      id: utilityRateId,
      deletedAt: null,
    },
  });
  return transformUtilityRate(utilityRate);
};

export const getUtilityRateStructureById = async (
  utilityRateId: number
): Promise<UtilityRateStructure> => {
  const utilityRate = await getUtilityRateById(utilityRateId);
  return transformUtilityRateStructure(utilityRate);
}

export const getUtilityRatesForOrganization = async (
  organizationId: number
): Promise<UtilityRate[]> => {
  const utilityRates = await prisma.utilityRate.findMany({
    where: {
      organizationId,
      terminalScenarioId: null,
      deletedAt: null,
    },
  });
  return utilityRates.map((utilityRate) => {
    return transformUtilityRate(utilityRate);
  });
};

export const getUtilityRateStructureForOrganization = async (
  organizationId: number
): Promise<UtilityRateStructure[]> => {
  const utilityRates = await getUtilityRatesForOrganization(organizationId);
  return utilityRates.map((utilityRate) =>
    transformUtilityRateStructure(utilityRate)
  );
};

export const createCustomUtilityRateForTerminal = async (
  utilityRateStructure: UtilityRateStructure,
  organizationId: number,
  terminalScenarioId: number
): Promise<UtilityRate> => {
  const peakDemandChargePricePerKw =
    utilityRateStructure.generationDemandChargePricePerKw +
    utilityRateStructure.transmissionDemandChargePricePerKw +
    utilityRateStructure.distributionDemandChargePricePerKw;
  const ppaPeakDemandChargePricePerKw =
    utilityRateStructure.ppaGenerationDemandChargePricePerKw +
    utilityRateStructure.ppaTransmissionDemandChargePricePerKw +
    utilityRateStructure.ppaDistributionDemandChargePricePerKw;

  const { id: _, ...rest } = utilityRateStructure;
  const utilityRate = await prisma.utilityRate.create({
    data: {
      ...rest,
      name: "Custom Utility Rate",
      organizationId,
      terminalScenarioId,
      peakDemandChargePricePerKw,
      ppaPeakDemandChargePricePerKw,
    },
  });
  return transformUtilityRate(utilityRate);
};

const transformUtilityRate = (utilityRate: UtilityRateModel): UtilityRate => {
  return {
    id: utilityRate.id,
    name: utilityRate.name,
    utilityId: utilityRate.utilityId,
    organizationId: utilityRate.organizationId,
    terminalScenarioId: utilityRate.terminalScenarioId,
    generationChargePricePerKwh: Number(
      utilityRate.generationChargePricePerKwh
    ),
    transmissionChargePricePerKwh: Number(
      utilityRate.transmissionChargePricePerKwh
    ),
    distributionChargePricePerKwh: Number(
      utilityRate.distributionChargePricePerKwh
    ),
    generationDemandChargePricePerKw: Number(
      utilityRate.generationDemandChargePricePerKw
    ),
    transmissionDemandChargePricePerKw: Number(
      utilityRate.transmissionDemandChargePricePerKw
    ),
    distributionDemandChargePricePerKw: Number(
      utilityRate.distributionDemandChargePricePerKw
    ),
    ppaGenerationChargePricePerKwh: Number(
      utilityRate.ppaGenerationChargePricePerKwh
    ),
    ppaTransmissionChargePricePerKwh: Number(
      utilityRate.ppaTransmissionChargePricePerKwh
    ),
    ppaDistributionChargePricePerKwh: Number(
      utilityRate.ppaDistributionChargePricePerKwh
    ),
    ppaGenerationDemandChargePricePerKw: Number(
      utilityRate.ppaGenerationDemandChargePricePerKw
    ),
    ppaTransmissionDemandChargePricePerKw: Number(
      utilityRate.ppaTransmissionDemandChargePricePerKw
    ),
    ppaDistributionDemandChargePricePerKw: Number(
      utilityRate.ppaDistributionDemandChargePricePerKw
    ),
    peakDemandChargePricePerKw: Number(utilityRate.peakDemandChargePricePerKw),
    ppaPeakDemandChargePricePerKw: Number(
      utilityRate.ppaPeakDemandChargePricePerKw
    ),
    transmissionUsageKwh: Number(utilityRate.transmissionUsageKwh),
    totalUsageKwh: Number(utilityRate.totalUsageKwh),
  };
};

export const transformUtilityRateStructure = (
  utilityRate: UtilityRateModel | UtilityRate
): UtilityRateStructure => {
  return {
    id: utilityRate.id,
    name: utilityRate.name,
    generationChargePricePerKwh: Number(
      utilityRate.generationChargePricePerKwh
    ),
    transmissionChargePricePerKwh: Number(
      utilityRate.transmissionChargePricePerKwh
    ),
    distributionChargePricePerKwh: Number(
      utilityRate.distributionChargePricePerKwh
    ),
    generationDemandChargePricePerKw: Number(
      utilityRate.generationDemandChargePricePerKw
    ),
    transmissionDemandChargePricePerKw: Number(
      utilityRate.transmissionDemandChargePricePerKw
    ),
    distributionDemandChargePricePerKw: Number(
      utilityRate.distributionDemandChargePricePerKw
    ),
    ppaGenerationChargePricePerKwh: Number(
      utilityRate.ppaGenerationChargePricePerKwh
    ),
    ppaTransmissionChargePricePerKwh: Number(
      utilityRate.ppaTransmissionChargePricePerKwh
    ),
    ppaDistributionChargePricePerKwh: Number(
      utilityRate.ppaDistributionChargePricePerKwh
    ),
    ppaGenerationDemandChargePricePerKw: Number(
      utilityRate.ppaGenerationDemandChargePricePerKw
    ),
    ppaTransmissionDemandChargePricePerKw: Number(
      utilityRate.ppaTransmissionDemandChargePricePerKw
    ),
    ppaDistributionDemandChargePricePerKw: Number(
      utilityRate.ppaDistributionDemandChargePricePerKw
    ),
  };
};
