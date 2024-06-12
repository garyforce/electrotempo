export type DemandProfileDatapoint = {
  id: string;
  infrastructureOptimizationScenarioId: string;
  hour: Date;
  energyDemandKwh: number;
  powerDemandKw: number;
  inserted_by: string;
};
