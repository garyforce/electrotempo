import PropTypes from "prop-types";

import {
  Stack,
  Checkbox,
  Typography,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import HelpTooltip from "components/HelpTooltip";

function DemandDensityControl(props) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      className="demand-density-control"
    >
      <FormControl>
        <FormLabel>Map Display Options</FormLabel>
        <HelpTooltip
          title={
            "Demand density normalizes demand by the size of the block group, making it easier to identify locations with high demand relative to their size"
          }
        >
          <FormControlLabel
            control={<Checkbox size="small" checked={props.checked} />}
            label={<Typography>Use demand density</Typography>}
            onChange={props.onChange}
            sx={{ marginRight: "-0.2em" }}
          />
        </HelpTooltip>
      </FormControl>
    </Stack>
  );
}

DemandDensityControl.propTypes = {
  // function called when the checkbox values changes
  onChange: PropTypes.func,
  // value of the `checked` prop of the internal Checkbox control
  checked: PropTypes.bool.isRequired,
};

export default DemandDensityControl;
