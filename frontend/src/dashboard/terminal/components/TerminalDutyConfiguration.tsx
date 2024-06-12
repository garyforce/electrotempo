import { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { FleetMixVehicle, VehicleType, ShiftLoadType } from "./ScenarioType";
import {
  lightDutyVehicleTypes,
  mediumDutyVehicleTypes,
  heavyDutyVehicleTypes,
} from "./ScenarioType";
import { v4 as uuidv4 } from "uuid";

export function TerminalDutyConfiguration({
  onChangeVehicleInfo,
}: {
  onChangeVehicleInfo: React.Dispatch<
    React.SetStateAction<FleetMixVehicle | undefined>
  >;
}) {
  const [vehicleInfo, setVehicleInfo] = useState<FleetMixVehicle>({
    id: uuidv4(),
    type: undefined,
    fleetSize: undefined,
    numPerShift: undefined,
    shiftLoad: undefined,
    model: undefined,
  });
  const vehicleModel = [
    lightDutyVehicleTypes,
    mediumDutyVehicleTypes,
    heavyDutyVehicleTypes,
  ];
  useEffect(() => {
    onChangeVehicleInfo(vehicleInfo);
  }, [vehicleInfo]);
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <FormControl sx={{ width: "20%" }}>
        <InputLabel id="light-duty-label" size="small">
          Vehicle Type
        </InputLabel>
        <Select
          value={vehicleInfo.type}
          labelId="light-duty-label"
          label="Vehicle Type"
          size="small"
          onChange={(e) => {
            setVehicleInfo({
              ...vehicleInfo,
              type: e.target.value,
            });
          }}
        >
          <MenuItem value={"0"}>Fork Lift</MenuItem>
          <MenuItem value={"1"}>Utility tractor</MenuItem>
          <MenuItem value={"2"}>Pickup truck</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label={"Fleet size"}
        type="number"
        value={vehicleInfo.fleetSize}
        sx={{ width: "20%" }}
        size="small"
        onChange={(e) =>
          setVehicleInfo({
            ...vehicleInfo,
            fleetSize: parseInt(e.target.value),
          })
        }
      />
      <TextField
        label={"Number per Shift"}
        type="number"
        value={vehicleInfo.numPerShift}
        sx={{ width: "20%" }}
        size="small"
        onChange={(e) =>
          setVehicleInfo({
            ...vehicleInfo,
            numPerShift: parseInt(e.target.value),
          })
        }
      />
      <FormControl sx={{ width: "20%" }}>
        <InputLabel id="light-duty-label" size="small">
          Shift Load
        </InputLabel>
        <Select
          value={vehicleInfo.shiftLoad}
          labelId="light-duty-label"
          label="Vehicle Type"
          size="small"
          onChange={(e) =>
            setVehicleInfo({
              ...vehicleInfo,
              shiftLoad: e.target.value as ShiftLoadType,
            })
          }
        >
          {["Low", "Medium", "High"].map((shiftLoad) => (
            <MenuItem value={shiftLoad} key={shiftLoad}>
              {shiftLoad}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ width: "20%" }}>
        <InputLabel id="light-duty-label" size="small">
          Vehicle Model
        </InputLabel>
        <Select
          value={vehicleInfo.model}
          labelId="light-duty-label"
          label="Vehicle model"
          size="small"
          onChange={(e) => {
            setVehicleInfo({
              ...vehicleInfo,
              model: e.target.value as VehicleType,
            });
          }}
        >
          {vehicleModel[parseInt(vehicleInfo.type ?? "0")].map(
            (vehicleType) => (
              <MenuItem value={vehicleType}>{vehicleType}</MenuItem>
            )
          )}
        </Select>
      </FormControl>
    </Stack>
  );
}
