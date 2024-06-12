import BoltIcon from "@mui/icons-material/Bolt";
import ElectricRickshawIcon from "@mui/icons-material/ElectricRickshaw";
import EmojiTransportationIcon from "@mui/icons-material/EmojiTransportation";
import EvStationIcon from "@mui/icons-material/EvStation";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TimelineIcon from "@mui/icons-material/Timeline";
import UploadIcon from "@mui/icons-material/Upload";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Alert, SelectChangeEvent, Snackbar, Tab } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import "../App.css";
import Header from "./Header";
// "leaflet" import required here because of "leaflet.pattern" import
import { useAuth0 } from "@auth0/auth0-react";
import "leaflet";
import "leaflet.pattern/dist/leaflet.pattern-src.js";
import { mergeDeep } from "../utils/object.js";
import { usePermissions } from "./PermissionContext";
import Tableau from "./Tableau";
import CoveragePage from "./coverage/CoveragePage";
import DemandPage from "./demand/DemandPage";
import RevenuePage from "./revenue/RevenuePage";
import SitesPage from "./sites/SitesPage";
import TimelinePage from "./timeline/TimelinePage";
import UploadPage from "./upload/UploadPage";

import { loadBlockGroups } from "api/block_group.js";
import { loadChargingDemandSimulations } from "api/charging_demand_simulation";
import { loadChargingStations } from "api/charging_station.js";
import { loadDemographics } from "api/demographics.js";
import {
  loadGrowthScenario,
  loadGrowthScenarios,
} from "api/growth_scenario.js";
import { loadSubstations } from "api/substation.js";
import { loadTrafficModels } from "api/traffic_model";

import { DirectionsBoat } from "@mui/icons-material";
import { FeatureCollection } from "geojson";
import { Ac } from "types/ac";
import { ChargingDemandSimulation } from "types/charging-demand-simulation";
import { GrowthScenario } from "types/growth-scenario";
import { Location } from "types/location";
import { TrafficModel } from "types/traffic-model";
import DepotsPage from "./depots/DepotsPage";
import FleetsPage from "./fleets/FleetsPage";
import HubPage from "./hub/HubPage";
import TerminalPage from "./terminal";
import { useAppDispatch, useAppSelector } from "redux/store";
import { setLocation } from "redux/features/Header/locationSlice";

/**
 * Finds a charging demand simulation matching some parameters.
 * @param {array} chargingDemandSimulations The array of possible charging demand simulations
 * @param {*} parameters An object with key/value pairs representing the desired CDS parameters
 * @returns the first charging demand simulation matching the given parameters
 */
function findChargingDemandSimulation(
  chargingDemandSimulations: ChargingDemandSimulation[],
  parameters: any
) {
  return chargingDemandSimulations.find((cds) => {
    // TODO: unignore this line and deal with the TypeScript complaints.
    // This was working before this file was turned into TypeScript, so at the
    // very least it's not a regression.
    // @ts-ignore
    return Object.keys(parameters).every((key) => cds[key] === parameters[key]);
  });
}

const ACS_SEGMENT_WHOLE_POPULATION = 1;
const ACS_METRIC_POVERTY = 2;
const ACS_METRIC_NONWHITE = 3;
const ACS_METRIC_MULTIFAMILY_HOUSING = 4;

const emptyFeatureCollection: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

type View = "blank" | "map" | "timeline" | "demand" | "coverage" | "sites";

