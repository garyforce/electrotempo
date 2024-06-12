import { RadioButtonChecked, RadioButtonUnchecked } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ScenarioYearlyParam, SegmentData } from "types/hub-scenario-data";
import { downloadScenarioData } from "../utils/downloadScenario";
import { EvGrowthScenario } from "types/hub-site";
import { getDownloadData } from "api/hub/downloadData";
import { HubScenarioControls } from "types/hub-scenario-parameters";
import { range } from "utils/array";
import { setDisabledState } from "redux/features/Header/locationSlice";
import { updateHubScenario } from "api/hub/update-scenario";
import { useAppDispatch } from "redux/store";
import { useDebouncedEffect } from "dashboard/useDebouncedEffect";
import { useFleetsDownloadData } from "api/hub/fleetData";
import AdvancedSettingsDialog from "./components/AdvancedSettingsDialog";
import Arrivals from "./arrivals/Arrivals";
import ChargerChoices, {
  VehicleChargerValues,
} from "./components/ChargerChoices";
import ChargersHub from "./chargers/ChargersHub";
import EnergyHub from "./energy/EnergyHub";
import FinancialHub from "./financial/FinancialHub";
import OptimalConfirmDialog from "./components/OptimalConfirmDialog";
import ParametersHub from "./parameters/ParametersHub";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SiteSpecificSlider from "./components/SiteSpecificSlider";
import StickyBottomBox from "dashboard/controls/StickyBottomBox";
import UploadDialog from "./components/UploadDialog";
import useChargers from "api/hub/chargers";
import useScenarioParameters from "api/hub/scenario-parameters";
import useSiteScenarioData from "api/hub/site-scenario-data";
import useSiteUtilityRates from "api/hub/site-utility-rates";
import UtilitySelectBox from "./components/UtilitySelectBox";
import YearControl from "dashboard/controls/YearControl";

export const TRUCK_VEHICLE_TYPE_ID = 2;
export const TRAILER_VEHICLE_TYPE_ID = 3;

const AVERAGE_ANNUAL_MAINTENANCE_COST_PER_CHARGER = 400;

const currentYear = new Date().getFullYear();

