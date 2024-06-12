import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";

import { ReactourStep } from "reactour";

const chargerLevelControlClassName: string = "charger-level-control";

export const chargerLevelControlTourStep: ReactourStep = {
  selector: `.${chargerLevelControlClassName}`,
  content: (
    <Typography>
      Coverage can be calculated using specific charger levels.
    </Typography>
  ),
};

type ChargerLevelControlProps = {
  selectedChargerLevels: string[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  disabled?: boolean;
};

export default function ChargerLevelControl({
  selectedChargerLevels,
  onChange,
  disabled,
}: ChargerLevelControlProps) {
  const error: boolean = selectedChargerLevels.length < 1;
  return (
    <FormControl
      error={error}
      component="fieldset"
      className={chargerLevelControlClassName}
    >
      <FormLabel>Charger Level {error ? "*" : ""}</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedChargerLevels.includes("l1")}
              value="l1"
              onChange={onChange}
              disabled={disabled}
            />
          }
          label="Level 1"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedChargerLevels.includes("l2")}
              value="l2"
              onChange={onChange}
              disabled={disabled}
            />
          }
          label="Level 2"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedChargerLevels.includes("dcf")}
              value="dcf"
              onChange={onChange}
              disabled={disabled}
            />
          }
          label="DC Fast"
        />
      </FormGroup>
      {error && <FormHelperText>* Pick one or more</FormHelperText>}
    </FormControl>
  );
}
