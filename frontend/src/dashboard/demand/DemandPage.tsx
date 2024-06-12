import { useAuth0 } from "@auth0/auth0-react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { useTour } from "@reactour/tour";
import { loadDemand } from "api/demand.js";
import EvPenetration from "components/EvPenetration";
import HelpTooltip from "components/HelpTooltip";
import MapComponent from "dashboard/Map";
import TrafficModelControl from "dashboard/controls/trafficModelControl";
import { useDebouncedEffect } from "dashboard/useDebouncedEffect";
import { FeatureCollection } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { Ac } from "types/ac";
import { ChargingDemandSimulation } from "types/charging-demand-simulation";
import {
  GrowthScenario,
  getLightDutyVehicleClass,
} from "types/growth-scenario";
import { Location } from "types/location";
import { TrafficModel } from "types/traffic-model";
import { range } from "utils/array";
import { scaleDemandByGrowthScenarioYear } from "utils/demand";
import { getStateAbbrFromStateName } from "utils/state-abbr";
import AccessControl from "../AccessControl";
import DemandHourControl from "../controls/DemandHourControl";
import DemandTypeControl from "../controls/DemandTypeControl";
import DownloadButton from "../controls/DownloadButton";
import GrowthScenarioControl from "../controls/GrowthScenarioControl";
import SeasonControl from "../controls/SeasonControl";
import StickyBottomBox from "../controls/StickyBottomBox";
import YearControl from "../controls/YearControl";
import DemandDensityControl from "./DemandDensityControl";
import { downloadDemand } from "./downloadDemand";

export type DemandPageProps = {
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
  trafficModels?: TrafficModel[];
  onTrafficModelChange?: (event: SelectChangeEvent) => void;
};

