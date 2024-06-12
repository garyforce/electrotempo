import { useTour } from "@reactour/tour";
import MapComponent from "dashboard/Map";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { useAuth0 } from "@auth0/auth0-react";
import { loadChargingStationNetworks } from "api/charging_station";
import { loadChargingCapacity } from "api/demand";
import { loadDemand } from "api/demand.js";
import EvPenetration from "components/EvPenetration";
import HelpTooltip from "components/HelpTooltip";
import ChargerAccessControl from "dashboard/controls/ChargerAccessControl";
import ChargerLevelControl from "dashboard/controls/ChargerLevelControl";
import DownloadButton from "dashboard/controls/DownloadButton";
import StickyBottomBox from "dashboard/controls/StickyBottomBox";
import { useDebouncedEffect } from "dashboard/useDebouncedEffect";
import { FeatureCollection } from "geojson";
import { Ac } from "types/ac";
import { ChargingDemandSimulation } from "types/charging-demand-simulation";
import {
  GrowthScenario,
  getLightDutyVehicleClass,
} from "types/growth-scenario";
import { Location } from "types/location";
import { TrafficModel } from "types/traffic-model";
import { range } from "utils/array";
import {
  calculateCoveragePercentage,
  scaleChargingCapacityByUtilization,
} from "utils/coverage";
import { scaleDemandByGrowthScenarioYear } from "utils/demand";
import AccessControl from "../AccessControl";
import GrowthScenarioControl from "../controls/GrowthScenarioControl";
import SeasonControl from "../controls/SeasonControl";
import UtilizationControl from "../controls/UtilizationControl";
import YearControl from "../controls/YearControl";
import { downloadStations } from "./downloadStation";
import { getStateAbbrFromStateName } from "utils/state-abbr";

const EXCLUSIVE_EV_NETWORKS = [
  "Tesla",
  "Tesla Destination",
  "RIVIAN_ADVENTURE",
];

export type CoveragePageProps = {
  location?: Location;
  ac?: Ac;
  onAcChange?: (newAc: Ac) => void;
  year?: number;
  onYearChange?: (event: Event) => void;
  growthScenarios?: GrowthScenario[];
  selectedGrowthScenario?: GrowthScenario;
  onGrowthScenarioChange?: (event: Event) => void;
  selectedTrafficModelId?: number;
  selectedTrafficModel?: TrafficModel;
  chargingDemandSimulations?: ChargingDemandSimulation[];
  blockGroups?: FeatureCollection;
  demographics?: any;
  chargingStations?: any;
  substations?: any;
  selectedChargingDemandSimulation?: any;
  loading?: boolean;
};

