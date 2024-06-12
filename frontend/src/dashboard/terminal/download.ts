import { downloadFile } from "../../utils/file";
import { TerminalDownloadData } from "types/terminal-download";
import { FinancialControls, FinancialData } from "types/terminal-financial";
import { TerminalScenarioVehicle } from "types/terminal-scenario-vehicle";

const formatCost = (cost: number) => `"$${Math.round(cost).toLocaleString()}"`;

export const downloadConfigurationCSV = (
  terminalScenarioVehicle: TerminalScenarioVehicle,
  financialControls: FinancialControls,
  financialData: FinancialData
) => {
  let csvData = "";
  const appendData = (data: string = "") => {
    csvData += data;
    csvData += "\n";
  };

  const configurationDownloadData = {
    Terminal: terminalScenarioVehicle.scenario.property.name,
    "Cost Center": terminalScenarioVehicle.scenario.facility.name,
    "Configuration Name": terminalScenarioVehicle.scenario.name,
    "Vehicle Type": terminalScenarioVehicle.vehicleType.name,
    "ICE Vehicle Fuel Consumption (diesel-gallons per hour)":
      terminalScenarioVehicle.iceFuelConsumption,
    "Existing ICE Fleet Size": terminalScenarioVehicle.numICEVehicles,
    "Vehicles Per Shift": terminalScenarioVehicle.vehiclesPerShift,
    "ICE Reference Vehicle": terminalScenarioVehicle.iceVehicle?.name,
    "ICE Vehicle Downtime (%)": terminalScenarioVehicle.iceDowntimePct * 100,
    "EV Expected Downtime (%)": terminalScenarioVehicle.evDowntimePct * 100,
    "Vehicle Replacement (Years)":
      terminalScenarioVehicle.vehicleReplacementLifecycleYears,
    "Vehicle Maintenance (%)":
      terminalScenarioVehicle.vehicleMaintenanceCostPct * 100,
    "Charger Replacement (Years)":
      terminalScenarioVehicle.scenario.chargerReplacementLifecycleYears,
    "Charger Maintenance (%)":
      terminalScenarioVehicle.scenario.chargerMaintenanceCostPct * 100,
    "Battery Replacement (Years)":
      terminalScenarioVehicle.batteryReplacementLifecycleYears,
    "Optimal EV Count": terminalScenarioVehicle.fleetSize,
    "Vehicle Name": terminalScenarioVehicle.evVehicle?.name,
    "Vehicle Make": terminalScenarioVehicle.evVehicle?.make,
    "Vehicle Model": terminalScenarioVehicle.evVehicle?.model,
    "Battery Capacity (kWh)":
      terminalScenarioVehicle.evVehicle?.batteryCapacityKwh,
    "Battery Max Charge Rate (kW)":
      terminalScenarioVehicle.evVehicle?.batteryMaxChargeRateKw,
    "Current Charger Count": terminalScenarioVehicle.scenario.numChargers,
    "Optimal Charger Count": terminalScenarioVehicle.scenario.optNumChargers,
    "Charger Name": terminalScenarioVehicle.scenario.charger?.name,
    "Charger Make": terminalScenarioVehicle.scenario.charger?.make,
    "Charger Model": terminalScenarioVehicle.scenario.charger?.model,
    "Charge Rate (kW)": terminalScenarioVehicle.scenario.charger?.chargeRateKw,
    Voltage: terminalScenarioVehicle.scenario.charger?.voltage,
    Amperage: terminalScenarioVehicle.scenario.charger?.amperage,
    "Planning Horizon Years": financialControls.planningHorizonYears,
    "Fuel Cost Growth Rate (%)": financialControls.fuelCostGrowthRate * 100,
    "Power Purchase Agreement (%)": financialControls.ppaRate * 100,
    "Charger Cost ($ Per Charger)": financialControls.chargerCost,
    "Vehicle Cost ($ Per Vehicle)": financialControls.vehicleCost,
    "Installation Cost ($ Per Charger)": financialControls.installationCost,
    "Total Optimized Capital Expenses ($)":
      financialData.financialInformation.totalCapitalExpenses
        .totalCapitalExpenses,
    "Total Optimized Operational Expense ($)":
      financialData.financialInformation.totalOperationalExpenses
        .totalOperationalExpenses,
    "Max Annual kWh Usage": financialData.maxEnergyDemand.energyUsageKwh,
    "Max Annual Peak Demand (kW)": financialData.maxEnergyDemand.peakDemandKw,
  };

  appendData(Object.keys(configurationDownloadData).join(","));
  appendData(Object.values(configurationDownloadData).join(","));

  downloadFile(csvData, "configuration.csv");
};

