import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  DialogProps,
  FormLabel,
  IconButton,
  RadioGroup,
  Radio,
  Alert,
} from "@mui/material";
import TimeSlider from "components/TimeSlider";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import {
  FleetMix,
  lightDutyVehicleTypes,
  mediumDutyVehicleTypes,
  heavyDutyVehicleTypes,
  FleetMixVehicle,
} from "dashboard/fleets/fleet-mix";
import { FleetMixVehicleTypeConfiguration } from "../FleetMixVehicleTypeConfiguration";
import { LoadingButton } from "@mui/lab";
import { v4 as uuidv4 } from "uuid";

export type AdvancedDialogProps = {
  DialogProps: DialogProps;
};
export function AdvancedDialog({ DialogProps }: AdvancedDialogProps) {
  const steps = [
    "Provide Fleet Details",
    "Review Vehicle and Financial Assumptions",
  ];
  return (
    <Dialog {...DialogProps} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent={"space-between"}>
          Create a New Scenario
          <Stepper activeStep={0} sx={{ width: "600px" }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ marginTop: "0.5em" }}>
          <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
              <TextField
                required
                label="SMUD Customer ID"
                sx={{ width: "32%" }}
                value={"12345678"}
                size="small"
              />
              <TextField
                required
                label="Planning Horizon (years)"
                type="number"
                sx={{ width: "32%" }}
                value={15}
                size="small"
              />
            </Stack>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <Typography variant="h2">Fleet Information</Typography>
                <Button size="small" variant="outlined">
                  <UploadFileIcon sx={{ marginRight: "6px" }} /> Upload Fleet
                  Information
                </Button>
              </Stack>
              <Stack spacing={2}>
                <Stack spacing={2}>
                  <Stack spacing={2}>
                    <Typography variant="h3">Vehicle 1</Typography>
                    <Stack spacing={2} direction="row">
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Make</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Make"
                          size="small"
                        >
                          <MenuItem value="1">Ford</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Model</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Model"
                          size="small"
                        >
                          <MenuItem value="1">F-150</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Year</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Year"
                          size="small"
                        >
                          <MenuItem value="1">2019</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Trim</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Trim"
                          size="small"
                        >
                          <MenuItem value="1">XLT</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">
                          Engine Size
                        </InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Engine Size"
                          size="small"
                        >
                          <MenuItem value="1">3.5L</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        type="number"
                        label="Annual Operating Costs"
                        InputProps={{
                          startAdornment: <Typography>$</Typography>,
                        }}
                        size="small"
                        value={1977.38}
                        sx={{
                          width: "22%",
                        }}
                      />
                      <TextField
                        type="number"
                        label="Depreciation Rate"
                        InputProps={{
                          endAdornment: <Typography>%</Typography>,
                        }}
                        size="small"
                        value={15.1}
                        sx={{
                          width: "20%",
                        }}
                      />
                      <Button
                        variant="outlined"
                        sx={{
                          border: "1px solid #BBB",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                      >
                        Edit Purchase Information &gt;
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          border: "1px solid #BBB",
                          color: "rgba(0, 0, 0, 0.87)",
                          flex: 1,
                        }}
                      >
                        Edit Daily Schedule &gt;
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack spacing={2}>
                    <Typography variant="h3">Vehicle 2</Typography>
                    <Stack spacing={2} direction="row">
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Make</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Make"
                          size="small"
                        >
                          <MenuItem value="1">Ford</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Model</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Model"
                          size="small"
                        >
                          <MenuItem value="1">F-250</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Year</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Year"
                          size="small"
                        >
                          <MenuItem value="1">2012</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">Trim</InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Trim"
                          size="small"
                        >
                          <MenuItem value="1">XL</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "25%" }}>
                        <InputLabel id="light-duty-label">
                          Engine Size
                        </InputLabel>
                        <Select
                          value={"1"}
                          labelId="light-duty-label"
                          label="Engine Size"
                          size="small"
                        >
                          <MenuItem value="1">7.3L</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        type="number"
                        label="Annual Operating Costs"
                        InputProps={{
                          startAdornment: <Typography>$</Typography>,
                        }}
                        size="small"
                        value={2395.03}
                        sx={{
                          width: "22%",
                        }}
                      />
                      <TextField
                        type="number"
                        label="Depreciation Rate"
                        InputProps={{
                          endAdornment: <Typography>%</Typography>,
                        }}
                        size="small"
                        value={8.1}
                        sx={{
                          width: "20%",
                        }}
                      />
                      <Button
                        variant="outlined"
                        sx={{
                          border: "1px solid #BBB",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                      >
                        Edit Purchase Information &gt;
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          border: "1px solid #BBB",
                          color: "rgba(0, 0, 0, 0.87)",
                          flex: 1,
                        }}
                      >
                        Edit Daily Schedule &gt;
                      </Button>
                    </Stack>
                  </Stack>
                  <Button size="small" sx={{ width: "250px", height: "20px" }}>
                    <AddIcon />
                    Add another vehicle
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Typography variant="h2">Viable Chargers</Typography>
            <Stack direction="row">
              <Typography>
                Is there a maximum number of chargers you are willing to
                purchase/have space for?
              </Typography>
              <TextField
                label={"Maximum Number of Chargers"}
                value={32}
                type={"number"}
                sx={{ width: "400px" }}
              />
            </Stack>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <FormControlLabel
                  control={<Checkbox />}
                  label={"Level 2 Only"}
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={<Checkbox />}
                  label={"DC Fast Only"}
                  checked
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={<Checkbox />}
                  label={"DC Fast + Level 2"}
                />
              </Box>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant={"outlined"}>Cancel</Button>
        <Button variant="contained">Next</Button>
      </DialogActions>
    </Dialog>
  );
}

