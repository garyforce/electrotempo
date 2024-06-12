import {
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from "@mui/material";

function SeasonControl(props) {
  const uniqueAcs = [
    ...new Set(props.chargingDemandSimulations?.map((cds) => cds.ac)),
  ];
  return (
    <FormControl component="fieldset" className="season-control">
      <FormLabel>Season</FormLabel>
      <RadioGroup
        name="type"
        value={props.ac}
        onChange={(event, value) => props.onChange(value)}
      >
        <FormControlLabel
          value="high"
          disabled={
            props.playingAnimation ||
            props.preloading ||
            !uniqueAcs.includes("high") ||
            props.disabled
          }
          control={<Radio />}
          label="Winter/Summer"
        />
        <FormControlLabel
          value="low"
          disabled={
            props.playingAnimation ||
            props.preloading ||
            !uniqueAcs.includes("low") ||
            props.disabled
          }
          control={<Radio />}
          label="Spring/Fall"
        />
      </RadioGroup>
    </FormControl>
  );
}

export default SeasonControl;