const TERMINAL_DOWNLOAD_HEADERS = [
  "Terminal",
  "Cost Center",
  "Configuration Name",
  "Vehicle Type",
  "Utility Rate Structure",
  "ICE Fleet Size",
  "Vehicles Per Shift",
  "Shift Start Hour",
  "Shift End Hour",
  "Optimal EV Count",
  "Vehicle Name",
  "Vehicle Make",
  "Vehicle Model",
  "Vehicle Battery Capacity (kWh)",
  "Vehicle Battery Max Charge Rate (kW)",
  "Current Charger Count",
  "Optimal Charger Count",
  "Charger Name",
  "Charger Make",
  "Charger Model",
  "Charger Charge Rate (kW)",
  "Charger Voltage",
  "Charger Amperage",
  "Planning Start Year",
  "Planning Horizon Years",
  "Fuel Cost Growth Rate (%)",
  "Discount Rate (%)",
  "Investment Strategy",
  "Power Purchase Agreement (%)",
  "Vehicle Price ($ Per Unit)",
  "Charger Price ($ Per Unit)",
  "Installation Cost ($)",
  "Total Optimized Capital Expenses ($)",
  "Total Optimized Operational Expense ($)",
  "Max Annual Usage (kWh)",
  "Max Annual Peak Demand (kW)",
];

