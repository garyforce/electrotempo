import {
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";

function formatHourToNumber(time: string) {
  const hour = parseInt(time.split(":")[0]);
  return hour;
}

const calculateStartHour = (hour: string) => {
  const formattedHour = formatHourToNumber(hour);
  const startHour = formattedHour % 12 || 12;
  const startPeriod = formattedHour >= 12 ? "PM" : "AM";
  return `${startHour.toFixed(2).replace(".", ":")} ${startPeriod}`;
};

export type ShiftScheduleInformationProps = {
  vehiclePerShift: number | undefined;
  shiftSchedule: number[] | undefined;
};

const ShiftScheduleInformation = ({
  vehiclePerShift,
  shiftSchedule,
}: ShiftScheduleInformationProps) => {
  const formatHour = (hour: number | string | undefined) => {
    if (hour === "" || hour === undefined) {
      return "";
    } else if (Number(hour) === 0) {
      return "12 AM";
    } else if (Number(hour) === 12) {
      return "12 PM";
    } else if (Number(hour) < 12) {
      return `${hour} AM`;
    } else {
      return `${Number(hour) - 12} PM`;
    }
  };

  return (
    <Box
      sx={{
        border: 0.5,
        padding: "16px",
        borderColor: "silver",
        borderRadius: 5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
          Shift Information
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List>
        <ListItem disableGutters>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ListItem disableGutters>
                <ListItemText
                  primary="Day Start Hour"
                  secondary={formatHour(shiftSchedule?.indexOf(1)) ?? ""}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem disableGutters>
                <ListItemText
                  primary="Day End Hour"
                  secondary={formatHour(shiftSchedule?.lastIndexOf(1)) ?? ""}
                />
              </ListItem>
            </Grid>
            <Grid item xs={6}>
              <ListItem disableGutters>
                <ListItemText
                  primary="Vehicles Per Shift"
                  secondary={vehiclePerShift ?? 0}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem disableGutters>
                <ListItemText
                  primary="Hours of Break Per Day"
                  secondary={shiftSchedule?.filter((x) => x === 2).length ?? 0}
                />
              </ListItem>
            </Grid>
          </Grid>
        </ListItem>
      </List>
    </Box>
  );
};

export default ShiftScheduleInformation;
