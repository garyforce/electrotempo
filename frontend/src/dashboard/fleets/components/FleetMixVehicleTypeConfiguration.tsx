import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { FleetMixVehicle, VehicleType } from "../fleet-mix";

export type FleetMixVehicleTypeConfigurationProps = {
  vehicle: FleetMixVehicle;
  vehicleTypeOptions: VehicleType[];
  onRemove: () => void;
  onChange?: (vehicle: FleetMixVehicle) => void;
};

export function FleetMixVehicleTypeConfiguration({
  vehicle,
  vehicleTypeOptions,
  onRemove,
  onChange,
}: FleetMixVehicleTypeConfigurationProps) {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <IconButton onClick={onRemove}>
        <RemoveCircleOutlineIcon color="error" />
      </IconButton>
      <FormControl sx={{ width: "25%" }}>
        <InputLabel id="light-duty-label" size="small">
          Vehicle Type
        </InputLabel>
        <Select
          value={vehicle.type}
          labelId="light-duty-label"
          label="Vehicle Type"
          size="small"
          onChange={(e) => {
            if (onChange !== undefined) {
              onChange({
                ...vehicle,
                type: e.target.value as VehicleType,
              });
            }
          }}
        >
          {vehicleTypeOptions.map((vehicleType) => (
            <MenuItem value={vehicleType}>{vehicleType}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label={"Number Electric"}
        type="number"
        value={vehicle.numEv}
        sx={{ width: "22%" }}
        size="small"
      />
      <TextField
        label={"Number ICE"}
        type="number"
        value={vehicle.numIce}
        sx={{ width: "22%" }}
        size="small"
      />
      <TextField
        label={"Total Annual Mileage"}
        value={vehicle.annualMileage}
        sx={{ width: "31%" }}
        size="small"
      />
    </Stack>
  );
}
