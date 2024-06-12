import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { TrafficModel } from "types/traffic-model";

type TrafficModelControlProps = {
  selectedTrafficModel?: TrafficModel;
  trafficModels?: TrafficModel[];
  onChange?: (e: SelectChangeEvent) => void;
  disabled?: boolean;
};

function TrafficModelControl(props: TrafficModelControlProps) {
  return (
    <FormControl className="traffic-model-control">
      <InputLabel sx={{ marginTop: 1 }} id="traffic-model-select-label">
        Traffic Model
      </InputLabel>
      <Select
        sx={{ marginTop: 1 }}
        labelId="traffic-model-select-label"
        id="traffic-model-select"
        value={props.selectedTrafficModel?.id.toString() ?? ""}
        label="Traffic Model"
        onChange={props.onChange}
        disabled={props.disabled}
      >
        {props.trafficModels?.map((trafficModel: TrafficModel) => {
          return (
            <MenuItem value={trafficModel.id} key={trafficModel.id}>
              {trafficModel.name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default TrafficModelControl;
