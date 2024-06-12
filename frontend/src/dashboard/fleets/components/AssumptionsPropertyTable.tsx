import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { FleetElectrificationScenario } from "types/fleet-electrification-scenario";

export type AssumptionsPropertyTableProps = {
  scenario?: FleetElectrificationScenario;
};

export default function AssumptionsPropertyTable({
  scenario,
}: AssumptionsPropertyTableProps) {
  const equipmentLifecycleStr =
    scenario !== undefined ? `${scenario?.equipmentLifecycleYears} years` : "";
  const evEquivalentEnergyConsumptionStr =
    scenario !== undefined
      ? `${scenario?.evEquivalentEnergyConsumptionPerMile} kWh per mile`
      : "";
  return (
    <Stack spacing={2}>
      <Typography variant="controlTitle" sx={{ fontWeight: "bold" }}>
        Assumptions
      </Typography>
      <List>
        <ListItem disableGutters>
          <ListItemText
            primary="Equipment Lifecycle"
            secondary={equipmentLifecycleStr}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="EV Equivalent Energy Consumption"
            secondary={evEquivalentEnergyConsumptionStr}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText primary="Diesel Cost" secondary={"$5.81 per gallon"} />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText primary="Mileage Rate" secondary={"$2.90 per mile"} />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Workdays"
            secondary={"300 workdays per year"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Maintenance Downtime Days for Diesel Vehicles"
            secondary={"78 workdays per year"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Maintenance Downtime Days for Electric Vehicles"
            secondary={"24 workdays per year"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Driver Downtime Compensation"
            secondary={"$150 per driver per day"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Maintenance Cost for Diesel Vehicles"
            secondary={"$0.44 per mile"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Maintenance Cost for Electric Vehicles"
            secondary={"$0.23 per mile for EVs"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Driver Salary"
            secondary={"$80,000 per driver per year"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Vehicle Insurance"
            secondary={"$20,000 per vehicle per year"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText primary="Retail Tax Rate" secondary={"7% per year"} />
        </ListItem>
      </List>
    </Stack>
  );
}
