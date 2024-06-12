import { useAuth0 } from "@auth0/auth0-react";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DownloadIcon from "@mui/icons-material/Download";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormGroup,
  FormLabel,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTour } from "@reactour/tour";
import Color from "colorjs.io";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import ReactDOMServer from "react-dom/server";

import HelpTooltip from "components/HelpTooltip";
import InputSlider from "components/InputSlider";

import { loadChargingStationNetworks } from "api/charging_station";
import { loadChargingCapacity, loadDemand } from "api/demand";
import { loadJustice40 } from "api/demographics";
import { loadGrowthScenario } from "api/growth_scenario";
import { loadOverlays } from "api/overlays";
import { loadSiteCollections, loadSites } from "api/sites";
import EvInSitesLogo from "components/EvInSitesLogo";
import MapComponent from "dashboard/Map";
import {
  GenericGeoJsonFeaturePopupContent,
  Justice40PopupContent,
  SchoolDistrictPopupContent,
} from "dashboard/PopupContent";
import ChargerAccessControl from "dashboard/controls/ChargerAccessControl";
import ChargerLevelControl from "dashboard/controls/ChargerLevelControl";
import { useDebouncedEffect } from "dashboard/useDebouncedEffect";
import { getLightDutyVehicleClass } from "types/growth-scenario";
import { range } from "utils/array";
import {
  calculateCoveragePercentage,
  scaleChargingCapacityByUtilization,
} from "utils/coverage";
import { scaleDemandByGrowthScenarioYear } from "utils/demand";
import { createSafeFilename, downloadCsv } from "utils/file";
import YearControl from "../controls/YearControl";
import UploadSiteCollectionModal from "./UploadSiteCollectionModal";

const EXCLUSIVE_EV_NETWORKS = [
  "Tesla",
  "Tesla Destination",
  "RIVIAN_ADVENTURE",
];

function createAustinEnergyOverlay(geoJSON) {
  return {
    geoJSON: geoJSON,
    options: {
      style: {
        stroke: true,
        color: "#F05F2B",
        fillOpacity: 0.1,
        weight: 3,
      },
      onEachFeature: (feature, layer) => {
        layer.on("click", function (event) {
          layer.bindPopup(
            ReactDOMServer.renderToString(
              <GenericGeoJsonFeaturePopupContent feature={feature} />
            )
          );
          layer.openPopup();
        });
      },
    },
    name: geoJSON.properties.name,
  };
}

function createBluebonnetEnergyOverlay(geoJSON) {
  return {
    geoJSON: geoJSON,
    options: {
      style: {
        stroke: true,
        color: "#1267B2",
        fillOpacity: 0.1,
        weight: 3,
      },
      onEachFeature: (feature, layer) => {
        layer.on("click", function (event) {
          layer.bindPopup(
            ReactDOMServer.renderToString(
              <GenericGeoJsonFeaturePopupContent feature={feature} />
            )
          );
          layer.openPopup();
        });
      },
    },
    name: geoJSON.properties.name,
  };
}

