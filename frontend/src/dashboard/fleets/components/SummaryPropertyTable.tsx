import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { FleetElectrificationScenario } from "types/fleet-electrification-scenario";

export type SummaryPropertyTableProps = {
  scenario?: FleetElectrificationScenario;
};

export default function SummaryPropertyTable({
  scenario,
}: SummaryPropertyTableProps) {
  const annualMilesDrivenStr =
    scenario !== undefined ? `${scenario?.annualMilesDriven} miles` : "";
  const dailyMilesDriveStr =
    scenario !== undefined ? `${scenario?.dailyMilesDriven} miles` : "";

  return (
    <Stack spacing={2}>
      <Typography variant="controlTitle" sx={{ fontWeight: "bold" }}>
        Summary
      </Typography>
      <List>
        <ListItem disableGutters>
          <ListItemText
            primary="Annual Miles Driven"
            secondary={annualMilesDrivenStr}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Daily Miles Driven"
            secondary={dailyMilesDriveStr}
          />
        </ListItem>
      </List>
    </Stack>
  );
}
