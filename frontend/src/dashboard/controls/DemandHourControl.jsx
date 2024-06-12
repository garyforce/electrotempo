import PropTypes from "prop-types";

import {
  Stack,
  FormControl,
  Checkbox,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TimeSlider from "components/TimeSlider";

function DemandHourControl(props) {
  return (
    <FormControl component="fieldset" className="demand-hour-control">
      <Stack direction="row" justifyContent="space-between">
        <FormLabel>Hour</FormLabel>
        <FormControlLabel
          disabled={props.preloading}
          control={<Checkbox size="small" />}
          label="All day"
          labelPlacement="start"
          checked={props.allDayCheckbox}
          onChange={(event, value) => props.onAllDayCheckboxChange(value)}
          className="all-day-checkbox"
        />
      </Stack>
      <TimeSlider
        disabled={props.allDayCheckbox}
        step={1}
        onChange={(e, val) => props.onHourChange(val)}
        valueLabelDisplay="auto"
        value={props.hour}
        className="demand-hour-slider"
      />
      <LoadingButton
        color="primary"
        variant="outlined"
        loading={props.preloading}
        loadingIndicator={"loading data..."}
        onClick={props.onAnimationButtonClick}
        disabled={
          props.disableAnimationButton || props.allDayCheckbox || props.disabled
        }
        sx={{
          marginTop: "1rem",
          display: props.isPlayButtonHide ? "none" : "block",
        }}
        className="animation-button"
      >
        {props.playingAnimation ? <PauseIcon /> : <PlayArrowIcon />}
      </LoadingButton>
    </FormControl>
  );
}

DemandHourControl.propTypes = {
  preloading: PropTypes.bool,
  playingAnimation: PropTypes.bool,
  allDayCheckbox: PropTypes.bool,
  onAllDayCheckboxChange: PropTypes.func.isRequired,
  hour: PropTypes.number,
  onHourChange: PropTypes.func.isRequired,
  onAnimationButtonClick: PropTypes.func,
  disableAnimationButton: PropTypes.bool,
  disableAllDayCheckbox: PropTypes.bool,
  disabled: PropTypes.bool,
  isPlayButtonHide: PropTypes.bool,
};

export default DemandHourControl;