function CoveragePage(props: CoveragePageProps) {
  const { setIsOpen, setSteps, setCurrentStep } = useTour();
  const { getAccessTokenSilently } = useAuth0();

  const [loadingChargingCapacity, setLoadingChargingCapacity] = useState(false);
  const [chargingCapacity, setChargingCapacity] = useState({});
  const [utilization, setUtilization] = useState<number>(0.3);

  // download data
  const [downloading, setDownloading] = useState(false);
  const [errorDownloading, setErrorDownloading] = useState(false);

  const [demand, setDemand] = useState({});
  const [loadingDemand, setLoadingDemand] = useState(false);

  const [allDayDemand, setAllDayDemand] = useState({});
  const [loadingAllDayDemand, setLoadingAllDayDemand] = useState(false);

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

  const lightDutyVehicleClass =
    props.selectedGrowthScenario !== undefined
      ? getLightDutyVehicleClass(props.selectedGrowthScenario)
      : undefined;

  const currentYearVehicleClassData =
    lightDutyVehicleClass?.annualData !== undefined
      ? lightDutyVehicleClass?.annualData?.find(
          (yearData) => yearData.year === props.year
        )
      : undefined;

  const handleUtilizationChange = (utilization: number) => {
    setUtilization(utilization);
  };

  const handleSelectedChargerLevelsChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const { value } = event.target as HTMLInputElement;
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

  const handleIncludePrivateChargersChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setIncludePrivateChargers(!includePrivateChargers);
  };

  const handleIncludeExclusiveNetworksChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setIncludeExclusiveNetworks(!includeExclusiveNetworks);
  };

  useEffect(() => {
    const loadNetworks = async () => {
      const token = await getAccessTokenSilently();
      const evNetworks = await loadChargingStationNetworks(token);
      setEvNetworks(evNetworks);
    };
    loadNetworks();
  }, [getAccessTokenSilently]);

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

  const tourSteps = [
    {
      selector: "#map",
      content: (
        <Typography>
          The Charger Coverage page shows how well existing charger
          infrastructure can meet the demand as projected by the growth
          scenario.
        </Typography>
      ),
    },
    {
      selector: ".coverage-legend",
      content: (
        <Typography>
          Coverage is presented as a percentage of the projected charging demand
          that is fulfilled by the existing charging infrastructure.
        </Typography>
      ),
    },
    {
      selector: ".vehicle-population-controls",
      content: (
        <Typography>
          Vehicle population controls allow you to adjust how the vehicle
          population will grow and view the projected demand data for a given
          year. New growth scenarios can be created via the Timeline tab.
        </Typography>
      ),
    },
    {
      selector: ".season-control",
      content: (
        <Typography>
          The current season can be changed here. Summer and winter are peak
          seasons, while spring and fall are shoulder seasons.
        </Typography>
      ),
    },
    {
      selector: ".charger-controls",
      content: (
        <Typography>
          The coverage provided by chargers of different types and access levels
          can be controlled here.
        </Typography>
      ),
    },
    {
      selector: ".utilization-control",
      content: (
        <Typography>
          Charger utilization can be changed here. Charger utilization measures
          what percent of the time a charger is being used. Higher values mean
          that each individual charger will satisfy more of the charging demand.
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

  const loading =
    props.loading ||
    loadingChargingCapacity ||
    loadingDemand ||
    loadingAllDayDemand ||
    scaleYear !== props.year;

  /* Data Download */

  const downloadChargingStationInfo = async () => {
    if (props.chargingStations) {
      setDownloading(true);
      const downloadSuccess = await downloadStations(props.chargingStations);
      setErrorDownloading(!downloadSuccess);
      setDownloading(false);
    }
  };

  const isTxPPC = ["TX", "CPS", "NBU", "LCRA", "AE"].includes(
    getStateAbbrFromStateName(props.location?.name || "")
  );

  return (
    <Stack direction={"row"} sx={{ height: "100%" }}>
      <Stack sx={{ width: "462px", height: "100%" }}>
        <Stack
          spacing={2}
          sx={{ padding: "30px", overflowY: "auto", height: "100%" }}
        >
          <Box>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <Typography variant="controlTitle">Charger Coverage</Typography>
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
            <AccessControl permission={"read:block_group_popups"}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={"flex-end"}
                spacing={1}
              >
                <InfoIcon color="info" fontSize="small" />
                <Typography>
                  Click a block group to see detailed information
                </Typography>
              </Stack>
            </AccessControl>
          </Box>
          <Divider orientation="horizontal" flexItem />
          <Stack spacing={1} className="vehicle-population-controls">
            <HelpTooltip
              title={
                "A growth scenario and year, as specified in the Timeline tab, determine the vehicle population "
              }
            >
              <Typography variant="h3">Vehicle Population Controls</Typography>
            </HelpTooltip>
            <GrowthScenarioControl
              selectedGrowthScenario={props.selectedGrowthScenario}
              growthScenarios={props.growthScenarios}
              onChange={props.onGrowthScenarioChange}
            />
            {lightDutyVehicleClass === undefined && (
              <Alert severity="warning">
                <AlertTitle>Incompatible Growth Scenario</AlertTitle>
                The selected growth scenario does not have light-duty demand
                data. Please select a different growth scenario.
              </Alert>
            )}
            <YearControl
              value={props.year}
              years={range(2020, 2051)}
              onChange={props.onYearChange}
            />
            <EvPenetration
              numEvs={currentYearVehicleClassData?.numEvs}
              percent={currentYearVehicleClassData?.evFractionOfAllVehicles}
            />
          </Stack>
          <Divider orientation="horizontal" flexItem />
          <Stack spacing={1}>
            <Typography variant="h3">Demand Controls</Typography>
            <SeasonControl
              ac={props.ac}
              onChange={props.onAcChange}
              chargingDemandSimulations={props.chargingDemandSimulations}
            />
            <Divider orientation="horizontal" flexItem />
          </Stack>
          <Box className={"charger-controls"}>
            <Stack spacing={1}>
              <HelpTooltip
                title={
                  "Select which chargers contribute to the charger coverage calculation"
                }
              >
                <Typography variant="h3">Charger Coverage Controls</Typography>
              </HelpTooltip>
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
              <AccessControl permission="read:coverage_utilization_control">
                <UtilizationControl
                  utilization={utilization}
                  onChange={handleUtilizationChange}
                />
              </AccessControl>
            </Stack>
          </Box>
        </Stack>
        <StickyBottomBox>
          <DownloadButton
            onClick={downloadChargingStationInfo}
            error={errorDownloading}
            loading={downloading}
          />
        </StickyBottomBox>
      </Stack>
      <MapComponent
        loading={loading}
        blockGroups={props.blockGroups}
        existingChargerCoverage={coveragePercentage}
        chargingStations={props.chargingStations}
        substations={props.substations}
        demographics={props.demographics}
        location={props.location}
        currentView={"coverage"}
        isTxPPC={isTxPPC}
      />
    </Stack>
  );
}

export default CoveragePage;
