import { Slider } from "@mui/material";
import { SliderProps } from "@mui/material";

const hourMarks = [
  {
    value: 0,
    label: "12am",
  },
  {
    value: 4,
    label: "4am",
  },
  {
    value: 8,
    label: "8am",
  },
  {
    value: 12,
    label: "12pm",
  },
  {
    value: 16,
    label: "4pm",
  },
  {
    value: 20,
    label: "8pm",
  },
  {
    value: 23,
    label: "11pm",
  },
];

function convertNumberToTime(value: number): string {
  value = value % 24;
  let hours = Math.floor(value) % 24;
  let minutes = (value - hours) * 60;
  let amPm = "am";

  if (hours === 0) {
    hours = 12;
  } else if (hours === 12) {
    amPm = "pm";
  } else if (hours > 12) {
    hours = hours % 12;
    amPm = "pm";
  }

  let minutesStr = minutes.toString().padStart(2, "0");
  return hours + ":" + minutesStr + amPm;
}

export type TimeSliderProps = SliderProps & {
  duplicateMidnight?: boolean;
};

/**
 * TimeSlider is a wrapper around MUI's Slider that assumes that the values
 * represent the hours of a day, where 0 is midnight, 12 is noon, and 6.5 is 6:30.
 * It primarily will prettily format the values as times. All props are the same
 * as the props of Slider, and can override the props specifed here.
 */
export default function TimeSlider(props: TimeSliderProps) {
  const step = props.step || 1;
  const duplicateMidnight = props.duplicateMidnight || false;
  const max = duplicateMidnight ? 24 : 24 - step;
  return (
    <Slider
      max={max} // don't duplicate equivalent values on the slider
      marks={hourMarks}
      valueLabelFormat={convertNumberToTime}
      {...props}
    />
  );
}
