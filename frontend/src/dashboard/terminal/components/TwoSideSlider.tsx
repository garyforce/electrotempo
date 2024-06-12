import { Grid, InputAdornment, Box, Input } from "@mui/material";
import Slider, { SliderProps } from "@mui/material/Slider";
import React from "react";
import { useAppSelector } from "redux/store";
export type TwoSideSliderProps = {
  min: number;
  max: number;
  value: number;
  SliderProps?: SliderProps;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const TwoSideSlider = ({
  min,
  max,
  value,
  SliderProps,
  onChange,
  disabled,
}: TwoSideSliderProps) => {
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    onChange(max - (newValue as number));
  };
  const setInputValue = (first: number) => {
    let firstValueInstance = first;
    if (!isNaN(first)) {
      if (first < min) {
        firstValueInstance = min;
      }
      if (first > max) {
        firstValueInstance = max;
      }
      onChange(firstValueInstance);
    }
  };
  const handleFirstInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = Number(event.target.value);
    setInputValue(inputValue);
  };

  const handleSecondInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = Number(event.target.value);
    setInputValue(max - inputValue);
  };

  const handleFirstInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = Number(event.target.value);
    setInputValue(inputValue);
  };
  const handleSecondInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = Number(event.target.value);
    setInputValue(max - inputValue);
  };

  return (
    <Box>
      <Grid container alignItems="center" sx={{ marginTop: "0.2em" }}>
        <Grid item xs={9} sx={{ display: "flex" }}>
          <Input
            size="small"
            margin="none"
            value={value}
            sx={{ textAlign: "center", marginRight: "1em", width: "100px" }}
            onChange={handleFirstInputChange}
            onBlur={handleFirstInputBlur}
            endAdornment={<InputAdornment position="end">$</InputAdornment>}
            inputProps={{
              min: min,
              max: max,
              type: "number",
            }}
            disabled={disabled}
          />
          <Slider
            value={max - value}
            onChange={handleSliderChange}
            min={min}
            max={max}
            {...SliderProps}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs>
          <Input
            value={max - value}
            size="small"
            margin="none"
            sx={{ textAlign: "center", marginLeft: "1em" }}
            onChange={handleSecondInputChange}
            onBlur={handleSecondInputBlur}
            endAdornment={<InputAdornment position="end">$</InputAdornment>}
            inputProps={{
              min: min,
              max: max,
              type: "number",
            }}
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TwoSideSlider;
