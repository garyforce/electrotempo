import PropTypes from "prop-types";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function GrowthScenarioControl(props) {
  return (
    <FormControl className="growth-scenario-control">
      <InputLabel id="demo-simple-select-label">Growth Scenario</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={props.selectedGrowthScenario?.id ?? ""}
        label="Growth Scenario"
        onChange={props.onChange}
        disabled={props.disabled}
      >
        {props.growthScenarios?.map((growthScenario) => {
          return (
            <MenuItem value={growthScenario.id} key={growthScenario.id}>
              {growthScenario.name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

GrowthScenarioControl.propTypes = {
  /* The object representing the current growth scenario */
  selectedGrowthScenario: PropTypes.object,
  /* An array of all the selectable growth scenario objects */
  growthScenarios: PropTypes.arrayOf(PropTypes.object),
  /* Function called when the Select component changes */
  onChange: PropTypes.func,
  /* Disable this component */
  disabled: PropTypes.bool,
};

export default GrowthScenarioControl;