export type BasicDialogProps = {
  DialogProps: DialogProps;
  onSubmit: () => void;
};

export function BasicDialog({ DialogProps, onSubmit }: BasicDialogProps) {
  const [scenarioName, setScenarioName] = useState("");
  const [planningHorizon, setPlanningHorizon] = useState(12);
  const [operatingHours, setOperatingHours] = useState([9, 17]);
  const [application, setApplication] = useState("city");
  const [maxNumChargers, setMaxNumChargers] = useState(32);
  const [fleetMix, setFleetMix] = useState<FleetMix>({
    lightDutyVehicles: [],
    mediumDutyVehicles: [],
    heavyDutyVehicles: [],
  });
  const [loading, setLoading] = useState(false);

  const delayOnSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit();
    }, 2000);
  };

  const handleAddLightDutyVehicle = () => {
    setFleetMix({
      ...fleetMix,
      lightDutyVehicles: [
        ...fleetMix.lightDutyVehicles,
        {
          id: uuidv4(),
          type: undefined,
          numEv: undefined,
          numIce: undefined,
          annualMileage: undefined,
        },
      ],
    });
  };

  const handleRemoveLightDutyVehicle = (id?: string) => {
    setFleetMix({
      ...fleetMix,
      lightDutyVehicles: fleetMix.lightDutyVehicles.filter(
        (vehicle) => vehicle.id !== id
      ),
    });
  };

  const handleAddMediumDutyVehicle = () => {
    setFleetMix({
      ...fleetMix,
      mediumDutyVehicles: [
        ...fleetMix.mediumDutyVehicles,
        {
          id: uuidv4(),
          type: undefined,
          numEv: undefined,
          numIce: undefined,
          annualMileage: undefined,
        },
      ],
    });
  };

  const handleRemoveMediumDutyVehicle = (id?: string) => {
    setFleetMix({
      ...fleetMix,
      mediumDutyVehicles: fleetMix.mediumDutyVehicles.filter(
        (vehicle) => vehicle.id !== id
      ),
    });
  };

  const handleAddHeavyDutyVehicle = () => {
    setFleetMix({
      ...fleetMix,
      heavyDutyVehicles: [
        ...fleetMix.heavyDutyVehicles,
        {
          id: uuidv4(),
          type: undefined,
          numEv: undefined,
          numIce: undefined,
          annualMileage: undefined,
        },
      ],
    });
  };

  const handleChangeHeavyDutyVehicle = (vehicle: FleetMixVehicle) => {
    setFleetMix({
      ...fleetMix,
      heavyDutyVehicles: fleetMix.heavyDutyVehicles.map((v) =>
        v.id === vehicle.id ? vehicle : v
      ),
    });
  };

  const handleRemoveHeavyDutyVehicle = (id?: string) => {
    setFleetMix({
      ...fleetMix,
      heavyDutyVehicles: fleetMix.heavyDutyVehicles.filter(
        (vehicle) => vehicle.id !== id
      ),
    });
  };

  const hasTeslaSemi = fleetMix.heavyDutyVehicles.some((vehicle) =>
    vehicle.type?.includes("Tesla Semi")
  );
  const hasError = application === "off-road" && hasTeslaSemi;

  return (
    <Dialog {...DialogProps} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent={"space-between"}>
          <Typography variant="h2">Create a New Scenario</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ marginTop: "0.5em" }}>
          <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
              <TextField
                required
                label="Scenario Name"
                sx={{ width: "68%" }}
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
              <TextField
                required
                label="Planning Horizon (years)"
                type="number"
                sx={{ width: "32%" }}
                value={planningHorizon}
                onChange={(e) => setPlanningHorizon(Number(e.target.value))}
              />
            </Stack>
            <Stack spacing={2}>
              <Stack spacing={2}>
                <Typography variant="h2">Fleet Characteristics</Typography>
                <Stack
                  spacing={2}
                  direction="row"
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography sx={{ width: "50%" }}>
                    What are the typical operating hours of this fleet?
                  </Typography>
                  <Box sx={{ width: "50%" }}>
                    <TimeSlider
                      duplicateMidnight
                      value={operatingHours}
                      onChange={(e, value) =>
                        setOperatingHours(value as number[])
                      }
                      valueLabelDisplay="auto"
                      step={0.25}
                    />
                  </Box>
                </Stack>
                <FormControl
                  component="fieldset"
                  className="application-control"
                >
                  <FormLabel>Application</FormLabel>
                  <RadioGroup
                    name="application"
                    value={application}
                    onChange={(e, value) => setApplication(value)}
                  >
                    <Stack direction="row" spacing={2}>
                      <FormControlLabel
                        value="city"
                        control={<Radio />}
                        label="City"
                      />
                      <FormControlLabel
                        value="highway"
                        control={<Radio />}
                        label="Highway"
                      />
                      <FormControlLabel
                        value="off-road"
                        control={<Radio />}
                        label="Off-road"
                      />
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Stack>
              <Typography variant="h3">Fleet Mix</Typography>
              <Stack spacing={2}>
                <Stack spacing={2}>
                  <Typography variant="h4">Light Duty</Typography>
                  {fleetMix.lightDutyVehicles.map((vehicle) => (
                    <FleetMixVehicleTypeConfiguration
                      key={vehicle.type}
                      vehicle={vehicle}
                      vehicleTypeOptions={lightDutyVehicleTypes}
                      onRemove={() => handleRemoveLightDutyVehicle(vehicle.id)}
                    />
                  ))}
                  <Stack direction="row" alignItems="center">
                    <IconButton onClick={handleAddLightDutyVehicle}>
                      <AddCircleOutlineIcon color="primary" />
                    </IconButton>
                    <Button
                      sx={{ height: "30px" }}
                      onClick={handleAddLightDutyVehicle}
                    >
                      Add another vehicle type
                    </Button>
                  </Stack>
                </Stack>
                <Stack spacing={2}>
                  <Typography variant="h4">Medium Duty</Typography>
                  {fleetMix.mediumDutyVehicles.map((vehicle, index) => (
                    <FleetMixVehicleTypeConfiguration
                      key={vehicle.type}
                      vehicle={vehicle}
                      vehicleTypeOptions={mediumDutyVehicleTypes}
                      onRemove={() => handleRemoveMediumDutyVehicle(vehicle.id)}
                    />
                  ))}
                  <Stack direction="row" alignItems="center">
                    <IconButton>
                      <AddCircleOutlineIcon
                        color="primary"
                        onClick={handleAddMediumDutyVehicle}
                      />
                    </IconButton>
                    <Button
                      sx={{ height: "30px" }}
                      onClick={handleAddMediumDutyVehicle}
                    >
                      Add another vehicle type
                    </Button>
                  </Stack>
                </Stack>
                <Stack spacing={2}>
                  <Typography variant="h4">Heavy Duty</Typography>
                  {fleetMix.heavyDutyVehicles.map((vehicle, index) => (
                    <FleetMixVehicleTypeConfiguration
                      key={vehicle.type}
                      vehicle={vehicle}
                      vehicleTypeOptions={heavyDutyVehicleTypes}
                      onRemove={() => handleRemoveHeavyDutyVehicle(vehicle.id)}
                      onChange={(vehicle) => {
                        handleChangeHeavyDutyVehicle(vehicle);
                      }}
                    />
                  ))}
                  <Stack direction="row" alignItems="center">
                    <IconButton>
                      <AddCircleOutlineIcon
                        color="primary"
                        onClick={handleAddHeavyDutyVehicle}
                      />
                    </IconButton>
                    <Button onClick={handleAddHeavyDutyVehicle}>
                      Add another vehicle type
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Typography variant="h2">Viable Chargers</Typography>
            <Stack direction="row">
              <Typography>
                Is there a maximum number of chargers you are willing to
                purchase/have space for?
              </Typography>
              <TextField
                label={"Maximum Number of Chargers"}
                value={maxNumChargers}
                onChange={(e) => setMaxNumChargers(Number(e.target.value))}
                type={"number"}
                sx={{ width: "400px" }}
              />
            </Stack>

            <FormControl>
              <FormLabel>Charger Levels to Consider</FormLabel>
              <Stack direction="row" spacing={4}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Level 2"
                  sx={{ marginRight: "-0.2em" }}
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="DC Fast"
                  sx={{ marginRight: "-0.2em" }}
                />
              </Stack>
            </FormControl>
          </Stack>
          <Stack spacing={2}>
            <Typography variant="h2">Scope</Typography>
            <Stack
              spacing={2}
              direction="row"
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <FormControl>
                <FormLabel>Suggest Purchases For</FormLabel>
                <Stack direction={"row"} spacing={4}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Vehicles"
                    sx={{ marginRight: "-0.2em" }}
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Chargers/EVSE"
                    sx={{ marginRight: "-0.2em" }}
                  />
                </Stack>
              </FormControl>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        {hasError && (
          <Alert severity={"error"} sx={{ marginRight: "8px" }}>
            Application "Off-road" and "Tesla Semi" are not compatible. Please
            choose another application or vehicle type.
          </Alert>
        )}
        <LoadingButton
          variant="contained"
          onClick={delayOnSubmit}
          loading={loading}
          disabled={hasError}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
