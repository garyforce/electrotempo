import React from "react";
import PropTypes from "prop-types";

import {
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Slider,
  IconButton,
  Button,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddBoxIcon from "@mui/icons-material/AddBox";

function RevenueControl(props) {
  const peakHourMarks = [
    {
      value: 0,
      label: "12am",
    },
    {
      value: 12,
      label: "12pm",
    },
    {
      value: 24,
      label: "12am",
    },
  ];
  return (
    <Stack spacing={2}>
      <Typography>Electricity Cost</Typography>
      {props.peakHours.length < 1 ? (
        <TextField
          defaultValue={props.offPeakPricePerKwh.toFixed(4)}
          onBlur={props.onOffPeakPricePerKwhChange}
          onKeyPress={(event) => {
            if (event.key === "Enter") props.onOffPeakPricePerKwhChange(event);
          }}
          InputProps={{
            inputMode: "numeric",
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          label="Price per kwh"
        />
      ) : (
        <>
          <TextField
            defaultValue={props.offPeakPricePerKwh.toFixed(4)}
            onBlur={props.onOffPeakPricePerKwhChange}
            InputProps={{
              inputMode: "numeric",
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            onKeyPress={(event) => {
              if (event.key === "Enter")
                props.onOffPeakPricePerKwhChange(event);
            }}
            label="Off-peak price per kwh"
          />
          <TextField
            defaultValue={props.peakPricePerKwh.toFixed(4)}
            onBlur={props.onPeakPricePerKwhChange}
            InputProps={{
              inputMode: "numeric",
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            onKeyPress={(event) => {
              if (event.key === "Enter") props.onPeakPricePerKwhChange(event);
            }}
            label="Peak price per kwh"
          />
        </>
      )}
      <Typography>Peak hours</Typography>
      {props.peakHours.map((peak) => {
        return (
          <Stack key={peak.id} direction="row" alignItems="center">
            <Slider
              aria-labelledby="discrete-slider-small-steps"
              step={1}
              min={0}
              max={24}
              marks={peakHourMarks}
              valueLabelDisplay="auto"
              defaultValue={peak.range}
              onChange={(event) =>
                props.onPeakHourChange(peak.id, event.target.value)
              }
              key={peak.id}
            />
            <IconButton
              sx={{ top: "-10px", left: "15px" }}
              onClick={() => props.onRemovePeakHourRange(peak.id)}
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Stack>
        );
      })}
      {/* Using timestamp as ID to uniquely identify without repeating */}
      <Button
        variant="outlined"
        startIcon={<AddBoxIcon />}
        onClick={() => props.onAddPeakHourRange(Date.now(), 9, 15)}
      >
        Add peak hour range
      </Button>
    </Stack>
  );
}

RevenueControl.propTypes = {
  peakHours: PropTypes.array,
  onPeakHourChange: PropTypes.func,
  onRemovePeakHourRange: PropTypes.func,
  onAddPeakHourRange: PropTypes.func,
  offPeakPricePerKwh: PropTypes.number,
  onOffPeakPricePerKwhChange: PropTypes.func,
  peakPricePerKwh: PropTypes.number,
  onPeakPricePerKwhChange: PropTypes.func,
};

export default RevenueControl;