function Dashboard() {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  // data
  const [locations, setLocations] = useState<Location[]>([]);
  const { location: selectedLocation, disabledState } = useAppSelector(
    (store) => store.location
  );
  const dispatch = useAppDispatch();
  const [trafficModels, setTrafficModels] = useState<
    TrafficModel[] | undefined
  >(undefined); //eslint-disable-line no-unused-vars
  const [selectedTrafficModelId, setSelectedTrafficModelId] = useState<
    number | undefined
  >(undefined);
  const [blockGroups, setBlockGroups] = useState<FeatureCollection>(
    emptyFeatureCollection
  ); // GeoJSON FeatureGroup
  const [chargingDemandSimulations, setChargingDemandSimulations] = useState<
    ChargingDemandSimulation[] | undefined
  >(undefined);
  const [demographics, setDemographics] = useState({});
  const [chargingStations, setChargingStations] = useState(null);
  const [substations, setSubstations] = useState({
    type: "FeatureGroup",
    features: [],
  }); // GeoJSON FeatureGroup
  const [growthScenarios, setGrowthScenarios] = useState<
    GrowthScenario[] | undefined
  >([]);
  const [selectedGrowthScenarioId, setSelectedGrowthScenarioId] = useState<
    number | undefined
  >(undefined);
  const [selectedGrowthScenario, setSelectedGrowthScenario] = useState<
    GrowthScenario | undefined
  >(undefined);

  // CDS selectors
  const [ac, setAc] = useState<Ac>("high");
  const selectedChargingDemandSimulation =
    chargingDemandSimulations !== undefined
      ? findChargingDemandSimulation(chargingDemandSimulations, {
          ac,
        })
      : undefined;
  const [year, setYear] = useState(new Date().getFullYear());

  // UI components
  const [currentView, setCurrentView] = useState<View>("blank");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingGrowthScenarios, setLoadingGrowthScenarios] = useState(false);
  const [loadingGrowthScenarioData, setLoadingGrowthScenarioData] =
    useState(false);
  const [loadingPolygons, setLoadingPolygons] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingChargingStations, setLoadingChargingStations] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingSubstations, setLoadingSubstations] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingDemographics, setLoadingDemographics] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorLoadingGrowthScenarios, setErrorLoadingGrowthScenarios] =
    useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorLoadingPolygons, setErrorLoadingPolygons] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorLoadingChargingStations, setErrorLoadingChargingStations] =
    useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorLoadingSubstations, setErrorLoadingSubstations] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorLoadingDemographics, setErrorLoadingDemographics] =
    useState(false);
  const [customUpdate, setCustomUpdate] = useState(true);
  const [isAdmin, setIsAdmin] = useState<Boolean>(false);

  const [openTimelineDialog, setOpenTimelineDialog] = useState<boolean>(false);
  const permissions = usePermissions();
  const { getAccessTokenSilently } = useAuth0();

  /* this useEffect() is only called on mount */
  useEffect(() => {
    const loadLocations = async () => {
      const token = await getAccessTokenSilently();
      try {
        const locationResponse = await fetch(
          `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/locations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (locationResponse.ok) {
          const locationsData = await locationResponse.json();
          setLocations(locationsData);
          if (locationsData.length > 0) {
            // if one or more keys exist, set the current location to the first one
            dispatch(setLocation(locationsData[0]));
          }
        } else {
          // assuming this always works. TODO: make it not do that.
        }
      } catch (e: unknown) {
        setSnackbarMessage("A network error occured while loading locations.");
        setShowSnackbar(true);
      }
    };
    loadLocations();

    // disable warnings on next line because we intentionally only want this called once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    /* reset state */
    setBlockGroups(emptyFeatureCollection);
    setDemographics({});
    setChargingStations(null);
    setGrowthScenarios([]);
    setSelectedGrowthScenarioId(undefined);

    async function loadData() {
      if (selectedLocation === undefined) {
        return;
      }
      const apiToken = await getAccessTokenSilently();

      const austinLocationId = "8";
      const austinEnergyLocationId = "78";
      try {
        // Currently loading the traffic model for austin, if we select austin energy as a location
        // TODO : Remove this hack when we insert new charging demand simulations in the database and tie it to the traffic models for txppc regions
        // https://electrotempo.atlassian.net/browse/CORE-3231
        const trafficModels = await loadTrafficModels(
          selectedLocation.id.toString() === austinEnergyLocationId
            ? austinLocationId
            : selectedLocation.id,
          apiToken
        );
        setTrafficModels(trafficModels);
        if (trafficModels.length > 0) {
          // right now each location only has 1 traffic model
          setSelectedTrafficModelId(trafficModels[0].id);
        }
      } catch (error) {
        console.error("Fatal: could not load traffic models.");
      }

      setLoadingGrowthScenarios(true);
      let growthScenarios;
      try {
        let location: Location = {
          id: "",
          name: "",
          zoom: 0,
          center: [],
          evInsitesEnabled: false,
        };
        if (locations.length && !selectedLocation.id) {
          location = locations[0];
        } else {
          location = selectedLocation;
        }
        growthScenarios = await loadGrowthScenarios(apiToken, location);
        setGrowthScenarios(growthScenarios?.scenarios);
        if (growthScenarios?.scenarios.length > 0) {
          setSelectedGrowthScenarioId(
            growthScenarios?.scenarios[growthScenarios.scenarios.length - 1].id
          );
          setIsAdmin(growthScenarios?.isAdmin);
        } else {
          setSelectedGrowthScenarioId(undefined);
          setSelectedGrowthScenario(undefined);
        }
      } catch (error) {
        setErrorLoadingGrowthScenarios(true);
      } finally {
        setLoadingGrowthScenarios(false);
      }
    }
    loadData();
  }, [getAccessTokenSilently, selectedLocation, customUpdate, locations]);

  useEffect(() => {
    async function loadData() {
      const apiToken = await getAccessTokenSilently();
      const chargingDemandSimulations = await loadChargingDemandSimulations(
        selectedTrafficModelId,
        apiToken
      );
      setChargingDemandSimulations(chargingDemandSimulations);
      if (chargingDemandSimulations.length > 0) {
        // right now each location only has 1 traffic model
        setAc(chargingDemandSimulations[0].ac);
      }

      setLoadingPolygons(true);
      loadBlockGroups(selectedTrafficModelId, apiToken, selectedLocation.id)
        .then((blockGroupFeatureGroup) => {
          setBlockGroups(blockGroupFeatureGroup);
        })
        .catch((error) => {
          setErrorLoadingPolygons(true);
        })
        .finally(() => {
          setLoadingPolygons(false);
        });

      setLoadingChargingStations(true);
      loadChargingStations(
        selectedTrafficModelId,
        apiToken,
        selectedLocation?.name,
        selectedLocation?.id
      )
        .then((chargingStations) => {
          setChargingStations(chargingStations);
        })
        .catch((error) => {
          setErrorLoadingChargingStations(true);
        })
        .finally(() => {
          setLoadingChargingStations(false);
        });
      setLoadingSubstations(true);
      loadSubstations(selectedTrafficModelId, apiToken)
        .then((substations) => {
          setSubstations(substations);
        })
        .catch((error) => {
          setErrorLoadingSubstations(true);
        })
        .finally(() => {
          setLoadingSubstations(false);
        });

      setLoadingDemographics(true);
      const povertyDemographics = loadDemographics(
        selectedTrafficModelId,
        ACS_METRIC_POVERTY,
        ACS_SEGMENT_WHOLE_POPULATION,
        false,
        apiToken
      );
      const nonWhiteDemographics = loadDemographics(
        selectedTrafficModelId,
        ACS_METRIC_NONWHITE,
        ACS_SEGMENT_WHOLE_POPULATION,
        true,
        apiToken
      );
      const multifamilyHousingDemographics = loadDemographics(
        selectedTrafficModelId,
        ACS_METRIC_MULTIFAMILY_HOUSING,
        ACS_SEGMENT_WHOLE_POPULATION,
        true,
        apiToken
      );
      Promise.all([
        povertyDemographics,
        nonWhiteDemographics,
        multifamilyHousingDemographics,
      ])
        .then((values) => {
          setDemographics(mergeDeep(values[0], values[1], values[2]));
        })
        .catch((error) => {
          setErrorLoadingDemographics(true);
        })
        .finally(() => {
          setLoadingDemographics(false);
        });
    }
    if (selectedTrafficModelId) {
      loadData();
    }
  }, [
    getAccessTokenSilently,
    selectedTrafficModelId,
    selectedGrowthScenarioId,
  ]);

  useEffect(() => {
    if (currentView === "blank" && permissions.length > 0) {
      const viewPermissions = [
        {
          permission: "read:timeline_tab",
          value: "timeline",
        },
        {
          permission: "read:demand_tab",
          value: "demand",
        },
        {
          permission: "read:sites_tab",
          value: "sites",
        },
        {
          permission: "read:coverage_tab",
          value: "coverage",
        },
        {
          permission: "read:electricity_cost_tab",
          value: "revenue",
        },
        {
          permission: "read:fleets_tab",
          value: "fleets",
        },
        {
          permission: "read:upload_tab",
          value: "upload",
        },
        {
          permission: "read:terminal_tab",
          value: "terminal",
        },
        {
          permission: "read:hubs_tab",
          value: "hubs",
        },
      ];
      const permissionIntersection = viewPermissions.filter((viewPermission) =>
        permissions.includes(viewPermission.permission)
      );
      const firstView =
        permissionIntersection.length > 0
          ? permissionIntersection[0].value
          : "blank";
      setCurrentView(firstView as View);
    }
  }, [permissions, currentView]);

  useEffect(() => {
    async function loadData() {
      setLoadingGrowthScenarioData(true);
      const apiToken = await getAccessTokenSilently();
      const newGrowthScenario = await loadGrowthScenario(
        selectedGrowthScenarioId,
        apiToken
      );
      setSelectedGrowthScenario(newGrowthScenario);
      setLoadingGrowthScenarioData(false);
    }

    if (selectedGrowthScenarioId) {
      loadData();
    } else {
      setSelectedGrowthScenario(undefined);
    }
  }, [selectedGrowthScenarioId, getAccessTokenSilently]);

  const handleAcChange = (newAc: Ac) => {
    setAc(newAc);
  };

  const handleYearChange = (event: Event) => {
    setYear(Number((event.target as HTMLInputElement).value));
  };

  const handleLocationChange = (event: Event) => {
    const newLocation = locations.find(
      (location) => location.id === (event.target as HTMLInputElement).value
    );
    if (newLocation === undefined) {
      throw new Error("The selected location was not found.");
    }
    dispatch(setLocation(newLocation));
  };

  const handleTabChange = (
    event: SyntheticEvent<Element, Event>,
    view: any
  ) => {
    setCurrentView(view);
  };

  const handleGrowthScenarioChange = (event: Event) => {
    if (growthScenarios === undefined) return;
    const selectedGrowthScenario = growthScenarios.find(
      (gs) => gs.id === Number((event.target as HTMLInputElement).value)
    );
    setSelectedGrowthScenarioId(selectedGrowthScenario?.id);
  };

  const handleTrafficModelChange = (event: SelectChangeEvent) => {
    if (trafficModels === undefined) return;
    const selectedGrowthScenario = trafficModels.find(
      (tm) => tm.id === Number((event.target as HTMLInputElement).value)
    );
    setSelectedTrafficModelId(selectedGrowthScenario?.id);
  };

  const handleFromHubToTimeline = () => {
    setOpenTimelineDialog(true);
    setCurrentView("timeline");
  };

  const selectedTrafficModel = trafficModels?.find((tm) => {
    return tm.id === selectedTrafficModelId;
  });

  const loadingMap = loadingPolygons || loadingGrowthScenarioData;

  return (
    <div id="wrapper">
      <Header
        location={selectedLocation}
        locations={locations}
        onLocationChange={handleLocationChange}
        disabledState={disabledState}
      />
      <div id="content">
        <TabContext value={currentView}>
          <TabList
            orientation="vertical"
            onChange={handleTabChange}
            className="tab-list"
            variant={"scrollable"}
            scrollButtons={false}
          >
            <Tab
              icon={<TimelineIcon />}
              value="timeline"
              label="Timeline"
              disabled={!permissions.includes("read:timeline_tab")}
            />
            <Tab
              icon={<BoltIcon />}
              value="demand"
              disabled={!permissions.includes("read:demand_tab")}
              label="Demand"
            />
            <Tab
              icon={<EvStationIcon />}
              value="coverage"
              disabled={!permissions.includes("read:coverage_tab")}
              label="Coverage"
            ></Tab>
            <Tab
              icon={<EmojiTransportationIcon />}
              value="depots"
              disabled={!permissions.includes("read:depots_tab")}
              label="Depots"
            ></Tab>
            <Tab
              icon={<LocationOnIcon />}
              value="sites"
              disabled={!permissions.includes("read:sites_tab")}
              label="Sites"
            ></Tab>
            <Tab
              icon={<HubRoundedIcon />}
              value="hubs"
              disabled={!permissions.includes("read:hubs_tab")}
              label="Hubs"
            ></Tab>
            <Tab
              icon={<MonetizationOnIcon />}
              value="revenue"
              disabled={!permissions.includes("read:electricity_cost_tab")}
              label="Electricity Cost"
            ></Tab>
            <Tab
              icon={<ElectricRickshawIcon />}
              value="fleets"
              disabled={!permissions.includes("read:fleets_tab")}
              label="Fleets"
            ></Tab>
            <Tab
              icon={<LocalShippingIcon />}
              value="mhd-demand"
              disabled={!permissions.includes("read:mhd_demand_tab")}
              label="MHD Demand"
            ></Tab>
            <Tab
              icon={<DirectionsBoat />}
              value="terminal"
              disabled={!permissions.includes("read:terminal_tab")}
              label="Terminal"
            ></Tab>
            <Tab
              icon={<UploadIcon />}
              value="upload"
              label="Upload Data"
              disabled={!permissions.includes("read:upload_tab")}
            ></Tab>
            <Tab value="blank" disabled={true} />
          </TabList>
          <TabPanel value="blank"></TabPanel>
          <TabPanel value="timeline" sx={{ width: "100%" }}>
            <TimelinePage
              growthScenarios={growthScenarios}
              setGrowthScenarios={setGrowthScenarios}
              selectedGrowthScenarioId={selectedGrowthScenarioId}
              setSelectedGrowthScenarioId={setSelectedGrowthScenarioId}
              selectedGrowthScenario={selectedGrowthScenario}
              setCustomUpdate={() => setCustomUpdate(!customUpdate)}
              location={selectedLocation}
              admin={isAdmin}
              openTimelineDialog={openTimelineDialog}
              setOpenTimelineDialog={setOpenTimelineDialog}
            />
          </TabPanel>
          <TabPanel value="demand" sx={{ width: "100%" }}>
            <DemandPage
              selectedGrowthScenario={selectedGrowthScenario}
              growthScenarios={growthScenarios}
              onGrowthScenarioChange={handleGrowthScenarioChange}
              selectedTrafficModelId={selectedTrafficModelId}
              selectedTrafficModel={selectedTrafficModel}
              chargingDemandSimulations={chargingDemandSimulations}
              selectedChargingDemandSimulation={
                selectedChargingDemandSimulation
              }
              blockGroups={blockGroups}
              demographics={demographics}
              chargingStations={chargingStations}
              substations={substations}
              ac={ac}
              onAcChange={handleAcChange}
              location={selectedLocation}
              year={year}
              onYearChange={handleYearChange}
              loading={loadingMap}
              trafficModels={trafficModels}
              onTrafficModelChange={handleTrafficModelChange}
            />
          </TabPanel>
          <TabPanel value="coverage" sx={{ width: "100%" }}>
            <CoveragePage
              selectedGrowthScenario={selectedGrowthScenario}
              growthScenarios={growthScenarios}
              onGrowthScenarioChange={handleGrowthScenarioChange}
              selectedTrafficModelId={selectedTrafficModelId}
              selectedTrafficModel={selectedTrafficModel}
              chargingDemandSimulations={chargingDemandSimulations}
              selectedChargingDemandSimulation={
                selectedChargingDemandSimulation
              }
              blockGroups={blockGroups}
              demographics={demographics}
              chargingStations={chargingStations}
              substations={substations}
              ac={ac}
              onAcChange={handleAcChange}
              year={year}
              onYearChange={handleYearChange}
              loading={loadingMap}
              location={selectedLocation}
            />
          </TabPanel>
          <TabPanel value="depots" sx={{ width: "100%", height: "100%" }}>
            <DepotsPage isAdmin={isAdmin} location={selectedLocation} />
          </TabPanel>
          <TabPanel value="sites" sx={{ width: "100%" }}>
            <SitesPage
              growthScenarios={growthScenarios}
              onGrowthScenarioChange={handleGrowthScenarioChange}
              selectedTrafficModel={selectedTrafficModel}
              chargingDemandSimulations={chargingDemandSimulations}
              selectedChargingDemandSimulation={
                selectedChargingDemandSimulation
              }
              blockGroups={blockGroups}
              demographics={demographics}
              chargingStations={chargingStations}
              substations={substations}
              ac={ac}
              onAcChange={handleAcChange}
              year={year}
              onYearChange={handleYearChange}
              loading={loadingMap}
              location={selectedLocation}
            />
          </TabPanel>
          <TabPanel value="hubs" sx={{ width: "100%" }}>
            <HubPage handleFromHubToTimeline={handleFromHubToTimeline} />
          </TabPanel>
          <TabPanel value="revenue" sx={{ width: "100%" }}>
            <RevenuePage
              selectedGrowthScenario={selectedGrowthScenarioId}
              growthScenarios={growthScenarios}
              onGrowthScenarioChange={handleGrowthScenarioChange}
              selectedGrowthScenarioData={selectedGrowthScenario}
              ac={ac}
              onAcChange={handleAcChange}
              selectedTrafficModel={selectedTrafficModelId}
              chargingDemandSimulations={chargingDemandSimulations}
              selectedChargingDemandSimulation={
                selectedChargingDemandSimulation
              }
              blockGroups={blockGroups}
              chargingStations={chargingStations}
              substations={substations}
              location={selectedLocation}
            />
          </TabPanel>
          <TabPanel value="fleets" sx={{ width: "100%", height: "100%" }}>
            <FleetsPage />
          </TabPanel>
          <TabPanel value="mhd-demand" sx={{ width: "100%", height: "100%" }}>
            <Tableau url="https://prod-useast-a.online.tableau.com/t/electrotempo/views/SECO/Sheet1?:showAppBanner=false&:display_count=n&:showVizHome=n&:origin=viz_share_link" />
          </TabPanel>
          <TabPanel value="terminal" sx={{ width: "100%", height: "100%" }}>
            <TerminalPage />
          </TabPanel>
          <TabPanel value="upload" sx={{ width: "100%" }}>
            <UploadPage locations={locations} />
          </TabPanel>
        </TabContext>
      </div>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="error">{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  );
}

export default Dashboard;