function createSchoolDistrictOverlay(geoJSON) {
  const greenRed = new Color("green").range("red", {
    space: "lch",
    outputSpace: "srgb",
  });
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    div.innerHTML = ReactDOMServer.renderToString(
      <>
        <h4>
          Students Eligible for
          <br />
          Reduced Lunch
        </h4>
        <h5>Percentage</h5>
        <Box
          sx={{
            display: "grid",
            alignContent: "space-between",
            justifyContent: "center",
            gridTemplateColumns: "18px auto",
            gap: "10px",
            width: "100%",
            height: "100px",
          }}
        >
          <Box
            sx={{
              gridRow: "1 / 6",
              background:
                "linear-gradient(0deg, rgba(0,128,0,0.8) 0%, rgba(96,124,0,0.8) 25%, rgba(142,117,0,0.8) 50%, rgba(188,101,0,0.8) 75%, rgba(255,0,0,0.8) 100%);",
            }}
          ></Box>
          <Typography
            sx={{
              position: "relative",
              top: "-5px",
              gridColumn: 2,
              gridRow: 1,
            }}
          >
            100%
          </Typography>
          <Typography
            sx={{
              position: "relative",
              bottom: "-5px",
              gridColumn: 2,
              gridRow: 5,
            }}
          >
            0%
          </Typography>
        </Box>
      </>
    );
    return div;
  };

  return {
    name: "School Districts",
    geoJSON: geoJSON,
    legend: legend,
    options: {
      style: (feature) => {
        // nullish coalescer so some block groups don't report super-dense
        let fractionReducedEligible =
          feature.properties?.reduced_eligible_fraction ?? 0;
        let color = greenRed(fractionReducedEligible);
        return {
          stroke: true,
          color: color,
          fillOpacity: 0.1,
          weight: 3,
        };
      },
      onEachFeature: (feature, layer) => {
        layer.on("click", function (event) {
          layer.bindPopup(
            ReactDOMServer.renderToString(
              <SchoolDistrictPopupContent feature={feature} />
            )
          );
          layer.openPopup();
        });
      },
    },
  };
}

function createJustice40Overlay(geoJSON) {
  return {
    geoJSON: geoJSON,
    options: {
      style: {
        color: "blue",
        fillOpacity: 0.25,
        weight: 0.5,
        pane: "demographics",
      },
      onEachFeature: (feature, layer) => {
        layer.on("click", function (event) {
          layer.bindPopup(
            ReactDOMServer.renderToString(
              <Justice40PopupContent feature={feature} />
            )
          );
          layer.openPopup();
        });
      },
    },
    name: "Justice40: Clean Transit Disadvantaged",
  };
}

function createOverlay(geoJSON) {
  switch (geoJSON?.properties?.name) {
    case "School Districts":
      return createSchoolDistrictOverlay(geoJSON);
    case "Austin Energy Service Territory":
      return createAustinEnergyOverlay(geoJSON);
    case "Bluebonnet Electric Cooperative Service Territory":
      return createBluebonnetEnergyOverlay(geoJSON);
    case "Justice 40":
      return createJustice40Overlay(geoJSON);
    default:
  }
}

function totalScore(site, siteRankWeights) {
  const { chargerCoverageRank, justiceFlagRank, scoreRank } = site.properties;
  const weightedCcRank = chargerCoverageRank * siteRankWeights.chargerCoverage;
  const weightedJusticeRank = justiceFlagRank * siteRankWeights.justice40;
  const weightedScoreRank = scoreRank * siteRankWeights.score;
  return weightedCcRank + weightedJusticeRank + weightedScoreRank;
}

function download(filename, scoredSites, siteRankWeights) {
  const formattedData = [];

  scoredSites.features.forEach((site) => {
    const formatted = {};
    formatted["name"] = site.properties.name;
    formatted[`user score (weight ${siteRankWeights.score})`] =
      site.properties.score;
    formatted[
      `site is in Justice40 region? (weight ${siteRankWeights.justice40})`
    ] = site.properties.justiceFlag;
    formatted[
      `charger coverage percentage (weight ${siteRankWeights.chargerCoverage})`
    ] = site.properties.chargerCoverage * 100;
    formatted["overall ranking"] = site.properties.rank;
    formattedData.push(formatted);
  });

  downloadCsv(formattedData, filename);
}

