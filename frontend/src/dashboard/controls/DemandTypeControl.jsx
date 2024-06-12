import {
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  FormHelperText,
} from "@mui/material";

function DemandTypeControl(props) {
  const error = props.demandTypes.length < 1;
  return (
    <FormControl
      error={error}
      component="fieldset"
      className="demand-type-control"
    >
      <FormLabel>Charging Demand Type {error ? "*" : ""}</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.demandTypes.includes("Home")}
              value="Home"
              disabled={props.disabled || props.preloading}
              onChange={props.onDemandTypesChange}
            />
          }
          label="Home"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.demandTypes.includes("Office")}
              value="Office"
              disabled={props.disabled || props.preloading}
              onChange={props.onDemandTypesChange}
            />
          }
          label="Workplace"
        />
        <FormControlLabel
          control={
            <Checkbox
              value="Public"
              disabled={props.disabled || props.preloading}
              checked={props.demandTypes.includes("Public")}
              onChange={props.onDemandTypesChange}
            />
          }
          label="Public"
        />
      </FormGroup>
      {error && <FormHelperText>* Pick one or more</FormHelperText>}
    </FormControl>
  );
}

export default DemandTypeControl;
