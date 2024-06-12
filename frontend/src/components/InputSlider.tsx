import React from "react";
import {
  Box,
  Grid,
  Slider,
  Input,
  InputProps,
  SliderProps,
} from "@mui/material";

interface Props {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  InputProps?: InputProps;
  SliderProps?: SliderProps;
}

const InputSlider: React.FC<Props> = ({
  min,
  max,
  step,
  value,
  onChange,
  SliderProps,
  InputProps,
}) => {
  const handleChange = (event: any, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(event.target.value);
    if (newValue > max) {
      newValue = max;
    }
    onChange(newValue);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    let newValue = parseFloat(event.target.value);
    if (newValue < min) {
      newValue = min;
    }
    onChange(newValue);
  };

  return (
    <Box>
      <Grid container alignItems="center" sx={{ marginTop: "0.2em" }}>
        <Grid item xs={9} sx={{ marginRight: "1em" }}>
          <Slider
            {...SliderProps}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            aria-labelledby="slider-input"
          />
        </Grid>
        <Grid item xs>
          <Input
            {...InputProps}
            value={value}
            margin="dense"
            type="number"
            inputProps={{
              min,
              max,
              step,
            }}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InputSlider;
