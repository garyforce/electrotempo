import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type InvestmentStrategy = "upfront" | "uniform";

export interface FinancialControlState {
  discountRate: number;
  fuelCostGrowthRate: number;
  planningStartYear: number;
  planningHorizonYears: number;
  ppaRate: number;
  investmentStrategy: InvestmentStrategy;
  chargerCost: number;
  vehicleCost: number;
  installationCost: number;
  utilityRateId: number;
  attributableInstallationCost: number;
}

const initialState: FinancialControlState = {
  discountRate: 0.04,
  fuelCostGrowthRate: 0.05,
  planningStartYear: new Date().getFullYear(),
  planningHorizonYears: 12,
  ppaRate: 0.4,
  investmentStrategy: "upfront",
  chargerCost: 0,
  vehicleCost: 0,
  installationCost: 0,
  utilityRateId: 1,
  attributableInstallationCost: 0,
};

export const financialSlice = createSlice({
  name: "financial",
  initialState,
  reducers: {
    setDiscountRate(state, { payload }: PayloadAction<number>) {
      state.discountRate = payload;
    },
    setFuelCostGrowthRate(state, { payload }: PayloadAction<number>) {
      state.fuelCostGrowthRate = payload;
    },
    setPlanningStartYear(state, { payload }: PayloadAction<number>) {
      state.planningStartYear = payload;
    },
    setPlanningHorizonYears(state, { payload }: PayloadAction<number>) {
      state.planningHorizonYears = payload;
    },
    setPPARate(state, { payload }: PayloadAction<number>) {
      state.ppaRate = payload;
    },
    setInvestmentStrategy(
      state,
      { payload }: PayloadAction<InvestmentStrategy>
    ) {
      state.investmentStrategy = payload;
    },
    setChargerCost(state, { payload }: PayloadAction<number>) {
      state.chargerCost = payload;
    },
    setVehicleCost(state, { payload }: PayloadAction<number>) {
      state.vehicleCost = payload;
    },
    setInstallationCost(state, { payload }: PayloadAction<number>) {
      state.installationCost = payload;
    },
    setUtilityRateId(state, { payload }: PayloadAction<number>) {
      state.utilityRateId = payload;
    },
    setAttributableInstallationCost(state, { payload }: PayloadAction<number>) {
      state.attributableInstallationCost = payload;
    },
  },
});

export const {
  setDiscountRate,
  setFuelCostGrowthRate,
  setPlanningStartYear,
  setPlanningHorizonYears,
  setPPARate,
  setInvestmentStrategy,
  setChargerCost,
  setVehicleCost,
  setInstallationCost,
  setUtilityRateId,
  setAttributableInstallationCost,
} = financialSlice.actions;

export default financialSlice.reducer;
