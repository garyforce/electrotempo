import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  TextField,
  Tooltip,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/store";

import {
  setPlanningHorizonYears,
  setChargerCost,
  setVehicleCost,
  setInstallationCost,
  setUtilityRateId,
} from "redux/features/terminal/financialSlice";
import { downloadConfigurationCSV, downloadFinancialCSV } from "./download";
import { Terminal, TerminalScenario } from "../../types/terminal";
import { useTerminalScenarioVehicle } from "api/terminal/scenario-vehicle";
import AddScenarioDialog from "./components/AddScenarioDialog";
import DownloadAlert from "./DownloadAlert";
import Energy from "./pages/energy/Energy";
import Equipment from "./pages/equipment/Equipment";
import FinancialPage from "./pages/financial/Financial";
import Parameters from "./pages/parameters/Parameters";
import StickyBottomBox from "dashboard/controls/StickyBottomBox";
import { useFinancialData } from "api/terminal/financial";
import { useUtilityRates } from "api/terminal/utility-rates";
import { usePermissions } from "dashboard/PermissionContext";

export const UTILITY_RATE_STRUCTURE = "Dominion Energy Standard";

type TerminalPageProp = {
  scenarios: TerminalScenario[];
  terminals?: Terminal[];
  selectedScenario: TerminalScenario;
  setSelectedScenario: (
    value: React.SetStateAction<TerminalScenario | undefined>
  ) => void;
  refetchData: () => void;
  isTutorial: Boolean;
  tutorialStep: number;
  setIsOpen: (visible: Boolean) => void;
  goBack: () => void;
};
const TerminalPage = ({
  scenarios,
  terminals,
  selectedScenario,
  setSelectedScenario,
  refetchData,
  isTutorial,
  tutorialStep,
  setIsOpen,
  goBack,
}: TerminalPageProp) => {
  const {
    id: scenarioId,
    propertyId: terminalId,
    facilityId,
  } = selectedScenario;
  const scenarioVehicleId = selectedScenario.scenarioVehicles[0].id;
  const organizationId = selectedScenario.property.organizationId;

  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState("parameters");
  const [openAlert, setOpenAlert] = useState<boolean>(false);

  const { terminalScenarioVehicle } = useTerminalScenarioVehicle(
    terminalId,
    facilityId,
    scenarioId,
    scenarioVehicleId
  );

  const financialControls = useAppSelector((store) => store.financial);
  const { financialData } = useFinancialData({
    terminalId,
    facilityId,
    scenarioId,
    scenarioVehicleId,
    financialControls,
  });
  const { utilityRates } = useUtilityRates(organizationId);

  const permissions = usePermissions();
  const canCreateConfigurations = useMemo(() => {
    return permissions.includes("write:terminal_configurations");
  }, [permissions]);

  const baseVehicleEngineType = useMemo(() => {
    return terminalScenarioVehicle?.iceVehicle?.engineType === "HYBRID"
      ? "Hybrid"
      : "ICE";
  }, [terminalScenarioVehicle]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUtilityRateId(selectedScenario.utilityRateId));
  }, [selectedScenario, dispatch]);

  useEffect(() => {
    if (isTutorial) {
      switch (tutorialStep) {
        // step 12: parameters tab
        // step 14: financial tab
        // step 17: equipment tab
        // step 18: energy tab
        case 12:
          setCurrentTab("parameters");
          break;
        case 13:
          setCurrentTab("parameters");
          break;
        case 14:
          setCurrentTab("financial");
          break;
        case 15:
          setCurrentTab("financial");
          break;
        case 16:
          setCurrentTab("financial");
          break;
        case 17:
          setCurrentTab("equipment");
          break;
        case 18:
          setCurrentTab("energy");
          break;
        default:
          break;
      }
    }
  }, [tutorialStep, isTutorial]);

  useEffect(() => {
    if (terminalScenarioVehicle) {
      dispatch(
        setPlanningHorizonYears(
          terminalScenarioVehicle.scenario.planningHorizonYears
        )
      );
      dispatch(
        setChargerCost(
          Number(terminalScenarioVehicle.scenario.chargerCost ?? 0)
        )
      );
      dispatch(
        setVehicleCost(Number(terminalScenarioVehicle.vehicleCost ?? 0))
      );
      dispatch(
        setInstallationCost(terminalScenarioVehicle.scenario.installationCost)
      );
    }
  }, [terminalScenarioVehicle, dispatch]);

  const handleConfigurationChange = (scenarioId: number) => {
    const scenario = scenarios.filter(
      (scenario) => scenario.id === scenarioId
    )[0];
    setSelectedScenario(scenario);
  };

  const handleUtilityRateChange = (utilityRateId: number) => {
    dispatch(setUtilityRateId(utilityRateId));
  };

  const handleTabChange = (
    event: React.SyntheticEvent<Element, Event>,
    newTab: string
  ) => {
    setCurrentTab(newTab);
  };

  const handleDownloadConfigurationCSV = useCallback(() => {
    if (terminalScenarioVehicle && financialData) {
      downloadConfigurationCSV(
        terminalScenarioVehicle,
        financialControls,
        financialData
      );
    }
  }, [terminalScenarioVehicle, financialControls, financialData]);

  const handleDownloadFinancialCSV = useCallback(() => {
    if (terminalScenarioVehicle && financialData) {
      downloadFinancialCSV(
        terminalScenarioVehicle,
        financialControls,
        financialData
      );
    }
  }, [terminalScenarioVehicle, financialControls, financialData]);

  return (
    <Stack direction={"row"} sx={{ height: "100%" }} className="terminal-page">
      <Stack
        sx={{
          width: "462px",
          height: "100%",
          border: "0.5px solid silver",
        }}
        divider={
          <Divider
            orientation="horizontal"
            flexItem
            sx={{ marginRight: "30px", marginLeft: "30px" }}
          />
        }
      >
        <Box sx={{ margin: "30px", marginBottom: 2 }}>
          <Button variant="outlined" onClick={goBack}>
            Back
          </Button>
        </Box>
        <Stack
          spacing={2}
          sx={{ padding: "30px", overflowY: "auto", height: "100%" }}
        >
          <Box>
            <Stack direction={"column"} alignItems={"center"} spacing={2}>
              <FormControl sx={{ width: "100%", height: "100%" }}>
                <TextField
                  id="outlined-read-only-input"
                  label="Terminal"
                  value={terminalScenarioVehicle?.scenario.property.name ?? ""}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <TextField
                  id="outlined-read-only-input"
                  label="Facility / Cost Center"
                  value={terminalScenarioVehicle?.scenario.facility.name ?? ""}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <InputLabel>Configuration</InputLabel>
                <Select
                  value={scenarioId}
                  label="Configuration"
                  onChange={(e) =>
                    handleConfigurationChange(Number(e.target.value))
                  }
                  disabled={!scenarios?.length}
                >
                  {scenarios?.map((scenario) => (
                    <MenuItem
                      key={scenario.id}
                      value={scenario.id}
                      disabled={!scenario.active}
                    >
                      {scenario.name}
                      {!scenario.active && scenario.status
                        ? ` (${scenario.status.status.toLowerCase()})`
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <TextField
                  id="outlined-read-only-input"
                  label="Vehicle Type"
                  value={terminalScenarioVehicle?.vehicleType.name ?? ""}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <InputLabel>Utility Rate Structure</InputLabel>
                <Select
                  value={financialControls.utilityRateId}
                  label="Utility Rate Structure"
                  onChange={(e) =>
                    handleUtilityRateChange(Number(e.target.value))
                  }
                  disabled={!utilityRates?.length}
                >
                  {utilityRates?.map((utilityRate) => (
                    <MenuItem key={utilityRate.id} value={utilityRate.id}>
                      {utilityRate.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </Stack>
        <StickyBottomBox>
          <Tooltip
            placement="top"
            title={
              !canCreateConfigurations
                ? "This action is disabled for this trial account"
                : ""
            }
          >
            <span>
              <Button
                variant="contained"
                onClick={() => setOpenAddDialog(true)}
                disabled={!canCreateConfigurations}
                fullWidth
              >
                Create new Configuration
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            onClick={
              currentTab === "financial"
                ? handleDownloadFinancialCSV
                : handleDownloadConfigurationCSV
            }
            className="download-button"
            disabled={!terminalScenarioVehicle || !financialData}
          >
            {currentTab === "financial"
              ? "Download financial data"
              : "Download configuration data"}
          </Button>
        </StickyBottomBox>
      </Stack>
      <Stack
        direction={"column"}
        sx={{ flex: 1, position: "relative", overflowY: "scroll" }}
      >
        <TabContext value={currentTab}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <TabList onChange={handleTabChange} variant={"fullWidth"}>
              <Tab
                label={"Parameters"}
                value={"parameters"}
                className="parameters-tab"
              />
              <Tab
                label={"Financial"}
                value={"financial"}
                className="financial-tab"
              />
              <Tab
                label={"Equipment"}
                value={"equipment"}
                className="equipment-tab"
              />
              <Tab label={"Energy"} value={"energy"} className="energy-tab" />
            </TabList>
          </Box>
          <TabPanel value={"parameters"} className="chart-tab-panel">
            <Parameters
              terminalScenarioVehicle={terminalScenarioVehicle}
              financialAssumptions={financialData?.assumptionParameters}
              baseVehicleEngineType={baseVehicleEngineType}
            />
          </TabPanel>
          <TabPanel value={"financial"} className="chart-tab-panel">
            <FinancialPage
              selectedScenario={selectedScenario}
              financialData={financialData}
              baseVehicleEngineType={baseVehicleEngineType}
            />
          </TabPanel>
          <TabPanel value={"equipment"} className="chart-tab-panel">
            <Equipment
              vehicle={terminalScenarioVehicle?.evVehicle ?? undefined}
              scenario={terminalScenarioVehicle?.scenario}
              vehiclesPerShift={terminalScenarioVehicle?.vehiclesPerShift}
              fleetSize={terminalScenarioVehicle?.fleetSize}
              numICEVehicles={terminalScenarioVehicle?.numICEVehicles}
              evReserve={terminalScenarioVehicle?.evReserve}
              baseVehicleEngineType={baseVehicleEngineType}
            />
          </TabPanel>
          <TabPanel value={"energy"} className="chart-tab-panel">
            <Energy
              energyDemandDatapoints={
                terminalScenarioVehicle?.energyDemandDatapoints ?? []
              }
              vehicleStatusDatapoints={
                terminalScenarioVehicle?.vehicleStatusDatapoints ?? []
              }
            />
          </TabPanel>
        </TabContext>
      </Stack>
      <DownloadAlert openAlert={openAlert} setOpenAlert={setOpenAlert} />
      {openAddDialog && (
        <AddScenarioDialog
          DialogProps={{
            open: openAddDialog,
            onClose: () => setOpenAddDialog(false),
          }}
          selectedTerminal={{
            id: terminalId,
            name: selectedScenario.property.name,
          }}
          selectedFacility={{
            id: facilityId,
            name: selectedScenario.facility.name,
          }}
          terminals={terminals}
          refetchData={refetchData}
        />
      )}
    </Stack>
  );
};

export default TerminalPage;