type HubTerminalPageProps = {
  siteId: number;
  evGrowthScenarioId: number;
  evGrowthScenarios: EvGrowthScenario[];
  backToLandingPage: () => void;
  handleSiteListScenariosChange: (siteId: number, scenarioId: number) => void;
  tutorialStep?: number;
  isTutorial: Boolean;
  setIsOpen: (visible: Boolean) => void;
};
const HubScenarioPage: React.FC<HubTerminalPageProps> = ({
  siteId,
  evGrowthScenarioId,
  evGrowthScenarios,
  backToLandingPage,
  handleSiteListScenariosChange,
  tutorialStep,
  isTutorial,
  setIsOpen,
}: HubTerminalPageProps) => {
  const [selectedEvGrowthScenarioId, setSelectedEvGrowthScenarioId] =
    useState<number>(evGrowthScenarioId);
  const [optimalStatus, setOptimalStatus] = useState<boolean>(true);
  const [annualAveragePerCharger, setAnnualAveragePerCharger] =
    useState<number>(AVERAGE_ANNUAL_MAINTENANCE_COST_PER_CHARGER);
  const [yearlyModal, setYearlyModal] = useState(false);
  const [optimalDialogOpen, setOptimalDialogOpen] = useState<boolean>(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  const [transitionState, setTransitionState] = useState(isTutorial ? 1 : 0);
  const [currentTab, setCurrentTab] = useState(
    tutorialStep === 17 ? "chargers" : "arrivals"
  );

  const [scenarioId, setScenarioId] = useState<number | undefined>();
  const [scenarioControls, setScenarioControls] = useState<HubScenarioControls>(
    {
      year: currentYear,
      trucksParkingPct: 0.5,
      trailersParkingPct: 0.5,
      publicChargerPct: 1,
      parkingArea: 15000,
      utilityRateId: null,
      truckChargerId: null,
      truckChargerCost: 0,
      trailerChargerId: null,
      trailerChargerCost: 0,
    }
  );

  const { scenarioParameters } = useScenarioParameters(
    siteId,
    selectedEvGrowthScenarioId
  );
  const { utilityRates } = useSiteUtilityRates(siteId);
  const { chargers } = useChargers();
  const { siteScenarioData, refetch } = useSiteScenarioData(
    siteId,
    scenarioId,
    optimalStatus,
    annualAveragePerCharger
  );
  const { fleetsData, refetch: refetchFleetsData } =
    useFleetsDownloadData(siteId);

  const {
    aggregateData,
    truckData,
    trailerData,
    truckYearlyParams,
    trailerYearlyParams,
  } = useMemo(() => {
    return {
      aggregateData: siteScenarioData?.scenario.calculated_data.aggregate_data,
      truckData: siteScenarioData?.scenario.calculated_data.segment_data.find(
        (data: SegmentData) => data.vehicle_type_id === TRUCK_VEHICLE_TYPE_ID
      ),
      trailerData: siteScenarioData?.scenario.calculated_data.segment_data.find(
        (data: SegmentData) => data.vehicle_type_id === TRAILER_VEHICLE_TYPE_ID
      ),
      truckYearlyParams:
        siteScenarioData?.scenario.yearly_params.filter(
          (param: ScenarioYearlyParam) =>
            param.vehicle_type_id === TRUCK_VEHICLE_TYPE_ID
        ) ?? [],
      trailerYearlyParams:
        siteScenarioData?.scenario.yearly_params.filter(
          (param: ScenarioYearlyParam) =>
            param.vehicle_type_id === TRAILER_VEHICLE_TYPE_ID
        ) ?? [],
    };
  }, [siteScenarioData]);

  useEffect(() => {
    if (scenarioParameters) {
      setScenarioId(scenarioParameters.id);
      setScenarioControls({
        year: scenarioParameters.year,
        trucksParkingPct: scenarioParameters.trucksParkingPct,
        trailersParkingPct: scenarioParameters.trailersParkingPct,
        publicChargerPct: scenarioParameters.publicChargerPct,
        parkingArea: scenarioParameters.parkingArea,
        utilityRateId: scenarioParameters.utilityRateId,
        truckChargerId: scenarioParameters.truckChargerId,
        truckChargerCost: scenarioParameters.truckChargerCost,
        trailerChargerId: scenarioParameters.trailerChargerId,
        trailerChargerCost: scenarioParameters.trailerChargerCost,
      });
    }
  }, [scenarioParameters]);

  useEffect(() => {
    if (isTutorial) {
      switch (tutorialStep) {
        case 14:
          setCurrentTab("arrivals");
          break;
        case 15:
          setCurrentTab("energy");
          break;
        case 16:
        case 17:
          setCurrentTab("chargers");
          break;
        case 18:
          setCurrentTab("financial");
          break;
        default:
          break;
      }
    }
  }, [tutorialStep, isTutorial]);

  useEffect(() => {
    if (tutorialStep === 17 && currentTab === "chargers") {
      if (isTutorial && transitionState === 1) {
        setIsOpen(false);
        setTransitionState(2);
      } else if (transitionState === 2) {
        setIsOpen(true);
        setTransitionState(0);
      }
    }
    if (tutorialStep !== 17) {
      setTransitionState(1);
    }
  }, [tutorialStep, transitionState, currentTab, isTutorial, setIsOpen]);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setDisabledState(true));
    return () => {
      dispatch(setDisabledState(false));
    };
  }, []);

  useDebouncedEffect(
    () => {
      saveScenario();
    },
    [scenarioControls],
    500
  );

  const saveScenario = () => {
    if (scenarioId) {
      const data = { ...scenarioControls };
      data.trailersParkingPct = 1 - data.trucksParkingPct;

      updateHubScenario(siteId, scenarioId, scenarioControls)
        .then((response) => {
          setSnackbarMessage("success:Scenario data successfully updated.");
          refetch();
        })
        .catch((err) => {
          setSnackbarMessage("error:Scenario data failed to update.");
        });
    }
  };

  const onClickOptimal = () => {
    optimalStatus ? setOptimalDialogOpen(true) : setOptimalStatus(true);
    !optimalStatus &&
      setScenarioControls({
        ...scenarioControls,
        trucksParkingPct: 50 / 100,
      });
  };

  const handleDownloadData = useCallback(async () => {
    if (scenarioId) {
      const data = await getDownloadData(siteId, scenarioId, optimalStatus);
      if (data.downloadData) {
        downloadScenarioData(data.downloadData);
      } else {
        alert(data.error?.message);
      }
    }
  }, [siteId, scenarioId, optimalStatus]);

  return (
    <Stack
      direction="row"
      sx={{ height: "100%" }}
      className={"hub-scenario-page"}
    >
      <Stack
        sx={{ width: "512px", height: "100%", border: "0.5px solid silver" }}
        className={"scenario-left-pane"}
      >
        <Stack
          divider={<Divider orientation="horizontal" flexItem />}
          spacing={2}
          sx={{ padding: "30px", overflowY: "auto" }}
        >
          <Box>
            <Button variant="outlined" onClick={() => backToLandingPage()}>
              Back
            </Button>
          </Box>

          <Box sx={{ width: "100%" }} className={"scenario-parameters-box"}>
            <Typography variant="h3" sx={{ marginBottom: 3 }}>
              Site Parameters
            </Typography>
            <Stack spacing={2}>
              <TextField
                value={scenarioParameters?.siteName}
                label="Site Name"
                InputProps={{ readOnly: true }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <InputLabel>Scenario Name</InputLabel>
                  <Select
                    value={selectedEvGrowthScenarioId}
                    label="Scenario Name"
                    onChange={(e) => {
                      const evGrowthScenarioId = Number(e.target.value);
                      setSelectedEvGrowthScenarioId(evGrowthScenarioId);
                      handleSiteListScenariosChange(siteId, evGrowthScenarioId);
                    }}
                  >
                    {evGrowthScenarios.map((scenario, index) => {
                      return (
                        <MenuItem key={index} value={scenario.id}>
                          {scenario.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ width: "100%" }} className={"site-parameters-box"}>
            <Typography variant="h3" sx={{ marginBottom: 2 }}>
              EV Adoption Scenario Parameters
            </Typography>
            <Box>
              <Typography>
                Straight Trucks are FHWA class 4, 5, 6, 7 vehicles
              </Typography>
              <Typography sx={{ marginBottom: 2 }}>
                Tractor-Trailers are FHWA class 8 vehicles
              </Typography>
            </Box>
            <Stack spacing={1} sx={{ marginBottom: 3 }}>
              <Typography variant="body2">Year</Typography>
              <YearControl
                value={scenarioControls.year}
                increment={2}
                years={range(
                  new Date().getFullYear(),
                  new Date().getFullYear() + 13
                )}
                onChange={(e) =>
                  setScenarioControls({
                    ...scenarioControls,
                    year: Number((e.target as HTMLInputElement).value),
                  })
                }
              />
            </Stack>

            <Box sx={{ marginTop: 2, marginBottom: 3 }}>
              <Link
                component="button"
                variant="inherit"
                sx={{ fontWeight: 500 }}
                onClick={() => setYearlyModal(!yearlyModal)}
                className={"advanced-setting-link"}
              >
                Advanced Settings
              </Link>
            </Box>

            <Stack spacing={3} sx={{ marginTop: 2 }}>
              <Stack sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <SiteSpecificSlider
                  max={100}
                  min={0}
                  step={10}
                  defaultValue={scenarioControls.trucksParkingPct * 100}
                  InputLabels={{
                    left: "Straight Truck",
                    right: "Tractor-Trailer",
                  }}
                  onChange={(value: number[]) =>
                    setScenarioControls({
                      ...scenarioControls,
                      trucksParkingPct: value[0] / 100,
                    })
                  }
                  disabled={optimalStatus}
                />
                <Stack sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle2">Optimal Mix</Typography>
                  <Checkbox
                    checked={optimalStatus}
                    onClick={onClickOptimal}
                    icon={<RadioButtonUnchecked />}
                    checkedIcon={<RadioButtonChecked />}
                  />
                </Stack>
              </Stack>
              <Stack spacing={1}>
                <SiteSpecificSlider
                  max={100}
                  min={0}
                  step={10}
                  InputLabels={{ left: "Public Access", right: "Private" }}
                  defaultValue={scenarioControls.publicChargerPct * 100}
                  onChange={(value: number[]) =>
                    setScenarioControls({
                      ...scenarioControls,
                      publicChargerPct: value[0] / 100,
                    })
                  }
                  disabled={Object.keys(fleetsData).length > 0}
                />
              </Stack>
            </Stack>

            <Stack
              spacing={3}
              sx={{ marginTop: 4 }}
              className={"utility-parameters-box"}
            >
              <Stack spacing={2}>
                <Tooltip
                  title={
                    "'Usable' refers to the space in a site that is available for charger installation. " +
                    "This metric should not be lower than 1000 sq. ft."
                  }
                  placement="right"
                >
                  <TextField
                    value={scenarioControls.parkingArea}
                    label="Usable Square Footage"
                    onChange={(e) => {
                      const parkingArea = Number(e.target.value);
                      setScenarioControls({
                        ...scenarioControls,
                        parkingArea: parkingArea < 1000 ? 1000 : parkingArea,
                      });
                    }}
                  />
                </Tooltip>
                <UtilitySelectBox
                  utilityRates={utilityRates}
                  selectedUtilityRateId={scenarioControls.utilityRateId}
                  setSelectedUtilityRateId={(utilityRateId: number) =>
                    setScenarioControls({
                      ...scenarioControls,
                      utilityRateId,
                    })
                  }
                />
              </Stack>
              <Box>
                <ChargerChoices
                  chargers={chargers}
                  truckChargerId={scenarioControls.truckChargerId}
                  truckChargerCost={scenarioControls.truckChargerCost}
                  trailerChargerId={scenarioControls.trailerChargerId}
                  trailerChargerCost={scenarioControls.trailerChargerCost}
                  handleChargerValuesChange={(
                    vehicleChargerValues: VehicleChargerValues
                  ) =>
                    setScenarioControls({
                      ...scenarioControls,
                      ...vehicleChargerValues,
                    })
                  }
                />
              </Box>
            </Stack>
          </Box>
        </Stack>

        <StickyBottomBox>
          <Button
            variant="contained"
            onClick={handleDownloadData}
            className="scenario-download-button"
          >
            Download data
          </Button>
          <Button
            variant="contained"
            onClick={() => setUploadDialogOpen(true)}
            className="scenario-upload-button"
          >
            Upload Fleet Arrivals
          </Button>
        </StickyBottomBox>
      </Stack>
      <Stack
        direction={"column"}
        sx={{ flex: 1, position: "relative", overflowY: "scroll" }}
        className="tab-panels"
      >
        <TabContext value={currentTab}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <TabList
              onChange={(e, tab) => setCurrentTab(tab)}
              variant={"fullWidth"}
            >
              <Tab
                label={"Arrivals"}
                value={"arrivals"}
                className="arrivals-tab"
              />
              <Tab label={"Energy"} value={"energy"} className="energy-tab" />
              <Tab
                label={"Chargers"}
                value={"chargers"}
                className="chargers-tab"
              />
              <Tab
                label={"Financial"}
                value={"financial"}
                className="financial-tab"
              />
              <Tab
                label={"Parameters"}
                value={"parameters"}
                className="parameters-tab"
              />
            </TabList>
          </Box>
          <TabPanel value={"arrivals"} className="chart-tab-panel">
            <Arrivals truckData={truckData} trailerData={trailerData} />
          </TabPanel>
          <TabPanel value={"financial"} className="chart-tab-panel">
            <FinancialHub
              financialData={aggregateData?.financial}
              year={scenarioControls.year}
            />
          </TabPanel>
          <TabPanel value={"chargers"} className="chart-tab-panel">
            <ChargersHub
              truckChargersData={truckData?.chargers}
              trailerChargersData={trailerData?.chargers}
            />
          </TabPanel>
          <TabPanel value={"energy"} className="chart-tab-panel">
            <EnergyHub
              aggregateEnergyDemandData={aggregateData?.energy_demand}
            />
          </TabPanel>
          <TabPanel value={"parameters"} className="chart-tab-panel">
            <ParametersHub
              siteName={siteScenarioData?.name}
              scenarioName={siteScenarioData?.scenario.name}
              utilityRate={siteScenarioData?.scenario.utility_rate}
              truckData={truckData}
              trailerData={trailerData}
              truckYearlyParams={truckYearlyParams}
              trailerYearlyParams={trailerYearlyParams}
            />
          </TabPanel>
        </TabContext>
      </Stack>
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        onClose={() => setSnackbarMessage(undefined)}
      >
        <Alert severity={snackbarMessage?.split(":")[0] as "success" | "error"}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Yearly Assumption Model */}
      {scenarioId && yearlyModal && (
        <AdvancedSettingsDialog
          yearlyModal={yearlyModal}
          siteId={siteId}
          scenarioId={scenarioId}
          yearlyParams={siteScenarioData?.scenario.yearly_params ?? []}
          fleetsData={fleetsData}
          handleYearlyModal={() => setYearlyModal(!yearlyModal)}
          annualAveragePerCharger={annualAveragePerCharger}
          setAnnualAveragePerCharger={setAnnualAveragePerCharger}
          refetch={refetch}
        />
      )}

      {/* File upload Model */}
      <UploadDialog
        uploadDialogOpen={uploadDialogOpen}
        setUploadDialogOpen={setUploadDialogOpen}
        siteId={siteId}
        refetchScenarioData={refetch}
        fleetsData={fleetsData}
        refetchFleetsData={refetchFleetsData}
      />

      {/* Optimal Confirm Dialog */}
      {optimalDialogOpen && (
        <OptimalConfirmDialog
          open={optimalDialogOpen}
          handleConfirm={() => setOptimalStatus(!optimalStatus)}
          handleClose={() => setOptimalDialogOpen(false)}
        />
      )}
    </Stack>
  );
};

export default HubScenarioPage;
