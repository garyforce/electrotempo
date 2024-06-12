import { Box, Grid, Typography } from "@mui/material";
import { Section } from "components/Section";
import { CapitalExpense } from "types/capital-expense";
import { OperationalExpense } from "types/operational-expense";
import { Financial } from "types/hub-scenario-data";
import FinancialExpenseChart from "./charts/FinancialExpenseChart";
import CapitalExpenseInformation from "./components/CapitalExpenseInformation";
import OperationalExpenseInformation from "./components/OperationalExpenseInformation";

export type FinancialHubProps = {
  financialData: Financial | undefined;
  year: number;
};

const FinancialHub = ({ financialData, year }: FinancialHubProps) => {
  const capitalDataset: CapitalExpense[][] = [
    [
      {
        itemized: true,
        type: "charger costs",
        year: year,
        pricePerEach: financialData?.capital_expenses.charger_costs ?? 0,
        numPurchased: 0,
      },
    ],
    [
      {
        itemized: true,
        type: "charger Installation costs",
        year: year,
        pricePerEach:
          financialData?.capital_expenses.chargers_installation_costs ?? 0,
        numPurchased: 0,
      },
    ],
  ];

  const operationalDataset: OperationalExpense[][] = [
    [
      {
        costUsd: financialData?.operational_costs.energy_cost ?? 0,
        type: "Energy Charge",
        year: year,
      },
    ],
    [
      {
        costUsd: financialData?.operational_costs.energy_demand_cost ?? 0,
        type: "Demand Charge",
        year: year,
      },
    ],
    [
      {
        costUsd: financialData?.operational_costs.maintenance_cost ?? 0,
        type: "Maintenance Costs",
        year: year,
      },
    ],
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Capital Expenses
              </Typography>
            </Box>
            <FinancialExpenseChart
              type="capital"
              chartData={capitalDataset}
              year={year}
            />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Operational Expenses
              </Typography>
            </Box>
            <FinancialExpenseChart
              type="operational"
              chartData={operationalDataset}
              year={year}
            />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <CapitalExpenseInformation data={financialData?.capital_expenses} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <OperationalExpenseInformation
            data={financialData?.operational_costs}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialHub;
