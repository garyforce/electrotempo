import {
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { ScenarioYearlyParam } from "types/hub-scenario-data";

type VehicleClassBoxProp = {
  vehicleClass: string | undefined;
  vehicleClassDescription: string | undefined;
  yearlyParams: ScenarioYearlyParam[];
};
export const VehicleClassBox = ({
  vehicleClass,
  vehicleClassDescription,
  yearlyParams,
}: VehicleClassBoxProp) => {
  return (
    <Box
      sx={{
        border: 0.5,
        borderColor: "silver",
        padding: "16px",
        borderRadius: 5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
          {`Vehicle class: ${vehicleClass ?? ""}`}
        </Typography>
        <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
        <Typography>{`Description: ${
          vehicleClassDescription ?? ""
        }`}</Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell align="right">Capture rate (Public)</TableCell>
              <TableCell align="right">Capture rate (Private)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {yearlyParams
              ?.sort((a, b) => a.year - b.year)
              .map((yearlyParam) => (
                <TableRow
                  key={yearlyParam.year}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ width: 50 }}>{yearlyParam.year}</TableCell>
                  <TableCell align="right">
                    {(yearlyParam.capture_rate * 100).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {(yearlyParam.subscription_capture_rate * 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VehicleClassBox;
