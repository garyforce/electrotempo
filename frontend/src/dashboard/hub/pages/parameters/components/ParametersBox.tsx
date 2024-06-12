import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { ScenarioYearlyParam, SegmentData } from "types/hub-scenario-data";
import { HubUtilityRate } from "types/hub-utility-rate";

type ParameterTableRow = {
  year: number;
  truckEvAdoptionRate: number;
  trailerEvAdoptionRate: number;
  maxUtilitySupply: number;
};

type ParametersProp = {
  siteName: string | undefined;
  scenarioName: string | undefined;
  utilityRate: HubUtilityRate | null | undefined;
  truckData: SegmentData | undefined;
  trailerData: SegmentData | undefined;
  truckYearlyParams: ScenarioYearlyParam[];
  trailerYearlyParams: ScenarioYearlyParam[];
};
const ParametersBox = ({
  siteName,
  scenarioName,
  utilityRate,
  truckData,
  trailerData,
  truckYearlyParams,
  trailerYearlyParams,
}: ParametersProp) => {
  const spaceRequirements = useMemo(() => {
    const truckSpaceRequirement = truckData?.vehicle_parking_space_requirement;
    const trailerSpaceRequirement =
      trailerData?.vehicle_parking_space_requirement;
    return `Straight Truck spot (plus overhead): ${truckSpaceRequirement} sq. ft., Tractor-Trailer spot (plus overhead): ${trailerSpaceRequirement} sq. ft.`;
  }, [truckData, trailerData]);

  const formattedUtilityRate = useMemo(() => {
    const energyChargeRate = utilityRate?.energy_charge_rate ?? 0;
    const demandChargeRate = utilityRate?.demand_charge_rate ?? 0;
    return `Energy rate: ${energyChargeRate} $/kWh, Demand charge: ${demandChargeRate} $/kW`;
  }, [utilityRate]);

  const tableData = useMemo(() => {
    const data: ParameterTableRow[] = [];
    truckYearlyParams.forEach((yearlyParam) => {
      data[yearlyParam.year] = {} as ParameterTableRow;
      data[yearlyParam.year].year = yearlyParam.year;
      data[yearlyParam.year].truckEvAdoptionRate = yearlyParam.ev_adoption_rate;
      data[yearlyParam.year].maxUtilitySupply = yearlyParam.max_utility_supply;
    });
    trailerYearlyParams.forEach((yearlyParam) => {
      data[yearlyParam.year].trailerEvAdoptionRate =
        yearlyParam.ev_adoption_rate;
    });
    return Object.values(data);
  }, [truckYearlyParams, trailerYearlyParams]);

  return (
    <Box
      sx={{
        border: 0.5,
        borderColor: "silver",
        padding: "16px",
        borderRadius: 5,
        marginBottom: 2,
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
          {`Parameters for ${siteName ?? ""}`}
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List dense>
        <ListItem disableGutters>
          <ListItemText
            primary="EV adoption scenario:"
            secondary={scenarioName ?? ""}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Utility Name"
            secondary={utilityRate?.utility.name ?? ""}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Utility Rates"
            secondary={formattedUtilityRate}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Space Requirements"
            secondary={spaceRequirements}
          />
        </ListItem>
      </List>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell align="right">
                EV adoption % (Straight Truck)
              </TableCell>
              <TableCell align="right">
                EV adoption % (Tractor-Trailer)
              </TableCell>
              <TableCell align="right">Utility Supply (MW)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData
              ?.sort((a, b) => a.year - b.year)
              ?.map((row) => (
                <TableRow
                  key={row.year}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.year}
                  </TableCell>
                  <TableCell align="right">
                    {" "}
                    {!isNaN(row.truckEvAdoptionRate)
                      ? (row.truckEvAdoptionRate * 100).toFixed(2)
                      : ""}
                  </TableCell>
                  <TableCell align="right">
                    {!isNaN(row.trailerEvAdoptionRate)
                      ? (row.trailerEvAdoptionRate * 100).toFixed(2)
                      : ""}
                  </TableCell>
                  <TableCell align="right">{row.maxUtilitySupply}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParametersBox;
