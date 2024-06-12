import {
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { AssumptionParameters } from "types/terminal-financial";

export type AssumptionsPanelProp = {
  financialAssumptions: AssumptionParameters | undefined;
  baseVehicleEngineType: string;
};
const AssumptionsPanel = ({
  financialAssumptions,
  baseVehicleEngineType,
}: AssumptionsPanelProp) => {
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
          Configuration Assumptions
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <List dense>
            <ListItem disableGutters>
              <ListItemText
                primary="Working Days Per Year"
                secondary={`${financialAssumptions?.workingDaysPerYear ?? 0}`}
              />
            </ListItem>
            {/* <Divider sx={{ marginBottom: 2 }} /> */}
            <ListItem disableGutters>
              <ListItemText
                primary={`${baseVehicleEngineType} Vehicle Replacement Lifecycle (Years)`}
                secondary={`${
                  financialAssumptions?.iceReplacementLifecycleYears ?? 0
                }`}
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={6}>
          <List dense>
            <ListSubheader sx={{ fontWeight: "bold" }} disableGutters>
              Operational Expenses
            </ListSubheader>
            <ListItem disableGutters>
              <ListItemText
                primary="Annual Insurance Cost Per Vehicle"
                secondary={`$${
                  financialAssumptions?.insurancePerVehiclePerYear ?? 0
                }`}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssumptionsPanel;