function SitesPage(props) {
  const { getAccessTokenSilently } = useAuth0();
  const utilization = 0.1;

  const [loadingChargingCapacity, setLoadingChargingCapacity] = useState(false);
  const [chargingCapacity, setChargingCapacity] = useState({});
  const [loadingSites, setLoadingSites] = useState(false);
  const [demand, setDemand] = useState({});
  const [loadingDemand, setLoadingDemand] = useState(false);
  const [allDayDemand, setAllDayDemand] = useState({});
  const [loadingAllDayDemand, setLoadingAllDayDemand] = useState(false);
  const [siteCollections, setSiteCollections] = useState([]);
  const [selectedSiteCollection, setSelectedSiteCollection] = useState(null);
  const [sitesFeatureCollection, setSitesFeatureCollection] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [selectedSites, setSelectedSites] = useState([]);
  const [refreshData, setRefreshData] = useState(true);
  const [addSiteCollectionModalOpen, setAddSiteCollectionModalOpen] =
    useState(false);
  const [siteRankWeights, setSiteRankWeights] = useState({
    score: 5,
    justice40: 5,
    chargerCoverage: 5,
  });

  const [overlays, setOverlays] = useState([]);

  // coverage selectors
  const [includePrivateChargers, setIncludePrivateChargers] = useState(false);
  const [includeExclusiveNetworks, setIncludeExclusiveNetworks] =
    useState(false);
  const [selectedChargerLevels, setSelectedChargerLevels] = useState([
    "l1",
    "l2",
    "dcf",
  ]);
  const [evNetworks, setEvNetworks] = useState([]);
  const [mapRenderKey, setMapRenderKey] = useState(0);

  useEffect(() => {
    const loadNetworks = async () => {
      const token = await getAccessTokenSilently();
      const evNetworks = await loadChargingStationNetworks(token);
      setEvNetworks(evNetworks);
    };
    loadNetworks();
  }, [
    getAccessTokenSilently,
    props.location,
    props.selectedChargingDemandSimulation,
  ]);

  useDebouncedEffect(
    () => {
      // don't attempt to load data if any dependencies are not yet defined,
      // as this side effect relies on other side effects loading data into
      // dependencies
      if (
        [props.selectedChargingDemandSimulation].some(
          (value) => value === undefined
        )
      ) {
        return;
      }
      async function loadData() {
        const apiToken = await getAccessTokenSilently();
        setLoadingDemand(true);
        setLoadingAllDayDemand(true);
        try {
          const demand = await loadDemand(
            props.selectedChargingDemandSimulation.id,
            ["Public", "Office"],
            "all",
            props.location?.id,
            apiToken
          );
          setDemand(demand);
          setAllDayDemand(demand);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingDemand(false);
          setLoadingAllDayDemand(false);
        }
        setLoadingDemand(false);
        setLoadingAllDayDemand(false);
      }
      loadData();
    },
    [
      getAccessTokenSilently,
      props.selectedChargingDemandSimulation,
      props.location,
    ],
    1000
  );

  useDebouncedEffect(
    () => {
      async function loadData() {
        setLoadingChargingCapacity(true);
        const apiToken = await getAccessTokenSilently();
        const access = includePrivateChargers
          ? ["public", "private"]
          : ["public"];
        const evNetworksToUse = includeExclusiveNetworks
          ? evNetworks
          : evNetworks.filter(
              (evNetwork) => !EXCLUSIVE_EV_NETWORKS.includes(evNetwork)
            );
        let chargingCapacity = await loadChargingCapacity(
          props.selectedChargingDemandSimulation.id,
          selectedChargerLevels,
          evNetworksToUse,
          access,
          apiToken
        );
        setChargingCapacity(chargingCapacity);
        setLoadingChargingCapacity(false);
      }
      if (props.selectedChargingDemandSimulation) {
        loadData();
      }
    },
    [
      getAccessTokenSilently,
      props.selectedChargingDemandSimulation,
      evNetworks,
      selectedChargerLevels,
      includePrivateChargers,
      includeExclusiveNetworks,
    ],
    1000
  );

  useEffect(() => {
    async function loadData() {
      const apiToken = await getAccessTokenSilently();
      const siteCollections = await loadSiteCollections(apiToken);
      setSiteCollections(siteCollections);
      setSelectedSiteCollection(siteCollections[siteCollections.length - 1]);
      setRefreshData(false);
    }
    if (refreshData) {
      loadData();
    }
  }, [refreshData, getAccessTokenSilently]);

  useEffect(() => {
    async function loadData() {
      setLoadingSites(true);
      const apiToken = await getAccessTokenSilently();
      const access = includePrivateChargers
        ? ["public", "private"]
        : ["public"];
      const evNetworksToUse = includeExclusiveNetworks
        ? evNetworks
        : evNetworks.filter(
            (evNetwork) => !EXCLUSIVE_EV_NETWORKS.includes(evNetwork)
          );
      let sites = { type: "FeatureCollection", features: [] };
      try {
        sites = await loadSites(
          selectedSiteCollection,
          props.selectedChargingDemandSimulation.id,
          selectedChargerLevels,
          evNetworksToUse,
          access,
          apiToken
        );
      } catch (e) {
        // not error handling for now
      }
      setSitesFeatureCollection(sites);
      setLoadingSites(false);
    }
    if (selectedSiteCollection) {
      loadData();
    }
  }, [
    getAccessTokenSilently,
    props.selectedChargingDemandSimulation,
    selectedSiteCollection,
    evNetworks,
    selectedChargerLevels,
    includePrivateChargers,
    includeExclusiveNetworks,
  ]);

  const handleSelectedChargerLevelsChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      let newSelectedPlugTypes = [...selectedChargerLevels];
      newSelectedPlugTypes.push(value);
      setSelectedChargerLevels(newSelectedPlugTypes);
    } else {
      let newSelectedPlugTypes = selectedChargerLevels.filter(
        (e) => e !== value
      );
      setSelectedChargerLevels(newSelectedPlugTypes);
    }
  };

  const handleSiteRankWeightsChange = (parameter, newWeight) => {
    setSelectedSites([]);
    const newSiteRankWeights = { ...siteRankWeights };
    newSiteRankWeights[parameter] = newWeight;
    setSiteRankWeights(newSiteRankWeights);
  };

  const handleSiteCollectionChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedSiteCollection(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const scoredSites = {
    type: "FeatureCollection",
    features: sitesFeatureCollection.features.map((site) => {
      const propertyScore = totalScore(site, siteRankWeights);
      site.properties.totalScore = propertyScore;
      site.id = site.properties.id;
      return site;
    }),
  };
  // sort sites by score and add rank property
  scoredSites.features.sort(
    (a, b) => b.properties.totalScore - a.properties.totalScore
  );
  scoredSites.features.forEach((site, index) => {
    if (
      index > 0 &&
      site.properties.totalScore ===
        scoredSites.features[index - 1].properties.totalScore
    ) {
      site.properties["rank"] =
        scoredSites.features[index - 1].properties["rank"];
    } else {
      site.properties["rank"] = index + 1;
    }
  });

  const tableColumns = [
    { field: "rank", headerName: "Rank", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
  ];

  const tableRows = scoredSites.features.map((site) => {
    return {
      id: site.properties.id,
      name: site.properties.name,
      rank: site.properties.rank,
    };
  });

  const scoreHelpText = (
    <span>
      The score provided for each site when this site list was uploaded.
    </span>
  );

  const coverageHelpText = (
    <>
      <span>
        The percentage of charging demand in the area that can be addressed
        through existing charging infrastructure (including public charging in
        area).
      </span>
      <br />
      <span>Lower charger coverage scores higher.</span>
    </>
  );

  const environmentalJusticeHelpText = (
    <>
      <span>
        Whether or not a site lies within a region designated as Clean Transit
        Disadvantaged according to the Federal Council of Environmental Quality
        Justice40 Clean Transit Pathway:
      </span>
      <br />
      <a href={"https://screeningtool.geoplatform.gov/en/methodology"}>
        Methodology & data - Climate & Economic Justice Screening Tool
        (geoplatform.gov)
      </a>
      <br />
      <span>Being disadvantaged scores higher.</span>
    </>
  );

  const { setIsOpen, setSteps, setCurrentStep } = useTour();
  const tourSteps = [
    {
      selector: "#map",
      content: (
        <>
          <Typography>
            The sites page displays a list of user-defined sites on the map and
            provides tools for evaluating them according to a variety of
            parameters.
          </Typography>
          <br />
          <Typography>
            <a
              href={
                "https://docs.google.com/document/d/14pLN3OYqK6KaL3Hi4geT8ghBQd85BDmA1HCFo3ptd-8/edit?usp=sharing"
              }
              target="_blank"
              rel="noreferrer"
            >
              Click here
            </a>{" "}
            for a detailed user guide.
          </Typography>
        </>
      ),
    },
    {
      selector: ".site-list-selector",
      content: (
        <Typography>
          The displayed list of sites can be selected here.
        </Typography>
      ),
    },
    {
      selector: ".new-site-list-button",
      content: (
        <Typography>
          A new list of sites can be uploaded by clicking this button.
        </Typography>
      ),
    },
    {
      selector: ".download-button",
      content: (
        <Typography>
          A CSV file of the currently displayed sites and their rankings can be
          downloaded by clicking this button.
        </Typography>
      ),
    },
    {
      selector: ".weight-controls",
      content: (
        <Typography>
          You can control how strongly various factors are considered in the
          total score calculation by adjusting the sliders.
        </Typography>
      ),
    },
    {
      selector: ".sites-legend",
      content: (
        <Typography>
          Sites are scored according to the provided weights and drawn on the
          map. Green properties have a higher score while red properties have a
          lower score. Higher scores are better candidates for charging
          infrastructure installation.
        </Typography>
      ),
    },
    {
      selector: ".sites-table",
      content: (
        <Typography>
          All sites in the current list are displayed in this table. You can
          click a site to go to it on the map. They are ranked in order, from
          highest score to lowest score.
        </Typography>
      ),
    },
    {
      selector: ".charger-controls",
      content: (
        <Typography>
          The coverage provided by chargers of different types and access levels
          can be controlled here. All chargers are assumed to have 10%
          utilization, i.e. they are being used 10% of the time.
        </Typography>
      ),
    },
    {
      selector: ".year-control",
      content: (
        <Typography>
          The projected EV charging demand for a given year can be selected
          here. Note that the existing EV infrastructure will always be for the
          infrastructure that exists today and is not configurable.
        </Typography>
      ),
    },
    {
      selector: ".leaflet-control-layers-toggle",
      content: (
        <Typography>
          The available map overlays can be toggled under this panel.
        </Typography>
      ),
    },
    {
      selector: 'a[title="Enter address"]',
      content: (
        <Typography>
          You can search for an address with this search button.
        </Typography>
      ),
    },
    {
      selector: ".recenter-button",
      content: (
        <Typography>
          Recenter the map at any time by clicking this button.
        </Typography>
      ),
    },
  ];

  const handleIncludePrivateChargersChange = (event) => {
    setIncludePrivateChargers(!includePrivateChargers);
  };

  const handleIncludeExclusiveNetworksChange = (event) => {
    setIncludeExclusiveNetworks(!includeExclusiveNetworks);
  };

  // Leaflet is hard to render and freezes the application. This is a separate state that is set on a delay so that
  // the entire application doesn't freeze when the year slider is being changed
  const [scaleYear, setScaleYear] = useState(props.year);
  useDebouncedEffect(
    () => {
      setScaleYear(props.year);
    },
    [props.year],
    1000
  );

  const [growthScenario, setGrowthScenario] = useState(undefined);
  const [loadingGrowthScenario, setLoadingGrowthScenario] = useState(false);
  useEffect(() => {
    async function loadData() {
      setLoadingGrowthScenario(true);
      const apiToken = await getAccessTokenSilently();
      // hard-coded 50% by 30 scenario. Fixing will probably require some new
      //database stuff to encode "defaults" and ownership around that.
      const growthScenarioId = props.location.name === "Austin" ? 2311 : 1;
      setGrowthScenario(await loadGrowthScenario(growthScenarioId, apiToken));
      setLoadingGrowthScenario(false);
    }
    loadData();
  }, [getAccessTokenSilently, props.location]);

  useEffect(() => {
    async function loadData() {
      setOverlays([]);
      // force map re-load in order to drop overlays
      setMapRenderKey((mapRenderKey) => mapRenderKey + 1);
      const apiToken = await getAccessTokenSilently();
      let overlays = [];
      if (props.location?.name === "Austin") {
        const geoJsonOverlays = await loadOverlays(apiToken);

        overlays = geoJsonOverlays.map((geoJsonOverlay) =>
          createOverlay(geoJsonOverlay)
        );
      }
      let justice40 = { type: "FeatureCollection", features: [] };
      try {
        justice40 = await loadJustice40("Texas", apiToken);
      } catch (e) {
        // not error handling for now
      }
      justice40.properties = {};
      justice40.properties.name = "Justice 40";
      const justice40Overlay = createOverlay(justice40);
      overlays.push(justice40Overlay);
      setOverlays(overlays);
    }
    loadData();
  }, [getAccessTokenSilently, props.location]);

  const lightDutyVehicleClass =
    growthScenario !== undefined
      ? getLightDutyVehicleClass(growthScenario)
      : undefined;

  const scaledDemand = useMemo(() => {
    if (
      lightDutyVehicleClass?.annualData !== undefined &&
      scaleYear !== undefined
    ) {
      const allDayDemandSum = Number(
        Object.values(allDayDemand).reduce(
          (sum, val) => Number(sum) + Number(val),
          0
        )
      );
      return scaleDemandByGrowthScenarioYear(
        lightDutyVehicleClass.annualData,
        scaleYear,
        demand,
        allDayDemandSum,
        ["Public", "Office"]
      );
    }
  }, [lightDutyVehicleClass, scaleYear, demand, allDayDemand]);
  const scaledChargingCapacity = useMemo(
    () => scaleChargingCapacityByUtilization(chargingCapacity, utilization),
    [chargingCapacity, utilization]
  );
  const coveragePercentage = useMemo(
    () => calculateCoveragePercentage(scaledDemand, scaledChargingCapacity),
    [scaledDemand, scaledChargingCapacity]
  );

  const showSitesOutsideRegionAlert = scoredSites?.features?.length === 0;

  const loading =
    props.loading ||
    loadingSites ||
    loadingChargingCapacity ||
    loadingDemand ||
    loadingAllDayDemand ||
    loadingGrowthScenario ||
    scaleYear !== props.year;

  return (
    <Stack direction={"row"} sx={{ height: "100%" }}>
      <Stack
        sx={{
          width: "462px",
          height: "100%",
          padding: "30px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ paddingBottom: "1em" }}>
          <Stack direction={"row"} alignItems={"center"} spacing={2}>
            <Box sx={{ width: "200px" }}>
              <EvInSitesLogo />
            </Box>
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
        </Box>
        <Stack spacing={2} alignItems divider={<Divider />}>
          <Stack spacing={2}>
            <Stack direction={"row"} alignItems={"center"}>
              <FormControl
                sx={{ flexGrow: "1" }}
                className="site-list-selector"
              >
                <InputLabel>Site Lists</InputLabel>
                <Select
                  label={"Site Lists"}
                  value={selectedSiteCollection || ""}
                  onChange={handleSiteCollectionChange}
                >
                  {siteCollections.map((siteCollection) => {
                    return (
                      <MenuItem key={siteCollection.id} value={siteCollection}>
                        <ListItemText primary={siteCollection.name} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <Box>
                <Tooltip title="Add a new site list">
                  <IconButton
                    onClick={() => setAddSiteCollectionModalOpen(true)}
                    size="large"
                    className="new-site-list-button"
                  >
                    <AddBoxIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download the currently displayed sites data">
                  <IconButton
                    onClick={() =>
                      download(
                        createSafeFilename(
                          `ev-insites_report_${
                            selectedSiteCollection.name
                          }_${new Date().toISOString()}.csv`
                        ),
                        scoredSites,
                        siteRankWeights
                      )
                    }
                    className={"download-button"}
                  >
                    <DownloadIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
            {showSitesOutsideRegionAlert && (
              <Alert severity="warning">
                No sites from this list are part of the currently displayed
                region.
              </Alert>
            )}
          </Stack>
          <Stack spacing={1} className="weight-controls">
            <Typography variant="h3">Ranking Weights</Typography>
            <FormGroup>
              <FormControl>
                <HelpTooltip title={scoreHelpText}>
                  <FormLabel>User Score</FormLabel>
                </HelpTooltip>
                <Box className="user-score-weight-control">
                  <InputSlider
                    value={siteRankWeights.score}
                    min={0}
                    max={10}
                    onChange={(value) =>
                      handleSiteRankWeightsChange("score", value)
                    }
                  />
                </Box>
              </FormControl>
              <FormControl>
                <HelpTooltip title={environmentalJusticeHelpText}>
                  <FormLabel>Environmental Justice</FormLabel>
                </HelpTooltip>
                <Box className="env-justice-weight-control">
                  <InputSlider
                    value={siteRankWeights.justice40}
                    min={0}
                    max={10}
                    onChange={(value) =>
                      handleSiteRankWeightsChange("justice40", value)
                    }
                  />
                </Box>
              </FormControl>
              <FormControl>
                <HelpTooltip title={coverageHelpText}>
                  <FormLabel>Charger Coverage</FormLabel>
                </HelpTooltip>
                <Box className="charger-coverage-weight-control">
                  <InputSlider
                    value={siteRankWeights.chargerCoverage}
                    min={0}
                    max={10}
                    onChange={(value) =>
                      handleSiteRankWeightsChange("chargerCoverage", value)
                    }
                  />
                </Box>
              </FormControl>
            </FormGroup>
          </Stack>
          <Stack spacing={1} flexGrow={1} className="sites-table">
            <Typography variant="h3">Site Rankings</Typography>
            <Box sx={{ minHeight: 370, height: "100%", width: "100%" }}>
              <DataGrid
                rows={tableRows}
                columns={tableColumns}
                hideFooterSelectedRowCount={true}
                rowsPerPageOptions={[100]}
                onSelectionModelChange={(newSelectionModel) =>
                  setSelectedSites(newSelectionModel)
                }
                selectionModel={selectedSites}
              />
            </Box>
          </Stack>
          <Box className={"charger-controls"}>
            <Stack spacing={1}>
              <HelpTooltip
                title={
                  "Select which chargers contribute to the charger coverage calculation. Utilization is assumed to be 10% of 24 hours."
                }
              >
                <Typography variant="h3">Charger Coverage Controls</Typography>
              </HelpTooltip>
              <YearControl
                value={props.year}
                years={range(2020, 2051)}
                onChange={props.onYearChange}
              />
              <ChargerLevelControl
                selectedChargerLevels={selectedChargerLevels}
                onChange={handleSelectedChargerLevelsChange}
              />
              <ChargerAccessControl
                includePrivateChargers={includePrivateChargers}
                onIncludePrivateChargersChange={
                  handleIncludePrivateChargersChange
                }
                includeExclusiveNetworks={includeExclusiveNetworks}
                onIncludeExclusiveNetworksChange={
                  handleIncludeExclusiveNetworksChange
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Stack>
      <UploadSiteCollectionModal
        open={addSiteCollectionModalOpen}
        onClose={() => setAddSiteCollectionModalOpen(false)}
        refreshSiteCollections={() => setRefreshData(true)}
      />
      <MapComponent
        key={mapRenderKey}
        loading={loading}
        blockGroups={props.blockGroups}
        demand={props.demand}
        existingChargerCoverage={coveragePercentage}
        utilization={props.utilization}
        offPeakPricePerKwh={props.offPeakPricePerKwh}
        peakPricePerKwh={props.peakPricePerKwh}
        chargingStations={props.chargingStations}
        substations={props.substations}
        demographics={props.demographics}
        location={props.location}
        currentView={"sites"}
        useDemandDensity={props.useDemandDensity}
        sites={scoredSites}
        selectedSites={selectedSites}
        setSelectedSites={setSelectedSites}
        overlays={overlays}
      />
    </Stack>
  );
}

export default SitesPage;
