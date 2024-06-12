import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import Slider, { SliderProps } from "@mui/material/Slider";
import React, { useEffect, useState } from "react";
import HelpTooltip from "components/HelpTooltip";
import { Tooltip } from "@mui/material";

export type SiteSpecificSliderProps = {
  min: number;
  max: number;
  step: number;
  InputLabels: { left: string; right: string };
  defaultValue: number;
  SliderProps?: SliderProps;
  onChange: (value: number[]) => void;
  disabled?: boolean;
};

const SiteSpecificSlider = ({
  min,
  max,
  step,
  defaultValue,
  InputLabels,
  SliderProps,
  onChange,
  disabled,
}: SiteSpecificSliderProps) => {
  const [firstValue, setFirstValue] = useState(defaultValue);
  const [secondValue, setSecondValue] = useState(max - defaultValue);

  useEffect(() => {
    setFirstValue(defaultValue as number);
    setSecondValue(max - (defaultValue as number));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSecondValue(newValue as number);
    setFirstValue(max - (newValue as number));
    onChange([max - (newValue as number), newValue as number]);
  };

  const setInputValue = (first: number, second: number) => {
    let firstValueInstance = first;
    if (!isNaN(first)) {
      if (first < min) {
        firstValueInstance = min;
      }
      if (first > max) {
        firstValueInstance = max;
      }
      setFirstValue(firstValueInstance);
      setSecondValue(max - firstValueInstance);
      onChange([firstValueInstance, max - firstValueInstance]);
    } else {
      setFirstValue(firstValue);
      setSecondValue(secondValue);
      onChange([firstValue, secondValue]);
    }
  };
  const handleFirstInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = Number(event.target.value);
    setInputValue(inputValue, max - inputValue);
  };

  const handleSecondInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = Number(event.target.value);
    setInputValue(max - inputValue, inputValue);
  };

  const handleFirstInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = Number(event.target.value);
    setInputValue(inputValue, max - inputValue);
  };
  const handleSecondInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = Number(event.target.value);
    setInputValue(max - inputValue, inputValue);
  };

  const tooltipTrailerText =
    "This slider is used to calculate the split between Straight Truck (FHWA vehicle classes 4, 5, 6, 7) and Tractor-Trailer (FHWA vehicle classes 8a, 8b) chargers in the Chargers tab. It has no effect on Arrival Profiles.";
  const tooltipSubscriptionText =
    "This slider does affect Arrival Profiles since the split between Public Access and Subscription chargers is displayed on this chart.";
  const privatePublicSliderTooltipText =
    "Slider is disabled due to \n" + " user input fleet information";
  const optimalMixTooltipText =
    "This slider is disabled due to optimal fleet selection.";
  const tooltipText =
    InputLabels.right === "Tractor-trailer"
      ? tooltipTrailerText
      : tooltipSubscriptionText;
  return (
    <Box sx={{ flex: 1 }}>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        sx={{ marginBottom: 1 }}
      >
        <Typography variant="body2">{InputLabels?.left} (%)</Typography>
        <HelpTooltip title={tooltipText}>
          <Typography variant="body2">{InputLabels?.right} (%)</Typography>
        </HelpTooltip>
      </Stack>
      <Tooltip
        title={
          InputLabels?.right === "Tractor-trailer"
            ? optimalMixTooltipText
            : privatePublicSliderTooltipText
        }
        arrow
        placement="right"
        disableHoverListener={!disabled}
      >
        <div>
          <Stack spacing={2} direction={"row"} alignItems="center">
            <Input
              value={firstValue}
              size="small"
              margin="dense"
              sx={{ textAlign: "center", width: "60px" }}
              onChange={handleFirstInputChange}
              onBlur={handleFirstInputBlur}
              inputProps={{
                step: step,
                min: min,
                max: max,
                type: "number",
              }}
              disabled={disabled}
            />

            <Slider
              value={secondValue}
              onChange={handleSliderChange}
              step={step}
              min={min}
              max={max}
              marks={true}
              valueLabelDisplay={"auto"}
              sx={{ marginTop: 1 }}
              {...SliderProps}
              disabled={disabled}
            />

            <Input
              value={secondValue}
              size="small"
              margin="none"
              sx={{ textAlign: "center", width: "60px" }}
              onChange={handleSecondInputChange}
              onBlur={handleSecondInputBlur}
              inputProps={{
                step: step,
                min: min,
                max: max,
                type: "number",
              }}
              disabled={disabled}
            />
          </Stack>
        </div>
      </Tooltip>
    </Box>
  );
};

export default SiteSpecificSlider;
