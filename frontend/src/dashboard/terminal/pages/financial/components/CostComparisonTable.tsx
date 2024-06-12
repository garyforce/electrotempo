import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import HelpTooltip from "components/HelpTooltip";
import { CostComparisonTableData } from "types/terminal-financial";

export type CostComparisonTableProps = {
  data: CostComparisonTableData;
  baseVehicleEngineType: string;
};

export default function CostComparisonTable({
  data,
  baseVehicleEngineType,
}: CostComparisonTableProps) {
  const { iceOnlyData, evOpportunityChargingData, evOptimizedChargingData } =
    data;

  const formatCost = (cost: number) =>
    `$${cost.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const rows = [
    {
      label: "Vehicle Count (#)",
      key: "vehicle-count",
      values: [
        iceOnlyData.vehicleCount.toString(),
        evOpportunityChargingData.vehicleCount.toString(),
        evOptimizedChargingData.vehicleCount.toString(),
      ],
    },
    {
      label: "Vehicle Price (USD)",
      key: "vehicle-price",
      values: [
        iceOnlyData.vehiclePrice,
        evOpportunityChargingData.vehiclePrice,
        evOptimizedChargingData.vehiclePrice,
      ],
    },
    {
      label: "Vehicle Replacement Cost (USD)",
      key: "vehicle-replacement-cost",
      values: [
        iceOnlyData.vehicleReplacementCost,
        evOpportunityChargingData.vehicleReplacementCost,
        evOptimizedChargingData.vehicleReplacementCost,
      ],
    },
    {
      label: "Total Vehicle Cost (USD) Over Planning Horizon",
      key: "total-vehicle-cost",
      values: [
        iceOnlyData.totalVehicleCost,
        evOpportunityChargingData.totalVehicleCost,
        evOptimizedChargingData.totalVehicleCost,
      ],
    },
    {
      label: "Charger Count (#)",
      key: "charger-count",
      values: [
        iceOnlyData.chargerCount.toString(),
        evOpportunityChargingData.chargerCount.toString(),
        evOptimizedChargingData.chargerCount.toString(),
      ],
    },
    {
      label: "Charger Price (USD)",
      key: "charger-price",
      values: [
        iceOnlyData.chargerPrice,
        evOpportunityChargingData.chargerPrice,
        evOptimizedChargingData.chargerPrice,
      ],
    },
    {
      label: "Charger Installation Cost (USD)",
      key: "charger-installation-cost",
      values: [
        iceOnlyData.installationCost,
        evOpportunityChargingData.installationCost,
        evOptimizedChargingData.installationCost,
      ],
      tooltip:
        "The platform uses a default initial installation cost, which can then be overridden by the user above. Any user input cost will be used for Year 1, but for any following charger replacements during the planning horizon, we will use our calculated cost.",
    },
    {
      label: "Charger Replacement Cost (USD)",
      key: "charger-replacement-cost",
      values: [
        iceOnlyData.chargerReplacementCost,
        evOpportunityChargingData.chargerReplacementCost,
        evOptimizedChargingData.chargerReplacementCost,
      ],
    },
    {
      label: "Total Charger Cost (USD) Over Planning Horizon",
      key: "total-charger-cost",
      values: [
        iceOnlyData.totalChargerCost,
        evOpportunityChargingData.totalChargerCost,
        evOptimizedChargingData.totalChargerCost,
      ],
    },
    {
      label: "Battery Replacement Cost (USD)",
      key: "battery-replacement-cost",
      values: [
        iceOnlyData.batteryReplacementCost,
        evOpportunityChargingData.batteryReplacementCost,
        evOptimizedChargingData.batteryReplacementCost,
      ],
      tooltip:
        "This is a calculated cost informed by our research and the anticipated decrease in battery prices over time.",
    },
    {
      label: "Total Capital Expenses (Vehicle + Charger Costs; USD)",
      key: "total-capital-expenses",
      values: [
        iceOnlyData.totalCapitalExpenses,
        evOpportunityChargingData.totalCapitalExpenses,
        evOptimizedChargingData.totalCapitalExpenses,
      ],
    },
    {
      label: "Total Operating Expenses (Fuel + Maintenance Costs; USD)",
      key: "total-operating-expenses",
      values: [
        iceOnlyData.totalOperationalExpenses,
        evOpportunityChargingData.totalOperationalExpenses,
        evOptimizedChargingData.totalOperationalExpenses,
      ],
    },
    {
      label: "Total Expenses (CapEx + OpEx Across Planning Horizon; USD)",
      key: "total-expenses",
      values: [
        iceOnlyData.totalExpenses,
        evOpportunityChargingData.totalExpenses,
        evOptimizedChargingData.totalExpenses,
      ],
    },

    {
      label: "Total NPV Expenses (USD)",
      key: "total-npv-expenses",
      values: [
        iceOnlyData.totalExpensesNPV,
        evOpportunityChargingData.totalExpensesNPV,
        evOptimizedChargingData.totalExpensesNPV,
      ],
    },
  ];

  return (
    <TableContainer component={Paper} className="cost-comparison-table">
      <Table aria-label="simple table">
        <TableHead>
          <TableCell sx={{ fontWeight: 500 }}>Configuration Type</TableCell>
          <TableCell
            sx={{ fontWeight: 500 }}
          >{`${baseVehicleEngineType} Only`}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>EV - Reference Case</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>
            EV - Optimized Charging
          </TableCell>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell sx={{ fontWeight: 500 }}>
                {row.tooltip ? (
                  <HelpTooltip title={row.tooltip}>
                    <>{row.label}</>
                  </HelpTooltip>
                ) : (
                  row.label
                )}
              </TableCell>
              {row.values.map((value, i) => (
                <TableCell key={`${row.key}-${i}`}>
                  {typeof value === "number" ? formatCost(value) : value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
