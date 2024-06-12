import { FormControl, FormLabel, Slider, Stack } from "@mui/material";
import { Mark } from "@mui/base";
import HelpTooltip from "components/HelpTooltip";

type YearControlProps = {
  years?: number[];
  increment?: number;
  value?: number;
  onChange?: (e: Event) => void;
  disabled?: boolean;
  helpText?: string;
};

function createMarks(years: number[], increment: number): Mark[] {
  let marks = [];
  for (let i = 0; i < years.length - 1; i += increment) {
    marks.push({
      value: years[i],
      label: String(years[i]),
    });
  }
  marks.push({
    value: years[years.length - 1],
    label: String(years[years.length - 1]),
  });
  return marks;
}

const defaultHelpText =
  "Charging demand data is drawn from the projected demand of the selected horizon year.";

function YearControl({
  years,
  increment,
  value,
  onChange,
  disabled,
  helpText,
}: YearControlProps) {
  increment = increment ?? 5;
  helpText = helpText ?? defaultHelpText;
  const marks = years ? createMarks(years, increment) : undefined;
  const min = years ? Math.min(...years) : undefined;
  const max = years ? Math.max(...years) : undefined;
  const showHelpTooltip = helpText.length > 0;
  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <FormControl component="fieldset" className="year-control">
        {showHelpTooltip && (
          <HelpTooltip title={helpText}>
            <FormLabel>Horizon</FormLabel>
          </HelpTooltip>
        )}
        {!showHelpTooltip && <FormLabel>Horizon</FormLabel>}
        <Slider
          step={1}
          min={min}
          max={max}
          marks={marks}
          onChange={(
            event: Event,
            value: number | number[],
            activeThumb: number
          ) => {
            if (onChange !== undefined) {
              onChange(event);
            }
          }}
          value={value}
          valueLabelDisplay={"auto"}
          disabled={disabled}
        />
      </FormControl>
    </Stack>
  );
}

export default YearControl;