export const downloadTerminalScenarios = async (scenarioIds: number[]) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_HOST}:${
        process.env.REACT_APP_API_PORT
      }/terminals/scenarios/download?ids=${scenarioIds.join(",")}`
    );

    if (response.ok) {
      const result: TerminalDownloadData[] = await response.json();
      let csvData = "";
      const appendData = (data: string = "") => {
        csvData += data;
        csvData += "\n";
      };

      appendData(TERMINAL_DOWNLOAD_HEADERS.join(","));

      result.forEach((downloadData) => {
        // Order of these matter
        const data = [
          downloadData.terminalName,
          downloadData.facilityName,
          downloadData.scenarioName,
          downloadData.vehicleType,
          downloadData.utilityRateStructure,
          downloadData.numICEVehicles,
          downloadData.vehiclesPerShift,
          downloadData.shiftSchedule.indexOf(1),
          downloadData.shiftSchedule.lastIndexOf(1) + 1,
          downloadData.optNumEvs,
          downloadData.evVehicle.name,
          downloadData.evVehicle.make,
          downloadData.evVehicle.model,
          downloadData.evVehicle.batteryCapacityKwh,
          downloadData.evVehicle.batteryMaxChargeRateKw,
          downloadData.numChargers,
          downloadData.optNumChargers,
          downloadData.charger.name,
          downloadData.charger.make,
          downloadData.charger.model,
          downloadData.charger.chargeRateKw,
          downloadData.charger.voltage,
          downloadData.charger.amperage,
          downloadData.financial.financialControls.planningStartYear,
          downloadData.financial.financialControls.planningHorizonYears,
          downloadData.financial.financialControls.fuelCostGrowthRate * 100,
          downloadData.financial.financialControls.discountRate * 100,
          downloadData.financial.financialControls.investmentStrategy.toUpperCase(),
          downloadData.financial.financialControls.ppaRate * 100,
          downloadData.financial.financialControls.vehicleCost,
          downloadData.financial.financialControls.chargerCost,
          downloadData.financial.financialControls.installationCost,
          downloadData.financial.totalCapitalExpenses,
          downloadData.financial.totalOperationalExpenses,
          downloadData.financial.maxAnnualKwhUsage,
          downloadData.financial.maxAnnualPeakDemand,
        ];
        appendData(data.join(","));
      });

      downloadFile(csvData, "terminals.csv");
    } else {
      //Handle error response
      throw new Error("Failed to download terminals");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `An error occurred while downloading terminals: ${error.message}`
      );
    } else {
      throw new Error("An unknown error occurred while downloading terminals");
    }
  }
};

const FINANCIAL_HEADERS = [
  "Configuration Name",
  "Optimal EV Count",
  "Optimal Charger Count",
  "Vehicle Price ($ Per Unit)",
  "Charger Price ($ Per Unit)",
  "Installation Cost ($ Per Charger)",
  "Vehicle Capital Expense ($)",
  "Charger Capital Expense ($)",
  "Installation Cost ($)",
  "Total Capital Expense ($)",
  "Charging Cost ($)",
  "Maintenance Costs ($)",
  "Total Annual Operational Expense ($)",
  "Net Present Value (NPV)",
];

const FINANCIAL_TABLE_HEADERS = [
  "Year",
  "Discount Rate (%)",
  "Vehicle Capital Expense (Initial + Replacement + Battery Replacement)",
  "Charger Capital Expense (Initial + Replacement)",
  "Installation Capital Expense",
  "Fuel and Maintenance",
  "TCO",
  "NPV",
];
export const downloadFinancialCSV = (
  terminalScenarioVehicle: TerminalScenarioVehicle,
  financialControls: FinancialControls,
  financialData: FinancialData
) => {
  let csvData = "";
  const appendData = (data: string = "") => {
    csvData += data;
    csvData += "\n";
  };

  appendData(FINANCIAL_HEADERS.join(","));

  const installationCostPerCharger =
    financialData.financialInformation.totalCapitalExpenses
      .installationExpenses / terminalScenarioVehicle.scenario.optNumChargers;
  const data = [
    terminalScenarioVehicle.scenario.name, // Configuration Name
    terminalScenarioVehicle.fleetSize, // Optimal EV Count
    terminalScenarioVehicle.scenario.optNumChargers, // Optimal Charger Count
    formatCost(financialData.financialControls.vehicleCost), // Vehicle Price ($ Per Unit)
    formatCost(financialData.financialControls.chargerCost), // Charger Price ($ Per Unit)
    formatCost(installationCostPerCharger), // Installation Cost ($ Per Charger)
    formatCost(
      financialData.financialInformation.totalCapitalExpenses.vehicleExpenses // Vehicle Capital Expense ($)
    ),
    formatCost(
      financialData.financialInformation.totalCapitalExpenses.chargerExpenses // Charger Capital Expense ($)
    ),
    formatCost(
      financialData.financialInformation.totalCapitalExpenses
        .installationExpenses // Installation Cost ($)
    ),
    formatCost(
      financialData.financialInformation.totalCapitalExpenses
        .totalCapitalExpenses // Total Capital Expense ($)
    ),
    formatCost(
      financialData.financialInformation.totalOperationalExpenses.fuelCosts // Charging Cost ($)
    ),
    formatCost(
      financialData.financialInformation.totalOperationalExpenses
        .maintenanceCosts // Maintenance Costs ($)
    ),
    formatCost(
      financialData.financialInformation.totalOperationalExpenses
        .totalOperationalExpenses // Total Annual Operational Expense ($)
    ),
    formatCost(
      financialData.financialInformation.totalCapitalExpenses
        .totalCapitalExpensesNPV +
        financialData.financialInformation.totalOperationalExpenses
          .totalOperationalExpensesNPV // Net Present Value (NPV)
    ),
  ];

  appendData(data.join(","));
  appendData();

  appendData(FINANCIAL_TABLE_HEADERS.join(","));
  for (let i = 0; i < financialControls.planningHorizonYears; i++) {
    const vehicleCost =
      financialData.capitalExpenses.vehicleExpenses[i].total +
      financialData.capitalExpenses.batteryExpenses[i].total;
    const vehicleCostNPV =
      financialData.capitalExpenses.vehicleExpenses[i].totalNPV +
      financialData.capitalExpenses.batteryExpenses[i].totalNPV;

    const chargerCost = financialData.capitalExpenses.chargerExpenses[i].total;
    const chargerCostNPV =
      financialData.capitalExpenses.chargerExpenses[i].totalNPV;

    const installationCost =
      financialData.capitalExpenses.installationExpenses[i].total;
    const installationCostNPV =
      financialData.capitalExpenses.installationExpenses[i].totalNPV;

    const fuelAndMaintenanceCost =
      financialData.operationalExpenses.fuelCosts[i].costUsd +
      financialData.operationalExpenses.maintenanceCosts[i].costUsd;
    const fuelAndMaintenanceCostNPV =
      financialData.operationalExpenses.fuelCosts[i].costNPV +
      financialData.operationalExpenses.maintenanceCosts[i].costNPV;

    const tcoValue =
      vehicleCost + chargerCost + installationCost + fuelAndMaintenanceCost;
    const npv =
      vehicleCostNPV +
      chargerCostNPV +
      installationCostNPV +
      fuelAndMaintenanceCostNPV;

    const rowData = [
      i + 1, // Year
      financialControls.discountRate * 100 + "%", // Discount Rate (%)
      formatCost(vehicleCost), // Vehicle Capital Expense (Initial + Replacement + Battery Replacement)
      formatCost(chargerCost), // Charger Capital Expense (Initial + Replacement)
      formatCost(installationCost), // Installation Capital Expense
      formatCost(fuelAndMaintenanceCost), // Fuel and Maintenance
      formatCost(tcoValue), // TCO
      formatCost(npv), // NPV
    ];
    appendData(rowData.join(","));
  }
  downloadFile(csvData, "financial.csv");
};
