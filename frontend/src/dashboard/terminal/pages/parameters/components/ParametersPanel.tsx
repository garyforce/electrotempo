import {
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  ListSubheader,
} from "@mui/material";
import { Box } from "@mui/system";
import { TerminalScenarioVehicle } from "types/terminal-scenario-vehicle";
import { AssumptionParameters } from "types/terminal-financial";

export type ParametersPanelProp = {
  terminalScenarioVehicle: TerminalScenarioVehicle | null;
  baseVehicleEngineType: string;
  financialAssumptions: AssumptionParameters | undefined;
};
const ParametersPanel = ({
  terminalScenarioVehicle,
  baseVehicleEngineType,
  financialAssumptions,
}: ParametersPanelProp) => {
  return (
    <Box
      sx={{
        border: 0.5,
        borderColor: "silver",
        padding: "16px",
        borderRadius: 5,
        marginBottom: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
          Configuration Parameters
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <List dense>
            <ListItem disableGutters>
              <ListItemText
                primary={`${baseVehicleEngineType} Fuel Consumption (Gallons-Per-Hour)`}
                secondary={terminalScenarioVehicle?.iceFuelConsumption ?? ""}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary={`${baseVehicleEngineType} Fuel Cost Per Gallon`}
                secondary={
                  terminalScenarioVehicle?.scenario.iceFuelCostPerGallon ?? ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="Vehicle Maintenance Cost (%)"
                secondary={
                  terminalScenarioVehicle
                    ? terminalScenarioVehicle?.vehicleMaintenanceCostPct * 100
                    : ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="Charger Maintenance Cost (%)"
                secondary={
                  terminalScenarioVehicle
                    ? terminalScenarioVehicle?.scenario
                        .chargerMaintenanceCostPct * 100
                    : ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="EV Downtime (%)"
                secondary={
                  terminalScenarioVehicle
                    ? terminalScenarioVehicle?.evDowntimePct * 100
                    : ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary={`${baseVehicleEngineType} Downtime (%)`}
                secondary={
                  terminalScenarioVehicle
                    ? terminalScenarioVehicle?.iceDowntimePct * 100
                    : ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListSubheader sx={{ fontWeight: "bold" }} disableGutters>
              Utility Rate Structure
            </ListSubheader>
            <ListItem disableGutters>
              <ListItemText
                primary="Peak Demand Charge Price Per kW"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .peakDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />

            <ListItem disableGutters>
              <ListItemText
                primary="Distribution Demand Charge Price Per kW"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .distributionDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />

            <ListItem disableGutters>
              <ListItemText
                primary="Generation Usage Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .generationChargePricePerKwh ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="Transmission Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .transmissionChargePricePerKwh ?? 0
                }`}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="Distribution Charge Price Per kW"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .distributionChargePricePerKwh ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="Generation Demand Charge Price Per kW"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .generationDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />

            <ListItem disableGutters>
              <ListItemText
                primary="Transmission Demand Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .transmissionDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={6}>
          <List dense>
            <ListItem disableGutters>
              <ListItemText
                primary="Vehicle Replacement Lifecycle (Years)"
                secondary={
                  terminalScenarioVehicle?.vehicleReplacementLifecycleYears ??
                  ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="Battery Replacement Lifecycle (Years)"
                secondary={
                  terminalScenarioVehicle?.batteryReplacementLifecycleYears ??
                  ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="Charger Replacement Lifecycle (Years)"
                secondary={
                  terminalScenarioVehicle?.scenario
                    .chargerReplacementLifecycleYears ?? ""
                }
              />
            </ListItem>
            <Divider component="li" />
            <ListSubheader sx={{ fontWeight: "bold" }} disableGutters>
              PPA Rate Structure
            </ListSubheader>
            <ListItem disableGutters>
              <ListItemText
                primary="PPA Peak Demand Charge Price Per kW"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .ppaPeakDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="PPA Generation Usage Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .ppaGenerationChargePricePerKwh ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="PPA Distribution Charge Price Per kW"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .ppaDistributionChargePricePerKwh ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="PPA Distribution Demand Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .ppaDistributionDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="PPA Generation Demand Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .ppaGenerationDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="PPA Transmission Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .ppaTransmissionChargePricePerKwh ?? 0
                }`}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem disableGutters>
              <ListItemText
                primary="PPA Transmission Demand Charge Price Per kWh"
                secondary={`$${
                  financialAssumptions?.utilityRateStructure
                    .ppaTransmissionDemandChargePricePerKw ?? 0
                }`}
              />
            </ListItem>{" "}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParametersPanel;
