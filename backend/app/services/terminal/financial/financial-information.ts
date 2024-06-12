import { FinancialControls } from "../financial.service";
import {
  CapitalExpenses,
  OperationalExpenses,
  TotalCapitalExpenses,
  TotalOperationalExpenses,
  calcTotalCapitalExpenses,
  calcTotalOperationalExpenses,
} from "./expenses";

export interface FinancialInformation {
  totalCapitalExpenses: TotalCapitalExpenses;
  totalOperationalExpenses: TotalOperationalExpenses;
  capitalExpensesY1: TotalCapitalExpenses;
  operationalExpensesY1: TotalOperationalExpenses;
}

export const calcFinancialInformation = (
  financialControls: FinancialControls,
  capitalExpenses: CapitalExpenses,
  operationalExpenses: OperationalExpenses
): FinancialInformation => {
  const { planningHorizonYears } = financialControls;

  const totalCapitalExpenses = calcTotalCapitalExpenses(
    capitalExpenses,
    planningHorizonYears
  );
  const totalOperationalExpenses = calcTotalOperationalExpenses(
    operationalExpenses,
    planningHorizonYears
  );

  const capitalExpensesY1 = calcTotalCapitalExpenses(capitalExpenses, 1);
  const operationalExpensesY1 = calcTotalOperationalExpenses(
    operationalExpenses,
    1
  );

  return {
    totalCapitalExpenses,
    totalOperationalExpenses,
    capitalExpensesY1,
    operationalExpensesY1,
  };
};
