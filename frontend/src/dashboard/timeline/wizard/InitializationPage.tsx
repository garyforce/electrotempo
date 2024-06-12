import {
  DialogContent,
  Stack,
  TextField,
  DialogActions,
  Button,
  FormGroup,
  FormLabel,
  Box,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Autocomplete,
  Typography,
  FormHelperText,
} from "@mui/material";
import HelpTooltip from "components/HelpTooltip";
import { usePermissions } from "dashboard/PermissionContext";
import { useState } from "react";
import { GrowthScenario } from "types/growth-scenario";
import { loadGrowthScenario } from "api/growth_scenario";
import { VehicleClass } from "types/vehicle-class";
import { set } from "colorjs.io/fn";

export const baseVehicleClasses: VehicleClass[] = [
  {
    name: "Cars",
    description: "Vehicle Classes 1 and 2a",
    config: {
      startMarketshare: 0,
      startYear: 2010,
      currentMarketshare: 0.1,
      currentYear: 2023,
      targetMarketshare: 0.5,
      targetYear: 2030,
      finalMarketshare: 1,
      finalYear: 2060,
      startingPopulation: 1000000,
      growthRate: 0.015,
      retrofitRate: 0,
      retrofitIncentive: false,
      retrofitIncentiveSize: 0,
      scrappageRate: 0.065,
      scrappageIncentive: false,
      scrappageIncentiveSize: 0,
    },
    active: false,
    permission: "read:growth_scenario_cars",
  },
  {
    name: "Light Trucks",
    description: "ACT Vehicle Classes 2b and 3",
    config: {
      startMarketshare: 0,
      startYear: 2010,
      currentMarketshare: 0.045,
      currentYear: 2023,
      targetMarketshare: 0.55,
      targetYear: 2035,
      finalMarketshare: 0.7,
      finalYear: 2050,
      startingPopulation: 1500000,
      growthRate: 0.03,
      retrofitRate: 0,
      retrofitIncentive: false,
      retrofitIncentiveSize: 0,
      scrappageRate: 0.065,
      scrappageIncentive: false,
      scrappageIncentiveSize: 0,
    },
    active: false,
    permission: "read:growth_scenario_mhd",
  },
  {
    name: "Straight Trucks",
    description: "ACT Vehicle Classes 4, 5, 6, and 7",
    config: {
      startMarketshare: 0,
      startYear: 2010,
      currentMarketshare: 0.0636,
      currentYear: 2023,
      targetMarketshare: 0.75,
      targetYear: 2035,
      finalMarketshare: 0.84,
      finalYear: 2050,
      startingPopulation: 1000000,
      growthRate: 0.03,
      retrofitRate: 0,
      retrofitIncentive: false,
      retrofitIncentiveSize: 0,
      scrappageRate: 0.05,
      scrappageIncentive: false,
      scrappageIncentiveSize: 0,
    },
    active: false,
    permission: "read:growth_scenario_mhd",
  },
  {
    name: "Tractors",
    description: "ACT Vehicle Classes 8a and 8b",
    config: {
      startMarketshare: 0,
      startYear: 2010,
      currentMarketshare: 0.045,
      currentYear: 2023,
      targetMarketshare: 0.55,
      targetYear: 2035,
      finalMarketshare: 0.7,
      finalYear: 2050,
      startingPopulation: 500000,
      growthRate: 0.015,
      retrofitRate: 0,
      retrofitIncentive: false,
      retrofitIncentiveSize: 0,
      scrappageRate: 0.05,
      scrappageIncentive: false,
      scrappageIncentiveSize: 0,
    },
    active: false,
    permission: "read:growth_scenario_mhd",
  },
];

export type InitializationPageProps = {
  growthScenario: GrowthScenario;
  setGrowthScenario: (growthScenario: GrowthScenario) => void;
  onClose: () => void;
  onNextButtonClick: () => void;
  growthScenarios: GrowthScenario[];
};