function DemandPage(props: DemandPageProps) {
  const { getAccessTokenSilently } = useAuth0();
  const { setIsOpen, setSteps, setCurrentStep } = useTour();

  const [demand, setDemand] = useState({});
  const [allDayDemand, setAllDayDemand] = useState({});
  const [loadingDemand, setLoadingDemand] = useState(false);
  const [loadingAllDayDemand, setLoadingAllDayDemand] = useState(false);

  const [hourlyDemandData, setHourlyDemandData] = useState<Object[]>([]);
  const [preloading, setPreloading] = useState(false);

  // CDS sub-selectors
  const [hour, setHour] = useState(12);
  const [demandTypes, setDemandTypes] = useState(["Home"]);

  // display
  const [useDemandDensity, setUseDemandDensity] = useState(true);
  const [allDayCheckbox, setAllDayCheckbox] = useState(false);

  // animation
  const animationIntervalRef = useRef<number | null>(null);
  const [playingAnimation, setPlayingAnimation] = useState(false);

  // download data
  const [downloading, setDownloading] = useState(false);
  const [errorDownloading, setErrorDownloading] = useState(false);
  const [demandInfo, setDemandInfo] = useState({});

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

  useDebouncedEffect(
    () => {
      // don't attempt to load data if any dependencies are not yet defined,
      // as this side effect relies on other side effects loading data into
      // dependencies
      if (
        [
          props.location,
          props.ac,
          demandTypes,
          hour,
          props.selectedChargingDemandSimulation,
        ].some((value) => value === undefined)
      ) {
        return;
      }

      // don't attempt to update data if we're playing an animation, or else
      // each change of the animation hour will cause an update
      if (playingAnimation) {
        return;
      }

      async function loadData() {
        const apiToken = await getAccessTokenSilently();
        const hourParam = allDayCheckbox ? "all" : hour; // override hour if all day checkbox is checked
        setLoadingDemand(true);
        setLoadingAllDayDemand(true);

        try {
          const [demand, allDayDemand] = await Promise.all([
            loadDemand(
              props.selectedChargingDemandSimulation.id,
              demandTypes,
              hourParam,
              props.location?.id,
              apiToken
            ),
            loadDemand(
              props.selectedChargingDemandSimulation.id,
              demandTypes,
              "all",
              props.location?.id,
              apiToken
            ),
          ]);

          setDemand(demand);
          setAllDayDemand(allDayDemand);
        } catch (error) {
          console.error("Error loading demand data", error);
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
      props.location,
      props.ac,
      demandTypes,
      hour,
      props.selectedChargingDemandSimulation,
      allDayCheckbox,
      props.blockGroups,
    ],
    1000
  );

  const handleDemandTypesChange = (event: Event) => {
    const { value, checked } = event.target as HTMLInputElement;
    if (checked) {
      let newDemandTypes = [...demandTypes];
      newDemandTypes.push(value);
      setDemandTypes(newDemandTypes);
    } else {
      let newDemandTypes = demandTypes.filter((e) => e !== value);
      setDemandTypes(newDemandTypes);
    }
  };

  const handleHourChange = (hour: number) => {
    if (playingAnimation) stopAnimating();
    setHour(hour);
  };

  const handleUseDemandDensityChange = (event: Event, value: boolean) => {
    setUseDemandDensity(value);
  };

  const handleAllDayCheckboxChange = (checked: boolean) => {
    if (checked) stopAnimating();
    setAllDayCheckbox(checked);
  };

  /* Animation Stuff */
  const handleAnimationButtonClick = (event: Event) => {
    playingAnimation ? stopAnimating() : startAnimating();
  };

  const startAnimating = async () => {
    setPreloading(true);
    setHour(0);
    let hourlyFetchPromises = [];
    const apiToken = await getAccessTokenSilently();
    for (let hour = 0; hour < 24; hour++) {
      hourlyFetchPromises.push(
        loadDemand(
          props.selectedChargingDemandSimulation.id,
          demandTypes,
          hour,
          props.location?.id,
          apiToken
        )
      );
    }
    let hourlyDemandData = await Promise.all(hourlyFetchPromises);
    setHourlyDemandData(hourlyDemandData);
    // immediately update hour, and then also set up a timer for subsequent changes
    setPlayingAnimation(true);
    setPreloading(false);
  };

  useEffect(() => {
    if (playingAnimation) {
      const updateNextHour = async () => {
        setHour((prevHour) => (prevHour + 1) % 24);
        // there is a useEffect for when hour changes that updates the
        // hourlyDemandData. This is because the previous hour was not
        // available to that state update then, and new hour states are
        // not available via hour here.
        // see: https://stackoverflow.com/questions/53024496/state-not-updating-when-using-react-state-hook-within-setinterval
      };
      let animationInterval = window.setInterval(updateNextHour, 1000);
      animationIntervalRef.current = animationInterval;
    } else {
      window.clearInterval(animationIntervalRef.current ?? undefined);
      animationIntervalRef.current = null;
    }
  }, [playingAnimation]);

  // stupid hacky way of handling updating hourly demand with intervals above
  useEffect(() => {
    if (playingAnimation) {
      setDemand(hourlyDemandData[hour]);
      if (hour === 23) stopAnimating(); // CORE-702 temporary fix
    }
  }, [hour, hourlyDemandData, playingAnimation]);

  const stopAnimating = () => {
    setPlayingAnimation(false);
  };

  /* Data Download */

  const handleDownloadButtonClick = async () => {
    if (currentYearVehicleClassData !== undefined) {
      setDownloading(true);
      const apiToken = await getAccessTokenSilently();
      const downloadSuccess = await downloadDemand(
        demandInfo,
        props,
        lightDutyVehicleClass?.annualData,
        scaleYear,
        demandTypes,
        props.selectedGrowthScenario?.name,
        apiToken
      );
      setErrorDownloading(!downloadSuccess);
      setDownloading(false);
    }
  };

  const tourSteps = [
    {
      selector: "#map",
      content: (
        <Typography>
          The Charging Demand page shows where charging demand is geographically
          located.
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
      selector: ".demand-controls",
      content: (
        <Typography>
          Demand controls allow you to change settings that affect the demand
          data.
        </Typography>
      ),
    },
    {
      selector: ".demand-density-control",
      content: (
        <Typography>
          Demand density normalizes demand by the size of the block group,
          making it easier to identify locations with high demand relative to
          their size.
          <br />
          <br />
          Demand is currently shown in{" "}
          {useDemandDensity ? "kWh per square mile" : "kWh"}. Toggling it will
          show demand in {useDemandDensity ? "kWh" : "kWh per square mile"}.
        </Typography>
      ),
    },
    {
      selector: ".demand-legend",
      content: (
        <Typography>
          The legend will update to reflect the correct units in alignment with
          the demand density control.
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
      selector: ".demand-type-control",
      content: (
        <Typography>
          The displayed types of charging demand can be controlled here.
          Multiple selected options will display the total demand of all
          selected demand types.
        </Typography>
      ),
    },
    {
      selector: ".demand-hour-control",
      content: (
        <Typography>
          The demand for the selected hour can be changed here. All times are in
          the local time zone. You can view the total demand across all hours by
          toggling the "All day" checkbox.
        </Typography>
      ),
    },
    {
      selector: ".animation-button",
      content: (
        <Typography>
          An animation cycling through the hourly demand can be viewed by
          clicking this button.
        </Typography>
      ),
    },
    {
      selector: ".download-data-button",
      content: (
        <Typography>
          The demand for this growth scenario can be downloaded by clicking this
          button. The downloaded data will reflect the currently selected
          controls in the side panel, and includes the map geometry in the
          GeoJSON format.
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
      const scaledDemandData = scaleDemandByGrowthScenarioYear(
        lightDutyVehicleClass.annualData,
        scaleYear,
        demand,
        allDayDemandSum,
        demandTypes
      );
      setDemandInfo(scaledDemandData);
      return scaledDemandData;
    }
    return {};
  }, [lightDutyVehicleClass, scaleYear, demand, allDayDemand, demandTypes]);

  const mapLoading =
    props.loading ||
    loadingDemand ||
    loadingAllDayDemand ||
    scaleYear !== props.year;

  const isTxPPC = ["TX", "CPS", "NBU", "LCRA", "AE"].includes(
    getStateAbbrFromStateName(props.location?.name || "")
  );

  return (
    <Stack direction={"row"} sx={{ height: "100%" }}>
      <Stack sx={{ width: "462px", height: "100%" }}>
        <Stack
          divider={<Divider orientation="horizontal" flexItem />}
          spacing={2}
          sx={{ padding: "30px", overflowY: "auto" }}
        >
          <Box>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <Typography variant="controlTitle">Charging Demand</Typography>
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
          <Stack spacing={1} className="vehicle-population-controls">
            <HelpTooltip
              title={
                "A growth scenario and year, as specified in the Timeline tab, determine the vehicle population "
              }
            >
              <Typography variant="h3">Simulation Controls</Typography>
            </HelpTooltip>
            <GrowthScenarioControl
              selectedGrowthScenario={props.selectedGrowthScenario}
              growthScenarios={props.growthScenarios}
              onChange={props.onGrowthScenarioChange}
              disabled={playingAnimation}
            />
            <TrafficModelControl
              selectedTrafficModel={props.selectedTrafficModel}
              trafficModels={props.trafficModels}
              onChange={props.onTrafficModelChange}
              disabled={playingAnimation}
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
              disabled={playingAnimation}
            />
            <EvPenetration
              numEvs={currentYearVehicleClassData?.numEvs}
              percent={currentYearVehicleClassData?.evFractionOfAllVehicles}
            />
          </Stack>
          <Stack spacing={1} className={"demand-controls"}>
            <Typography variant="h3">Demand Controls</Typography>
            <DemandDensityControl
              checked={useDemandDensity}
              onChange={handleUseDemandDensityChange}
            />
            <SeasonControl
              ac={props.ac}
              onChange={props.onAcChange}
              chargingDemandSimulations={props.chargingDemandSimulations}
              disabled={playingAnimation}
            />
            <DemandTypeControl
              preloading={preloading}
              disabled={playingAnimation}
              demandTypes={demandTypes}
              onDemandTypesChange={handleDemandTypesChange}
            />
            <DemandHourControl
              preloading={preloading}
              playingAnimation={playingAnimation}
              allDayCheckbox={allDayCheckbox}
              onAllDayCheckboxChange={handleAllDayCheckboxChange}
              onAnimationButtonClick={handleAnimationButtonClick}
              hour={hour}
              onHourChange={handleHourChange}
            />
          </Stack>
        </Stack>
        <StickyBottomBox>
          <DownloadButton
            onClick={handleDownloadButtonClick}
            error={errorDownloading}
            loading={downloading}
          />
        </StickyBottomBox>
      </Stack>
      <MapComponent
        blockGroups={props.blockGroups}
        demand={scaledDemand}
        chargingStations={props.chargingStations}
        substations={props.substations}
        demographics={props.demographics}
        location={props.location}
        currentView={useDemandDensity ? "demandDensity" : "demand"}
        useDemandDensity={useDemandDensity}
        loading={mapLoading}
        isTxPPC={isTxPPC}
      />
    </Stack>
  );
}

export default DemandPage;
