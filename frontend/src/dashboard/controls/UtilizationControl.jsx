import React from "react";
import PropTypes from "prop-types";

import { FormControl, FormLabel, Slider } from "@mui/material";

function UtilizationControl(props) {
  const utilizationMarks = [
    {
      value: 0.1,
      label: "10%",
    },
    {
      value: 0.2,
      label: "20%",
    },
    {
      value: 0.3,
      label: "30%",
    },
    {
      value: 0.4,
      label: "40%",
    },
    {
      value: 0.5,
      label: "50%",
    },
  ];
  return (
    <FormControl component="fieldset" className="utilization-control">
      <FormLabel>Charger Utilization Level</FormLabel>
      <Slider
        aria-labelledby="discrete-slider-small-steps"
        step={0.1}
        min={0.1}
        max={0.5}
        marks={utilizationMarks}
        valueLabelDisplay="off"
        onChange={(e, val) => props.onChange(val)}
        value={props.utilization}
        disabled={props.disabled}
      />
    </FormControl>
  );
}

UtilizationControl.propTypes = {
  /* the value on the slider */
  utilization: PropTypes.number.isRequired,
  /* function called when the slider changes value */
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default UtilizationControl;
