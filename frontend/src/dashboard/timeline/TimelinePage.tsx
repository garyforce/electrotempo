import { useTour } from "@reactour/tour";
import { useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";

import AddBoxIcon from "@mui/icons-material/AddBox";
import CompareIcon from "@mui/icons-material/Compare";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import GrowthScenarioWizard from "./wizard/GrowthScenarioWizard";

import {
  Business,
  Create,
  Delete,
  DownloadRounded,
  LocationOn,
} from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { GridCloseIcon } from "@mui/x-data-grid";
import {
  deleteGrowthScenario,
  loadGrowthScenario,
  loadGrowthScenarios,
} from "api/growth_scenario.js";
import { getSalesData } from "api/sales-data";
import { GrowthScenario } from "types/growth-scenario";
import { Location } from "types/location";
import { createSafeFilename } from "utils/file";
import EmissionCharts from "./EmissionCharts";
import LdvChargingDemandCharts from "./LdvChargingDemandCharts";
import MarketAdoptionCharts from "./MarketAdoptionCharts";
import MhdChargingDemandCharts from "./MhdChargingDemandCharts";
import ParameterTable from "./ParameterTable";
import { download } from "./download";
import { downloadSalesData } from "./downloadSalesData";

export type ChartControlValues = {
  workplaceFractionServedByDcfc: number;
  pricePerLevel2Charger: number;
  pricePerDcFastCharger: number;
};

export type TimelinePageProps = {
  growthScenarios?: GrowthScenario[];
  setGrowthScenarios?: (growthScenarios: GrowthScenario[]) => void;
  selectedGrowthScenarioId?: number;
  setSelectedGrowthScenarioId?: (id: number) => void;
  selectedGrowthScenario?: GrowthScenario;
  setCustomUpdate: () => void;
  location?: Location;
  admin?: Boolean;
  openTimelineDialog?: boolean;
  setOpenTimelineDialog?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TimelinePage(props: TimelinePageProps) {
  const { getAccessTokenSilently } = useAuth0();
  const { setIsOpen, setSteps, setCurrentStep } = useTour();
  const [currentTab, setCurrentTab] = useState("market-adoption");

  const isTxppc = ["TxPPC", "LCRA", "CPS", "NBU", "Austin Energy"].includes(
    props.location?.name ?? ""
  );

  const [chartControlValues, setChartControlValues] =
    useState<ChartControlValues>({
      workplaceFractionServedByDcfc: 0.2,
      pricePerLevel2Charger: 7000,
      pricePerDcFastCharger: 100000,
    });

  const [comparisonModeActive, setComparisonModeActive] = useState(false);
  const [comparisonGrowthScenarioId, setComparisonGrowthScenarioId] = useState<
    number | undefined
  >(undefined);
  const [comparisonGrowthScenario, setComparisonGrowthScenario] = useState<
    GrowthScenario | undefined
  >(undefined);

  const [comparisonChartControlValues, setComparisonChartControlValues] =
    useState<ChartControlValues>({
      workplaceFractionServedByDcfc: 0.2,
      pricePerLevel2Charger: 7000,
      pricePerDcFastCharger: 100000,
    });

  const [addScenarioWizardOpen, setAddScenarioWizardOpen] = useState(false);
  const [addScenarioWizardRenderKey, setAddScenarioWizardRenderKey] =
    useState(0);

  const [selectedGrowthScenarioInfo, setSelectedGrowthScenarioInfo] = useState<
    GrowthScenario | undefined
  >();

  const tourSteps = [
    {
      selector: ".title",
      content: (
        <Typography>
          The timeline page shows custom growth scenarios with user-configured
          parameters.
        </Typography>
      ),
    },
    {
      selector: "#growth-scenario-select",
      content: (
        <Typography>
          An existing growth scenario can be selected here.
        </Typography>
      ),
    },
    {
      selector: ".add-new-simulation-button",
      content: (
        <Typography>
          A new growth scenario can be created by clicking this button. For a
          more in-depth tutorial on creating a growth scenario, see the{" "}
          <a
            href="https://www.youtube.com/watch?v=V3vs8rRvjkM"
            target="_blank"
            rel="noreferrer"
          >
            ElectroTempo EV Growth Simulation Technical Tutorial video.
          </a>
        </Typography>
      ),
    },
    {
      selector: ".download-button",
      content: (
        <Typography>
          The currently displayed chart data can be downloaded by clicking this
          button. The downloaded data will reflect any modified controls on the
          charts.
        </Typography>
      ),
    },
    {
      selector: "#tab-list",
      content: (
        <Typography>
          The current view is shown here. You can change the view by clicking a
          new tab.
        </Typography>
      ),
    },
    {
      selector: ".chart-tab-panel",
      content: (
        <Typography>
          Charts for the current view are shown here. Each provides insight into
          a different aspect of the selected growth scenario.
        </Typography>
      ),
    },
    {
      selector: "#compare-button",
      content: (
        <Typography>
          Two growth scenarios can be compared side-by-side by clicking this
          button.
        </Typography>
      ),
    },
  ];

  const handleComparisonGrowthScenarioChange = (
    event: SelectChangeEvent<any>,
    child: React.ReactNode
  ) => {
    const selectedComparisonGrowthScenarioId = event.target.value;
    setComparisonGrowthScenarioId(selectedComparisonGrowthScenarioId);
  };

  useEffect(() => {
    async function loadData() {
      const apiToken = await getAccessTokenSilently();
      const newGrowthScenario = await loadGrowthScenario(
        comparisonGrowthScenarioId,
        apiToken
      );
      setComparisonGrowthScenario(newGrowthScenario);
    }

    if (comparisonGrowthScenarioId) {
      loadData();
    }
    const selectedGrowthScenarioInfo = props.growthScenarios?.find(
      (item) => item.id === props.selectedGrowthScenarioId
    );
    setSelectedGrowthScenarioInfo(selectedGrowthScenarioInfo);
  }, [
    comparisonGrowthScenarioId,
    getAccessTokenSilently,
    props.growthScenarios,
    props.location,
    props.selectedGrowthScenarioId,
  ]);

  const handleTabChange = (
    event: React.SyntheticEvent<Element, Event>,
    newTab: any
  ) => {
    setCurrentTab(newTab);
  };

  const hasLightDutyVehicles: boolean =
    props.selectedGrowthScenario?.vehicleClasses.some(
      (vehicleClass) => vehicleClass.name === "Cars"
    ) ?? false;
  const hasMediumHeavyDutyVehicles: boolean =
    props.selectedGrowthScenario?.vehicleClasses.some(
      (vehicleClass) =>
        vehicleClass.name === "Light Trucks" ||
        vehicleClass.name === "Straight Trucks" ||
        vehicleClass.name === "Tractors"
    ) ?? false;

  const [deleteScenarioPopup, setDeleteScenarioPopup] = useState(false);

  const deleteSelectedGrowthScenario = async () => {
    const apiToken = await getAccessTokenSilently();
    try {
      await deleteGrowthScenario(props.selectedGrowthScenarioId, apiToken);
      setDeleteScenarioPopup(false);
      props.setCustomUpdate();
    } catch (error) {
      console.log(error);
      setDeleteScenarioPopup(false);
    }
  };

  const handleDeleteGrowthScenario = () => {
    setDeleteScenarioPopup(true);
  };

  const handleDownloadSalesData = async () => {
    const apiToken = await getAccessTokenSilently();
    try {
      const salesdata = await getSalesData(apiToken, props.location?.id ?? "");
      downloadSalesData(salesdata, props.location?.name ?? "");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (props.openTimelineDialog) setAddScenarioWizardOpen(true);
  }, [props.openTimelineDialog]);

  const hideAddScenarioWizard = () => {
    setAddScenarioWizardOpen(false);
    if (props.setOpenTimelineDialog) props.setOpenTimelineDialog(false);
  };
  return (
    <>
      <Stack direction="row" sx={{ height: "100%" }}>
        <Box
          sx={{
            backgroundColor: "white",
            height: "100%",
            width: "100%",
            overflowY: "auto",
          }}
        >
          {/* Box with margin rather than parent with padding because flexboxes don't account
                    for padding in the parent */}
          <Stack sx={{ margin: "2rem" }} spacing={2}>
            <Stack direction="row" justifyContent={"space-between"}>
              <Stack direction="row" alignItems={"center"} spacing={2}>
                <Typography variant="h1" className={"title"}>
                  Timeline
                </Typography>
                <Button
                  onClick={() => {
                    setSteps(tourSteps);
                    setCurrentStep(0);
                    setIsOpen(true);
                  }}
                  color="info"
                  startIcon={<HelpOutlineIcon />}
                  variant={"outlined"}
                  size={"small"}
                >
                  Tutorial
                </Button>
              </Stack>
              <Stack sx={{ textAlign: "right" }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent={"flex-end"}
                  spacing={1}
                >
                  <InfoIcon color="info" fontSize="small" />
                  <Typography variant="subtitle1">
                    All charts are cumulative
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent={"flex-end"}
                  spacing={1}
                >
                  <InfoIcon color="info" fontSize="small" />
                  <Typography variant="subtitle1">
                    Click on a dataset in the legend to toggle on/off
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <FormControl sx={{ minWidth: "250px" }}>
                  <InputLabel id="growth-scenario-select-label">
                    Growth Scenario
                  </InputLabel>
                  <Select
                    labelId="growth-scenario-select-label"
                    id="growth-scenario-select"
                    value={props.selectedGrowthScenario?.id ?? ""}
                    label="Growth Scenario"
                    onChange={(event) => {
                      if (props.setSelectedGrowthScenarioId !== undefined) {
                        props.setSelectedGrowthScenarioId(
                          Number(event.target.value)
                        );
                      }
                    }}
                  >
                    {props.growthScenarios?.length === 0 && (
                      <MenuItem disabled value="">
                        <em>No Growth Scenarios Available</em>
                      </MenuItem>
                    )}
                    {props.growthScenarios?.map(
                      (growthScenario: GrowthScenario) => {
                        return (
                          <MenuItem
                            value={growthScenario.id}
                            key={growthScenario.id}
                          >
                            {growthScenario.name}
                          </MenuItem>
                        );
                      }
                    )}
                  </Select>
                </FormControl>
                <Tooltip title="Add a new growth scenario">
                  <IconButton
                    onClick={() => {
                      setAddScenarioWizardOpen(true);
                      setAddScenarioWizardRenderKey(
                        addScenarioWizardRenderKey + 1
                      );
                    }}
                    className={"add-new-simulation-button"}
                  >
                    <AddBoxIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download the currently displayed data">
                  <IconButton
                    onClick={() => {
                      if (props.selectedGrowthScenario === undefined) {
                        return;
                      }
                      download(
                        createSafeFilename(
                          `${props.selectedGrowthScenario.name}.csv`
                        ),
                        props.selectedGrowthScenario,
                        chartControlValues
                      );
                    }}
                    className={"download-button"}
                  >
                    <DownloadIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete the selected growth scenario">
                  <IconButton
                    onClick={() => {
                      if (props.selectedGrowthScenario === undefined) {
                        return;
                      }
                      handleDeleteGrowthScenario();
                    }}
                    className={"download-button"}
                  >
                    <Delete fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                {props.admin && (
                  <Stack rowGap={1}>
                    <Typography variant="caption">
                      Selected Growth Scenario Information
                    </Typography>
                    <Stack direction={"row"} columnGap={2}>
                      <Tooltip title="Organization Name">
                        <Chip
                          avatar={<Business fontSize="small" />}
                          label={selectedGrowthScenarioInfo?.orgname}
                          variant="outlined"
                        />
                      </Tooltip>
                      <Tooltip title="Created Date">
                        <Chip
                          avatar={<Create fontSize="small" />}
                          label={
                            selectedGrowthScenarioInfo?.created?.split("T")[0]
                          }
                          variant="outlined"
                        />
                      </Tooltip>
                      {selectedGrowthScenarioInfo?.location !== null && (
                        <Tooltip title="Created Location">
                          <Chip
                            avatar={<LocationOn fontSize="small" />}
                            label={selectedGrowthScenarioInfo?.location}
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
              {!comparisonModeActive && (
                <Button
                  variant="contained"
                  startIcon={<CompareIcon />}
                  onClick={() => setComparisonModeActive(true)}
                  id="compare-button"
                >
                  Compare Another Growth Scenario
                </Button>
              )}
              {comparisonModeActive && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<CompareIcon />}
                    onClick={() => setComparisonModeActive(false)}
                  >
                    Turn off Comparison
                  </Button>
                  <FormControl sx={{ minWidth: "250px" }}>
                    <InputLabel id="growth-scenario-select-label">
                      Compare to
                    </InputLabel>
                    <Select
                      labelId="growth-scenario-select-label"
                      id="growth-scenario-select"
                      value={comparisonGrowthScenarioId || ""}
                      label="Compare to"
                      onChange={handleComparisonGrowthScenarioChange}
                    >
                      {props.growthScenarios?.map(
                        (growthScenario: GrowthScenario) => {
                          return (
                            <MenuItem
                              value={growthScenario.id}
                              key={growthScenario.id}
                            >
                              {growthScenario.name}
                            </MenuItem>
                          );
                        }
                      )}
                    </Select>
                  </FormControl>
                </Stack>
              )}
            </Box>
            <TabContext value={currentTab}>
              <Box
                id="tab-list"
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                <TabList onChange={handleTabChange} variant={"scrollable"}>
                  <Tab label={"Market Adoption"} value={"market-adoption"} />
                  <Tab
                    label={"Light Duty Charging"}
                    value={"ld-charging-demand"}
                    disabled={!hasLightDutyVehicles}
                  />
                  <Tab
                    label={"Medium/Heavy Duty Charging"}
                    value={"mhd-charging-demand"}
                    disabled={!hasMediumHeavyDutyVehicles}
                  />
                  <Tab label={"Emissions"} value={"emissions"} />
                  <Tab label={"Parameters"} value={"parameters"} />
                  <Button
                    onClick={() => handleDownloadSalesData()}
                    sx={{ marginLeft: "auto", marginBottom: 1 }}
                    variant="contained"
                    startIcon={<DownloadRounded />}
                    disabled={!isTxppc}
                    aria-label="Download Registration Data"
                  >
                    Download Registration Data
                  </Button>
                </TabList>
              </Box>
              <TabPanel value={"market-adoption"} className="chart-tab-panel">
                <MarketAdoptionCharts
                  growthScenario={props.selectedGrowthScenario}
                  comparisonMode={comparisonModeActive}
                  comparisonGrowthScenario={
                    comparisonModeActive ? comparisonGrowthScenario : undefined
                  }
                />
              </TabPanel>
              <TabPanel value={"parameters"} className="chart-tab-panel">
                <Stack
                  direction="row"
                  divider={<Divider orientation="vertical" flexItem />}
                  justifyContent="center"
                  spacing={2}
                >
                  <Box
                    sx={{
                      maxWidth: "40%",
                      flexGrow: "1",
                    }}
                  >
                    <ParameterTable
                      growthScenario={props.selectedGrowthScenario}
                    />
                  </Box>
                  {comparisonModeActive && (
                    <Box
                      sx={{
                        maxWidth: "40%",
                        flexGrow: "1",
                      }}
                    >
                      <ParameterTable
                        growthScenario={comparisonGrowthScenario}
                      />
                    </Box>
                  )}
                </Stack>
              </TabPanel>
              <TabPanel
                value={"ld-charging-demand"}
                className="chart-tab-panel"
              >
                <LdvChargingDemandCharts
                  growthScenario={props.selectedGrowthScenario}
                  chartControlValues={chartControlValues}
                  setChartControlValues={setChartControlValues}
                  comparisonMode={comparisonModeActive}
                  comparisonGrowthScenario={
                    comparisonModeActive ? comparisonGrowthScenario : undefined
                  }
                  comparisonChartControlValues={
                    comparisonModeActive
                      ? comparisonChartControlValues
                      : undefined
                  }
                  setComparisonChartControlValues={
                    comparisonModeActive
                      ? setComparisonChartControlValues
                      : undefined
                  }
                />
              </TabPanel>
              <TabPanel
                value={"mhd-charging-demand"}
                className="chart-tab-panel"
              >
                <MhdChargingDemandCharts
                  growthScenario={props.selectedGrowthScenario}
                  chartControlValues={chartControlValues}
                  setChartControlValues={setChartControlValues}
                  comparisonMode={comparisonModeActive}
                  comparisonGrowthScenario={
                    comparisonModeActive ? comparisonGrowthScenario : undefined
                  }
                  comparisonChartControlValues={
                    comparisonModeActive
                      ? comparisonChartControlValues
                      : undefined
                  }
                  setComparisonChartControlValues={
                    comparisonModeActive
                      ? setComparisonChartControlValues
                      : undefined
                  }
                />
              </TabPanel>
              <TabPanel value={"emissions"} className="chart-tab-panel">
                <EmissionCharts
                  growthScenario={props.selectedGrowthScenario}
                  comparisonGrowthScenario={
                    comparisonModeActive ? comparisonGrowthScenario : undefined
                  }
                  comparisonMode={comparisonModeActive}
                />
              </TabPanel>
            </TabContext>
          </Stack>
        </Box>
      </Stack>
      <GrowthScenarioWizard
        key={addScenarioWizardRenderKey}
        open={addScenarioWizardOpen}
        onClose={hideAddScenarioWizard}
        scroll={"paper"}
        fullWidth
        maxWidth={"md"}
        location={props.location}
        onSubmit={async () => {
          setAddScenarioWizardOpen(false);
          // automatically load and select the new growth scenario
          const apiToken = await getAccessTokenSilently();
          const growthScenarios = await loadGrowthScenarios(
            apiToken,
            props.location
          );
          if (props.setGrowthScenarios !== undefined) {
            props.setGrowthScenarios(growthScenarios?.scenarios);
          }
          if (props.setSelectedGrowthScenarioId !== undefined) {
            props.setSelectedGrowthScenarioId(
              growthScenarios?.scenarios[growthScenarios.scenarios.length - 1]
                .id
            );
          }
        }}
        growthScenarios={props.growthScenarios ?? []}
      />

      {/* Delete Growth Scenario Popup */}
      <Dialog
        open={deleteScenarioPopup}
        onClose={() => setDeleteScenarioPopup(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <IconButton
          aria-label="close"
          onClick={() => setDeleteScenarioPopup(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <GridCloseIcon />
        </IconButton>
        <DialogTitle id="alert-dialog-title">
          {`Do you want to delete the scenario (${
            props.selectedGrowthScenario?.name ?? ""
          })?`}
        </DialogTitle>
        <DialogActions>
          <Button color="error" onClick={() => deleteSelectedGrowthScenario()}>
            Delete
          </Button>
          <Button
            color="inherit"
            sx={{ color: "black" }}
            onClick={() => setDeleteScenarioPopup(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
