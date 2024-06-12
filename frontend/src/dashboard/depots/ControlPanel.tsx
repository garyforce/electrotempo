import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { useTour } from "@reactour/tour";
import HelpTooltip from "components/HelpTooltip";
import DemandHourControl from "dashboard/controls/DemandHourControl";
import GrowthScenarioControl from "dashboard/controls/GrowthScenarioControl";
import YearControl from "dashboard/controls/YearControl";
import { DepotFilters } from "types/depot-filter";
import { GrowthScenario } from "types/growth-scenario";
import { Season } from "types/season";
import { range } from "utils/array";

export type ControlPanelProps = {
  isTxPPC: boolean;
  year: number;
  onYearChange: (year: number) => void;
  activeLayers: ("depots" | "feeders")[];
  onActiveLayersChange: (activeLayers: ("depots" | "feeders")[]) => void;
  energyOrPower: "energy" | "power";
  onEnergyOrPowerChange: (energyOrPower: "energy" | "power") => void;
  season: Season;
  onSeasonChange: (season: Season) => void;
  hour: number;
  onHourChange: (hour: number) => void;
  allDayCheckbox: boolean;
  onAllDayCheckboxChange: (allDayCheckbox: boolean) => void;
  depotCategory: DepotFilters[];
  setDepotCategory: (depotCategory: DepotFilters[]) => void;
  filterOptions: {
    label: string;
    value: string;
  }[];
  growthScenarios?: GrowthScenario[];
  selectedGrowthScenario?: GrowthScenario;
  onGrowthScenarioChange?: (event: Event) => void;
  preloading: boolean;
  playingAnimation: boolean;
  handleAnimationButtonClick: (event: Event) => void;
  isPlayButtonHide?: boolean;
  handleReportMissingDepotClick: () => void;
};

export default function ControlPanel({
  isTxPPC,
  year,
  onYearChange,
  activeLayers,
  onActiveLayersChange,
  energyOrPower,
  onEnergyOrPowerChange,
  season,
  onSeasonChange,
  hour,
  onHourChange,
  allDayCheckbox,
  onAllDayCheckboxChange,
  depotCategory,
  setDepotCategory,
  filterOptions,
  growthScenarios,
  selectedGrowthScenario,
  onGrowthScenarioChange,
  preloading,
  playingAnimation,
  handleAnimationButtonClick,
  isPlayButtonHide = false,
  handleReportMissingDepotClick,
}: ControlPanelProps) {
  const { setIsOpen, setSteps, setCurrentStep } = useTour();
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
      selector: ".year-controls",
      content: (
        <Typography>
          The year slider allows you to change the year of the displayed data.
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
      selector: ".season-control",
      content: (
        <Typography>
          The current season can be changed here. Winter is the peak demand
          season, followed by summer. Shoulder seasons are spring and fall.
        </Typography>
      ),
    },
    {
      selector: ".demand-hour-control",
      content: (
        <Typography>
          The demand for the selected hour can be changed here. All times are in
          the local time zone.
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
  return (
    <Stack
      divider={<Divider orientation="horizontal" flexItem />}
      spacing={2}
      sx={{ padding: "30px", overflowY: "auto" }}
    >
      <Box>
        <Stack direction={"row"} alignItems={"center"} spacing={2}>
          <Typography variant="controlTitle">Depots</Typography>
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
      {isTxPPC && (
        <Box>
          <Stack direction={"column"} spacing={2}>
            <Typography variant="h3">Growth Scenarios</Typography>
            <GrowthScenarioControl
              selectedGrowthScenario={selectedGrowthScenario}
              growthScenarios={growthScenarios}
              onChange={onGrowthScenarioChange}
            />
          </Stack>
        </Box>
      )}
      <Stack spacing={1} className="year-controls">
        <HelpTooltip title={"Choose the year to view demand"}>
          <Typography variant="h3">Year</Typography>
        </HelpTooltip>
        <YearControl
          value={year}
          years={range(2023, 2036)}
          increment={2}
          onChange={(event) =>
            onYearChange(Number((event.target as HTMLInputElement).value))
          }
          helpText=""
        />
      </Stack>
      <Stack spacing={1} className={"demand-controls"}>
        <Typography variant="h3">Electricity Controls</Typography>
        <FormControl component="fieldset" className="season-control">
          <FormLabel>Measurement Type</FormLabel>
          <RadioGroup
            name="type"
            value={energyOrPower}
            onChange={(event, value) =>
              onEnergyOrPowerChange(value as "energy" | "power")
            }
          >
            <FormControlLabel value="power" control={<Radio />} label="Power" />
            <FormControlLabel
              value="energy"
              control={<Radio />}
              label="Energy"
            />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" className="season-control">
          <FormLabel>Season</FormLabel>
          <RadioGroup
            name="type"
            value={season}
            onChange={(event, value) => onSeasonChange(value as Season)}
          >
            <FormControlLabel
              value="winter"
              control={<Radio />}
              label="Winter"
            />
            <FormControlLabel
              value="summer"
              control={<Radio />}
              label="Summer"
            />
            <FormControlLabel
              value="shoulder"
              control={<Radio />}
              label="Shoulder"
            />
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Layers</FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={activeLayers.includes("feeders") && !isTxPPC}
                onChange={() => {
                  if (activeLayers.includes("feeders")) {
                    onActiveLayersChange(
                      activeLayers.filter((layer) => layer !== "feeders")
                    );
                  } else {
                    onActiveLayersChange([...activeLayers, "feeders"]);
                  }
                }}
              />
            }
            label="Feeder Lines"
            sx={{ marginRight: "-0.2em" }}
            disabled={isTxPPC}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={activeLayers.includes("depots")}
                onChange={() => {
                  if (activeLayers.includes("depots")) {
                    onActiveLayersChange(
                      activeLayers.filter((layer) => layer !== "depots")
                    );
                  } else {
                    onActiveLayersChange([...activeLayers, "depots"]);
                  }
                }}
              />
            }
            label="Depots"
            sx={{ marginRight: "-0.2em" }}
          />
        </FormControl>
        <DemandHourControl
          preloading={preloading}
          playingAnimation={playingAnimation}
          allDayCheckbox={allDayCheckbox}
          onAllDayCheckboxChange={onAllDayCheckboxChange}
          onAnimationButtonClick={handleAnimationButtonClick}
          hour={hour}
          disabled={isTxPPC}
          onHourChange={onHourChange}
          isPlayButtonHide={isPlayButtonHide}
        />
      </Stack>
      {isTxPPC && (
        <Box>
          <Typography variant="h3" sx={{ marginBottom: 1.5 }}>
            Depot Categories
          </Typography>
          <Stack>
            {filterOptions.map((filter, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={depotCategory.includes(
                      filter.value as DepotFilters
                    )}
                    onChange={() => {
                      if (
                        depotCategory.includes(filter.value as DepotFilters)
                      ) {
                        setDepotCategory(
                          depotCategory.filter(
                            (layer) => layer !== (filter.value as DepotFilters)
                          )
                        );
                      } else {
                        setDepotCategory([
                          ...depotCategory,
                          filter.value as DepotFilters,
                        ]);
                      }
                    }}
                  />
                }
                label={filter.label}
                sx={{ marginRight: "-0.2em" }}
                key={index}
              />
            ))}
          </Stack>
        </Box>
      )}
      {isTxPPC && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            color="warning"
            onClick={() => handleReportMissingDepotClick()}
          >
            Report missing depot
          </Button>
        </Box>
      )}
    </Stack>
  );
}
