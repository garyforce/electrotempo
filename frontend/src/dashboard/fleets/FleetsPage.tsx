import {
  Autocomplete,
  Stack,
  Grid,
  Typography,
  Box,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip,
  IconButton,
  TextField,
} from "@mui/material";
import { AddBox } from "@mui/icons-material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FleetOverview from "./components/FleetOverview";
import TotalCostOfOwnership from "./components/TotalCostOfOwnership";
import { useState } from "react";
import { AdvancedDialog, BasicDialog } from "./components/wizard/Dialog";
import { Section } from "../../components/Section";
import { PowerProfileChart } from "./components/charts/PowerProfileChart";

import {
  fullElectric,
  dieselOnly,
  users,
  hybridScenario,
  hybridScenarioModified,
  fullElectricEvOnly,
  fullElectricEvseOnly,
} from "./demo-data";
import { FleetElectrificationScenario } from "types/fleet-electrification-scenario";
import AssumptionsPropertyTable from "./components/AssumptionsPropertyTable";

function FleetsPage() {
  const [showBasicDialog, setShowBasicDialog] = useState(false);
  const [dialogRenderKey, setDialogRenderKey] = useState(0); // used to force rerender of dialog
  const openBasicDialog = () => setShowBasicDialog(true);
  const closeBasicDialog = () => setShowBasicDialog(false);
  const [showAdvancedDialog, setShowAdvancedDialog] = useState(false);
  const closeAdvancedDialog = () => setShowAdvancedDialog(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [numTimesGoneThroughDialog, setNumTimesGoneThroughDialog] =
    useState<number>(0);
  const [adminMode, setAdminMode] = useState(false);
  const [selectedUserName, setSelectedUser] = useState("");

  const [selectedScenarioId, setSelectedScenarioId] = useState<number | "">("");

  let scenarios: FleetElectrificationScenario[] = [];
  if (selectedUserName !== "" || adminMode) {
    const selectedUser = users.find((u) => u.name === selectedUserName);
    scenarios = selectedUser?.scenarios || [];
  } else {
    const demoScenarios = [
      dieselOnly,
      fullElectric,
      hybridScenario,
      hybridScenarioModified,
      fullElectricEvOnly,
      fullElectricEvseOnly,
    ];
    const numScenariosToAdd =
      Math.min(numTimesGoneThroughDialog, demoScenarios.length) + 1;
    scenarios = demoScenarios.slice(0, numScenariosToAdd);
  }
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  const toggleAdminMode = () => {
    setAdminMode(!adminMode);
    setSelectedUser("");
  };

  const handleNewScenarioSubmit = () => {
    setShowBasicDialog(false);
    setSnackbarMessage("New scenario created");
    setShowSnackbar(true);
    setNumTimesGoneThroughDialog(numTimesGoneThroughDialog + 1);
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "scroll",
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          width: "100%",
          padding: "16px 0px 16px 16px",
          boxSizing: "border-box",
        }}
      >
        <Grid item xs={12}>
          <Stack
            direction={"row"}
            spacing={2}
            alignItems={"center"}
            flexWrap={"wrap"}
            sx={{ width: "100%" }}
          >
            <Typography variant="h1" fontWeight={"bold"}>
              Fleet Electrification Explorer
            </Typography>
            <Stack
              direction={"row"}
              spacing={2}
              flexWrap={"wrap"}
              alignItems="center"
            >
              {adminMode && (
                <Autocomplete
                  value={selectedUserName}
                  onChange={(e, newValue) =>
                    setSelectedUser(newValue as string)
                  }
                  options={users.map((user) => user.name)}
                  sx={{ width: 250 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select a User" />
                  )}
                />
              )}
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel id="scenario-select-label">
                  Select Scenario
                </InputLabel>
                <Select
                  labelId="scenario-select-label"
                  value={selectedScenarioId}
                  onChange={(e) =>
                    setSelectedScenarioId(e.target.value as number)
                  }
                  label="Select Scenario"
                >
                  <MenuItem value={""}>None</MenuItem>
                  {scenarios.map((scenario) => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ width: 40, height: 40 }}>
                <Tooltip title="Add a new scenario">
                  <IconButton
                    onClick={() => {
                      setDialogRenderKey(dialogRenderKey + 1);
                      openBasicDialog();
                    }}
                  >
                    <AddBox fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
            <Box sx={{ width: 40, height: 40, marginLeft: "auto" }}>
              <Tooltip title="Enable admin mode">
                <IconButton
                  onClick={toggleAdminMode}
                  sx={{ color: adminMode ? "primary.main" : undefined }}
                >
                  <AdminPanelSettingsIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Section>
            <FleetOverview
              vehiclePurchaseSuggestions={
                selectedScenario?.vehiclePurchaseSuggestions
              }
              chargerPurchaseSuggestions={
                selectedScenario?.chargerPurchaseSuggestions
              }
            />
          </Section>
        </Grid>
        <Grid item container spacing={2} xs={12} lg={5}>
          <Grid item xs={12}>
            <Section>
              <TotalCostOfOwnership
                scenario={selectedScenario}
                referenceScenarios={scenarios}
              />
            </Section>
          </Grid>
          <Grid item xs={12}>
            <Section>
              <PowerProfileChart scenario={selectedScenario} />
            </Section>
          </Grid>
          <Grid item xs={12}>
            <Section>
              <AssumptionsPropertyTable scenario={selectedScenario} />
            </Section>
          </Grid>
        </Grid>
      </Grid>
      <BasicDialog
        DialogProps={{ open: showBasicDialog, onClose: closeBasicDialog }}
        onSubmit={handleNewScenarioSubmit}
        key={dialogRenderKey}
      />
      <AdvancedDialog
        DialogProps={{ open: showAdvancedDialog, onClose: closeAdvancedDialog }}
      />
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}

export default FleetsPage;