export default function InitializationPage(props: InitializationPageProps) {
  const {
    growthScenario,
    setGrowthScenario,
    onClose,
    onNextButtonClick,
    growthScenarios,
  } = props;

  const [newOrCopy, setNewOrCopy] = useState<string>("new");
  const [selectedGrowthScenarioName, setSelectedGrowthScenarioName] = useState<
    string | null
  >(null);

  const growthScenarioNames = growthScenarios.map(
    (growthScenario) => growthScenario.name
  );

  const handleSelectedGrowthScenarioNameChange = async (
    event: any,
    newValue: string | null
  ) => {
    const growthScenario = growthScenarios.find(
      (growthScenario) => growthScenario.name === newValue
    );

    const growthScenarioTemplate = (await loadGrowthScenario(
      growthScenario!.id
    )) as GrowthScenario;
    setGrowthScenario(growthScenarioTemplate);

    setSelectedGrowthScenarioName(newValue);
  };

  const permissions = usePermissions();

  const atLeastOneVehicleClassActive = growthScenario.vehicleClasses.length > 0;

  const nextDisabled =
    growthScenario.name === "" ||
    !atLeastOneVehicleClassActive ||
    growthScenarioNames.includes(growthScenario.name);

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant={"h2"}>Initialize Growth Scenario</Typography>
          <RadioGroup
            name="newOrCopy"
            value={newOrCopy}
            onChange={(event, value) => {
              setNewOrCopy(value);
            }}
          >
            <FormControlLabel
              value="new"
              control={<Radio />}
              label="Create a new growth scenario"
            />
            <Stack direction="row">
              <FormControlLabel
                value="copy"
                control={<Radio />}
                label="Copy an existing growth scenario"
              />
              <Autocomplete
                disabled={newOrCopy !== "copy"}
                value={selectedGrowthScenarioName}
                onChange={handleSelectedGrowthScenarioNameChange}
                id="growth-scenario-autocomplete"
                options={growthScenarios.map(
                  (growthScenario) => growthScenario.name
                )}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Copy from Growth Scenario" />
                )}
              />
            </Stack>
          </RadioGroup>
          <Stack spacing={1}>
            <TextField
              label={"Growth Scenario Name"}
              value={growthScenario.name}
              onChange={(event) => {
                setGrowthScenario({
                  ...growthScenario,
                  name: event.target.value,
                });
              }}
              error={growthScenarioNames.includes(growthScenario.name)}
              helperText={
                growthScenarioNames.includes(growthScenario.name)
                  ? "* Cannot use an existing scenario name!"
                  : ""
              }
              required
            />
            <TextField
              helperText={
                growthScenario.description === ""
                  ? ""
                  : "Please enter a description for the traffic model"
              }
              label={"Growth Scenario Description"}
              value={growthScenario.description}
              onChange={(event) =>
                setGrowthScenario({
                  ...growthScenario,
                  description: event.target.value,
                })
              }
              multiline
            />
          </Stack>
          <FormGroup>
            <FormLabel component="h2">Vehicle Classes</FormLabel>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {baseVehicleClasses.map((baseVehicleClass) => {
                const checkBox = (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={growthScenario.vehicleClasses.some(
                          (vehicleClass) =>
                            vehicleClass.name === baseVehicleClass.name
                        )}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          const checked = event.target.checked;
                          const newGrowthScenario =
                            structuredClone(growthScenario);
                          if (checked) {
                            newGrowthScenario.vehicleClasses.push(
                              baseVehicleClass
                            );
                          } else {
                            newGrowthScenario.vehicleClasses =
                              newGrowthScenario.vehicleClasses.filter(
                                (vehicleClass) =>
                                  vehicleClass.name !== baseVehicleClass.name
                              );
                          }
                          setGrowthScenario(newGrowthScenario);
                        }}
                        disabled={
                          !permissions.some(
                            (permission) =>
                              baseVehicleClass.permission === permission
                          )
                        }
                      />
                    }
                    label={baseVehicleClass.name}
                  />
                );
                if (baseVehicleClass.description !== undefined) {
                  return (
                    <Box key={baseVehicleClass.name}>
                      <HelpTooltip
                        title={baseVehicleClass.description}
                        iconSpacing={"-0.4em"}
                      >
                        {checkBox}
                      </HelpTooltip>
                    </Box>
                  );
                }
                return checkBox;
              })}
            </Box>
          </FormGroup>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <div style={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={onNextButtonClick}
          disabled={nextDisabled}
        >
          Next
        </Button>
      </DialogActions>
    </>
  );
}
