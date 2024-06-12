import { useAuth0 } from "@auth0/auth0-react";
import {
  Alert,
  AlertColor,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { loadDepotDemand } from "api/depot-demand";
import { loadDepots } from "api/depots";
import { sendMissingDepotReport } from "api/depots/report-depot";
import { loadFeederLineDemand } from "api/feeder-line-demand";
import { loadFeederLines } from "api/feeder-lines";
import { loadDepotGrowthScenarios } from "api/growth_scenario";
import DownloadButton from "dashboard/controls/DownloadButton";
import StickyBottomBox from "dashboard/controls/StickyBottomBox";
import { useDebouncedEffect } from "dashboard/useDebouncedEffect";
import { Feature, FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, {
  Layer,
  LayerProps,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl";
import { DepotFilters } from "types/depot-filter";
import { DepotDemand, FeederLineDemand } from "types/electric-demand";
import { GrowthScenario } from "types/growth-scenario";
import { Location } from "types/location";
import { Season } from "types/season";
import { getStateAbbrFromStateName } from "utils/state-abbr";
import ControlPanel from "./ControlPanel";
import { DemandFeaturePopupContent } from "./DemandFeaturePopupContent";
import HomeButton from "./HomeButton";
import Legend from "./Legend";
import Widget from "./Widget";
import WidgetContainer from "./WidgetContainer";
import { downloadDepotDemand } from "./downloadDepotDemand";
import { downloadDepots } from "./downloadDepots";
import GeocoderControl from "./geocoder-control";

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
const ENVIRONMENT = process.env.REACT_APP_HOME_URL;

type PopupInfo = {
  feature: Feature;
  x: number;
  y: number;
  lng: number;
  lat: number;
};

type MissingDepotInformation = {
  address: string;
  description: string;
  environment: string;
  location: string;
};

export type DepotsPageProps = {
  location: Location;
  isAdmin: Boolean;
};

export default function DepotsPage({ location, isAdmin }: DepotsPageProps) {
  const { getAccessTokenSilently } = useAuth0();

  const [depots, setDepots] = useState<FeatureCollection | undefined>();
  const [depotDemands, setDepotDemands] = useState<DepotDemand[] | undefined>(
    undefined
  );
  const [loadingDepots, setLoadingDepots] = useState<boolean>(true);
  const [loadingDepotDemands, setLoadingDepotDemands] = useState<boolean>(true);
  const [loadingAllDayDemand, setLoadingAllDayDemand] = useState(false);
  const [feederLines, setFeederLines] = useState<
    FeatureCollection | undefined
  >();
  const [feederLineDemands, setFeederLineDemands] = useState<
    FeederLineDemand[] | undefined
  >(undefined);
  const [loadingFeederLines, setLoadingFeederLines] = useState<boolean>(true);
  const [loadingFeederLineDemands, setLoadingFeederLineDemands] =
    useState<boolean>(true);
  const [activeLayers, setActiveLayers] = useState<("depots" | "feeders")[]>([
    "depots",
    "feeders",
  ]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | undefined>(undefined);

  const [depotCategory, setDepotCategory] = useState<DepotFilters[]>([]);
  const [filterOptions, setFilterOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [year, setYear] = useState<number>(2035);
  const [season, setSeason] = useState<Season>("winter");
  const [hour, setHour] = useState<number>(17);
  const [allDayCheckbox, setAllDayCheckbox] = useState<boolean>(false);
  const [cursor, setCursor] = useState<string>("auto");
  const [viewport, setViewport] = useState({
    latitude: location.center[0],
    longitude: location.center[1],
    zoom: location.zoom,
  });

  const [open, setOpen] = useState(false);
  const [snackColor, setSnackColor] = useState<AlertColor>("error");
  const [snackMessage, setSnackMessage] = useState<String>();

  // download data
  const [downloading, setDownloading] = useState(false);
  const [errorDownloading, setErrorDownloading] = useState(false);

  const stateAbbr = getStateAbbrFromStateName(location.name);
  const isTxPPC = ["TX", "CPS", "NBU", "LCRA", "AE"].includes(stateAbbr);
  const isFirstEnergy = ["FIRST_ENERGY"].includes(stateAbbr);

  const [energyOrPower, setEnergyOrPower] = useState<"energy" | "power">(
    "power"
  );

  const [growthScenarios, setGrowthScenarios] = useState<
    GrowthScenario[] | undefined
  >([]);
  const [selectedGrowthScenario, setSelectedGrowthScenario] = useState<
    GrowthScenario | undefined
  >(undefined);
  const [selectedGrowthScenarioId, setSelectedGrowthScenarioId] = useState<
    Number | undefined
  >(undefined);
  const scenarioId =
    selectedGrowthScenarioId !== undefined
      ? selectedGrowthScenarioId.toString()
      : "";
  const handleGrowthScenarioChange = (event: Event) => {
    if (growthScenarios === undefined) return;
    const selectedGrowthScenario = growthScenarios.find(
      (gs) => gs.id === Number((event.target as HTMLInputElement).value)
    );
    setSelectedGrowthScenario(selectedGrowthScenario);
    setSelectedGrowthScenarioId(selectedGrowthScenario?.id);
  };

  // animation
  const animationIntervalRef = useRef<number | null>(null);
  const [playingAnimation, setPlayingAnimation] = useState(false);
  const [hourlyDemandData, setHourlyDemandData] = useState<Object[]>([]);
  const [preloading, setPreloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [depoInfo, setDepotInfo] = useState<
    MissingDepotInformation | undefined
  >();
  const [loadingMissingReport, setLoadingMissingDepot] = useState(false);

  const handleChangeDepot = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setDepotInfo((prevState) => ({
      ...prevState!,
      [name]: value,
    }));
  };

  useEffect(() => {
    async function loadData() {
      const apiToken = await getAccessTokenSilently();
      const newGrowthScenarios = await loadDepotGrowthScenarios(
        apiToken,
        location
      );
      setGrowthScenarios(newGrowthScenarios);
      setSelectedGrowthScenario(newGrowthScenarios?.[0]);
      setSelectedGrowthScenarioId(newGrowthScenarios?.[0]?.id);
    }
    if (isTxPPC || isFirstEnergy) {
      loadData();
    }
  }, [getAccessTokenSilently, location, isTxPPC, isFirstEnergy]);

  useEffect(() => {
    if (isTxPPC) {
      const filter = [
        {
          label: "Registered Longhaul Fleets",
          value: "registered-longhaul-fleets",
        },
        {
          label: "Warehouse, Trucking and Distribution Center",
          value: "warehouse-distribution-trucking",
        },
        {
          label: "Highway Corridor",
          value: "highway-corridor",
        },
        {
          label: "Others",
          value: "others",
        },
      ];
      setFilterOptions(filter);
      setDepotCategory(filter.map((y) => y.value as DepotFilters));
    }

    if (isFirstEnergy) {
      const filter = [
        {
          label: "Registered Longhaul Fleets",
          value: "registered-longhaul-fleets",
        },
        {
          label: "Warehouse, Trucking and Distribution Center",
          value: "warehouse-distribution-trucking",
        },
        {
          label: "Municipal Fleets",
          value: "municipal-fleets",
        },
        {
          label: "Highway Corridor",
          value: "highway-corridor",
        },
        {
          label: "Others",
          value: "others",
        },
      ];
      setFilterOptions(filter);
      setDepotCategory(filter.map((y) => y.value as DepotFilters));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstEnergy, isTxPPC, location]);

  async function loadDepot() {
    const apiToken = await getAccessTokenSilently();
    setLoadingDepots(true);
    try {
      const depots = await loadDepots(
        stateAbbr,
        location.id,
        depotCategory.toString(),
        apiToken
      );
      setDepots(depots);
    } catch (error) {
      setSnackMessage("Failed to fetch depots.");
      setOpen(true);
      setDepots(undefined);
    }
    setLoadingDepots(false);
  }

  useEffect(() => {
    setDepots(undefined);
    loadDepot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    depotCategory,
    getAccessTokenSilently,
    location.id,
    stateAbbr,
    selectedGrowthScenario,
  ]);

  useEffect(() => {
    async function loadData() {
      const apiToken = await getAccessTokenSilently();
      setLoadingFeederLines(true);
      try {
        const feederLines = await loadFeederLines(stateAbbr, apiToken);
        setFeederLines(feederLines);
      } catch (error) {
        setSnackMessage("Failed to fetch feeder lines.");
        setOpen(true);
        setFeederLines(undefined);
      }
      setLoadingFeederLines(false);
    }
    if (!isTxPPC && !isFirstEnergy) {
      loadData();
    } else {
      setLoadingFeederLines(false);
    }
  }, [getAccessTokenSilently, isFirstEnergy, isTxPPC, stateAbbr]);

  useEffect(() => {
    async function loadData() {
      const apiToken = await getAccessTokenSilently();
      setLoadingFeederLineDemands(true);
      try {
        const feederLineDemands = await loadFeederLineDemand(
          apiToken,
          undefined,
          stateAbbr,
          year,
          hour
        );
        setFeederLineDemands(feederLineDemands);
      } catch (error) {
        setSnackMessage("Failed to fetch feeder line demand.");
        setOpen(true);
        setFeederLineDemands(undefined);
      }
      setLoadingFeederLineDemands(false);
    }
    if (feederLines !== undefined && !isTxPPC && !isFirstEnergy) {
      loadData();
    } else {
      setLoadingFeederLineDemands(false);
    }
  }, [
    getAccessTokenSilently,
    feederLines,
    hour,
    year,
    stateAbbr,
    isTxPPC,
    isFirstEnergy,
  ]);
  useDebouncedEffect(
    () => {
      if (
        [
          depots,
          hour,
          year,
          stateAbbr,
          isTxPPC,
          isFirstEnergy,
          scenarioId,
        ].some((value) => value === undefined)
      ) {
        return;
      }

      if (playingAnimation) {
        return;
      }

      async function loadData() {
        const apiToken = await getAccessTokenSilently();
        const hourParam = allDayCheckbox ? "all" : hour; // override hour if all day checkbox is checked
        setLoadingDepotDemands(true);
        setLoadingAllDayDemand(true);
        setDepotDemands(undefined);

        try {
          const [demand] = await Promise.all([
            loadDepotDemand(
              apiToken,
              undefined,
              stateAbbr,
              year,
              hourParam,
              scenarioId
            ),
          ]);

          setDepotDemands(demand);
        } catch (error) {
          console.error("Error loading demand data", error);
          setSnackMessage("Failed to fetch depot demand.");
          setOpen(true);
          setDepotDemands(undefined);
        } finally {
          setLoadingDepotDemands(false);
          setLoadingAllDayDemand(false);
        }

        setLoadingDepotDemands(false);
        setLoadingAllDayDemand(false);
      }
      if (depots !== undefined) {
        loadData();
      }
    },
    [
      getAccessTokenSilently,
      depots,
      hour,
      year,
      stateAbbr,
      isTxPPC,
      isFirstEnergy,
      scenarioId,
      allDayCheckbox,
    ],
    1000
  );

  let feederLinesWithDemand = useMemo(() => {
    if (feederLines !== undefined && feederLineDemands !== undefined) {
      const feederLinesCopy = structuredClone(feederLines);
      feederLineDemands.forEach((feederLineDemand: FeederLineDemand) => {
        const feederLine = feederLinesCopy!.features.find(
          (feederLine: Feature) =>
            feederLine.properties?.id === feederLineDemand.feeder_line_id
        );
        if (feederLine) {
          feederLine.properties!.demand = feederLineDemand;
        }
      });
      return feederLinesCopy;
    }
    return feederLines;
  }, [feederLines, feederLineDemands]);

  useEffect(() => {
    // when props.location changes, recenter on new location
    setViewport({
      latitude: location.center[0],
      longitude: location.center[1],
      zoom: location.zoom,
    });
  }, [location]);

  let depotsWithDemand = useMemo(() => {
    if (depots !== undefined && depotDemands !== undefined) {
      const depotsCopy = structuredClone(depots);
      depotDemands.forEach((depotDemand: DepotDemand) => {
        const depot = depotsCopy!.features.find(
          (depot: Feature) => depot.properties?.id === depotDemand.depot_id
        );
        if (depot) {
          depot.properties!.demand = depotDemand;
        }
      });
      return depotsCopy;
    }
    return depots;
  }, [depots, depotDemands]);

  const onClick = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const {
      features,
      point: { x, y },
      lngLat: { lng, lat },
    } = event;
    const hoveredFeature = features && features[0];

    setPopupInfo(hoveredFeature && { feature: hoveredFeature, x, y, lng, lat });
  }, []);

  const handleRecenterClick = () => {
    setViewport({
      latitude: location.center[0],
      longitude: location.center[1],
      zoom: location.zoom,
    });
  };
  const handleAllDayCheckboxChange = async (checked: boolean) => {
    if (checked) stopAnimating();
    setAllDayCheckbox(checked);
  };

  const handleHourChange = (hour: number) => {
    if (playingAnimation) stopAnimating();
    setHour(hour);
  };

  const handleYearChange = (year: number) => {
    setYear(year);
  };

  let demandKey;
  if (energyOrPower === "power") {
    demandKey = `power_demand_kw_${season}` as keyof DepotDemand;
  } else if (energyOrPower === "energy") {
    demandKey = `energy_demand_kwh_${season}` as keyof DepotDemand;
  }

  const colors: (string | number)[] = [
    0,
    "#111111",
    10,
    "#560000",
    50,
    "#980300",
    100,
    "#DF0D00",
    500,
    "#FE6800",
    1000,
    "#FFF75D",
    5000,
    "#FFFCAF",
  ];

  const depotLayerStyle: LayerProps = {
    id: "depot",
    type: "circle",
    paint: {
      "circle-radius": 4,
      "circle-color": [
        "interpolate-hcl",
        ["linear"],
        ["get", demandKey, ["get", "demand"]],
        ...colors,
      ],
    },
  };

  const feederLayerStyle: LayerProps = {
    id: "feeder",
    type: "line",
    paint: {
      "line-color": [
        "interpolate-hcl",
        ["linear"],
        ["get", demandKey, ["get", "demand"]],
        ...colors,
      ],
      "line-width": 2,
    },
  };

  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("auto"), []);

  const loading =
    loadingDepots ||
    loadingFeederLines ||
    loadingFeederLineDemands ||
    loadingAllDayDemand ||
    loadingDepotDemands ||
    loadingMissingReport;

  /* Data Download */
  const downloadDepotsHandler = async () => {
    const featureData: FeatureCollection | undefined = depots;
    if (featureData) {
      setDownloading(true);
      const downloadSuccess = await downloadDepots(featureData);
      setErrorDownloading(!downloadSuccess);
      setDownloading(false);
    }
  };

  const downloadDepoDemandsHandler = async () => {
    const featureData: DepotDemand[] | undefined = depotDemands;
    if (featureData) {
      setDownloading(true);
      const downloadSuccess = await downloadDepotDemand(
        featureData,
        allDayCheckbox
      );
      setErrorDownloading(!downloadSuccess);
      console.log(featureData, "featureData");
      setDownloading(false);
    }
  };

  const stopAnimating = () => {
    setPlayingAnimation(false);
  };

  const startAnimating = async () => {
    console.log("startAnimating");
    setPreloading(true);
    setHour(0);
    let hourlyFetchPromises: any[] = [];
    const apiToken = await getAccessTokenSilently();
    for (let hour = 0; hour < 24; hour++) {
      hourlyFetchPromises.push(
        loadDepotDemand(apiToken, undefined, stateAbbr, year, hour, scenarioId)
      );
    }
    let hourlyDemandData = await Promise.all(hourlyFetchPromises);
    setHourlyDemandData(hourlyDemandData);
    setPlayingAnimation(true);
    setPreloading(false);
  };

  /* Animation Stuff */
  const handleAnimationButtonClick = (event: Event) => {
    playingAnimation ? stopAnimating() : startAnimating();
  };

  useEffect(() => {
    if (playingAnimation) {
      const updateNextHour = async () => {
        setHour((prevHour) => (prevHour + 1) % 24);
      };
      let animationInterval = window.setInterval(updateNextHour, 1000);
      animationIntervalRef.current = animationInterval;
    } else {
      window.clearInterval(animationIntervalRef.current ?? undefined);
      animationIntervalRef.current = null;
    }
  }, [playingAnimation]);

  useEffect(() => {
    if (playingAnimation) {
      setDepotDemands(hourlyDemandData[hour] as DepotDemand[]);
      if (hour === 23) stopAnimating();
    }
  }, [hour, hourlyDemandData, playingAnimation]);

  const handleReportMissingDepotClick = () => {
    setShowModal(true);
  };

  const submitMissingDepot = async () => {
    if (!depoInfo || !depoInfo.address) {
      return;
    }
    setShowModal(false);
    const apiToken = await getAccessTokenSilently();
    setLoadingMissingDepot(true);
    try {
      depoInfo.environment = ENVIRONMENT || "unknown";
      depoInfo.location = stateAbbr;
      await sendMissingDepotReport(apiToken, depoInfo);
      setSnackColor("success");
      setSnackMessage("Successfully send the request.");
      setOpen(true);
    } catch (error) {
      setSnackColor("error");
      setSnackMessage("Something went wrong.");
      setOpen(true);
    }
    setDepotInfo(undefined);
    setLoadingMissingDepot(false);
  };

  return (
    <Stack direction={"row"} sx={{ height: "100%" }}>
      <Stack sx={{ width: "462px", height: "100%" }}>
        <ControlPanel
          year={year}
          onYearChange={handleYearChange}
          activeLayers={activeLayers}
          onActiveLayersChange={setActiveLayers}
          energyOrPower={energyOrPower}
          onEnergyOrPowerChange={setEnergyOrPower}
          season={season}
          onSeasonChange={setSeason}
          onAllDayCheckboxChange={handleAllDayCheckboxChange}
          onHourChange={handleHourChange}
          hour={hour}
          allDayCheckbox={allDayCheckbox}
          depotCategory={depotCategory}
          setDepotCategory={setDepotCategory}
          filterOptions={filterOptions}
          isTxPPC={isTxPPC || isFirstEnergy}
          growthScenarios={growthScenarios}
          selectedGrowthScenario={selectedGrowthScenario}
          onGrowthScenarioChange={handleGrowthScenarioChange}
          preloading={preloading}
          playingAnimation={playingAnimation}
          handleAnimationButtonClick={handleAnimationButtonClick}
          isPlayButtonHide={true}
          handleReportMissingDepotClick={handleReportMissingDepotClick}
        />
        {(isTxPPC || isFirstEnergy) && (
          <StickyBottomBox>
            <DownloadButton
              onClick={downloadDepotsHandler}
              error={errorDownloading}
              loading={downloading}
              innerText={"Download depots"}
            />
            <DownloadButton
              onClick={downloadDepoDemandsHandler}
              error={errorDownloading}
              loading={downloading}
              innerText={"Download depot demands"}
            />
          </StickyBottomBox>
        )}
      </Stack>
      <Box sx={{ height: "100%", flex: 1, position: "relative" }}>
        <WidgetContainer>
          <Widget sx={{ width: "200px" }}>
            {energyOrPower === "power" ? (
              <Legend title={"Power"} colors={colors} units={"kW"} />
            ) : (
              <Legend title={"Energy"} colors={colors} units={"kWh"} />
            )}
          </Widget>
        </WidgetContainer>
        <Box sx={{ height: "100%" }} id={"map"} position={"relative"}>
          <Backdrop
            sx={{
              color: "#FFFFFF",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              position: "absolute",
            }}
            open={loading}
          >
            <Stack alignItems={"center"} spacing={2}>
              <CircularProgress color="inherit" />
              <Collapse in={loadingDepots}>
                <Typography variant="h3">Loading depots...</Typography>
              </Collapse>
              <Collapse in={loadingDepotDemands}>
                <Typography variant="h3">Loading depot demand...</Typography>
              </Collapse>
              <Collapse in={loadingFeederLines}>
                <Typography variant="h3">Loading feeder lines...</Typography>
              </Collapse>
              <Collapse in={loadingMissingReport}>
                <Typography variant="h3">
                  Submitting missing depot...
                </Typography>
              </Collapse>
              <Collapse in={loadingFeederLineDemands}>
                <Typography variant="h3">
                  Loading feeder line demand...
                </Typography>
              </Collapse>
            </Stack>
          </Backdrop>
          <Map
            {...viewport}
            onMove={(evt) => setViewport(evt.viewState)}
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            onClick={onClick}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            interactiveLayerIds={[
              depotLayerStyle.id || "",
              feederLayerStyle.id || "",
            ]}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            cursor={cursor}
          >
            <GeocoderControl
              mapboxAccessToken={MAPBOX_ACCESS_TOKEN ?? ""}
              position="top-left"
            />
            <NavigationControl position={"top-left"} />
            <HomeButton
              // when the location changes, we need to render a new HomeButton
              // because otherwise the listeners do not get updated with the new
              // value of location. The HomeButton's onRemove() will remove the
              // previous element from the map
              key={location.name}
              onClick={handleRecenterClick}
            />
            {activeLayers.includes("depots") && (
              <Source id="depots" type="geojson" data={depotsWithDemand}>
                <Layer beforeId="waterway-label" {...depotLayerStyle} />
              </Source>
            )}
            {activeLayers.includes("feeders") && (
              <Source
                id="feeder-lines"
                type="geojson"
                data={feederLinesWithDemand}
              >
                <Layer beforeId="waterway-label" {...feederLayerStyle} />
              </Source>
            )}
            {popupInfo && (
              <Popup
                longitude={popupInfo.lng}
                latitude={popupInfo.lat}
                onClose={() => setPopupInfo(undefined)}
                maxWidth={"none"}
                closeButton={false}
              >
                <DemandFeaturePopupContent
                  isAdmin={isAdmin}
                  feature={popupInfo.feature}
                  year={year}
                  state={stateAbbr}
                  setSnackColor={(color: AlertColor) => setSnackColor(color)}
                  setPopupInfo={() => setPopupInfo(undefined)}
                  setSnackMessage={(msg: string) => setSnackMessage(msg)}
                  setOpen={(data: boolean) => setOpen(data)}
                  isTxPPC={isTxPPC || isFirstEnergy}
                  loadDepot={() => loadDepot()}
                  scenarioId={scenarioId}
                />
              </Popup>
            )}
          </Map>
        </Box>
        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setOpen(false)}
            severity={snackColor}
            sx={{ width: "100%" }}
          >
            {snackMessage}
          </Alert>
        </Snackbar>
        <Dialog
          open={showModal}
          onClose={setShowModal}
          fullWidth
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle sx={{ fontWeight: 500 }} id="alert-dialog-title">
            Add missing depot
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container rowSpacing={2} direction={"column"}>
              <Grid item md={4}>
                <TextField
                  type="text"
                  name="address"
                  required
                  onChange={handleChangeDepot}
                  label="Address"
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item md={8}>
                <TextField
                  type="text"
                  name="description"
                  onChange={handleChangeDepot}
                  label="Description"
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)} color="inherit">
              CANCEL
            </Button>
            <Button variant="outlined" onClick={() => submitMissingDepot()}>
              SUBMIT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Stack>
  );
}
