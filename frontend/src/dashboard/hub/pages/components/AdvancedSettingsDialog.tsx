import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Table as MuiTable,
  TableBody,
  TableCell as MuiTableCell,
  TableRow,
  TableContainer,
  TableHead,
  Typography,
  Input,
  InputAdornment,
  TextField,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import { HubScenarioYear } from "types/hub-scenario-year";
import { updateHubScenarioYears } from "api/hub/update-scenario";
import { fleetsDataType } from "api/hub/fleetData";
import { ScenarioYearlyParam } from "types/hub-scenario-data";
import {
  TRAILER_VEHICLE_TYPE_ID,
  TRUCK_VEHICLE_TYPE_ID,
} from "../HubScenarioPage";

const TableCell = styled(MuiTableCell)(() => ({
  border: `1px solid #000`,
}));
const Table = styled(MuiTable)(() => ({
  border: `1px solid #000`,
}));

type customInputProp = {
  endAdornment: string;
  value: number | string;
  onChange: (e: any) => void;
  readOnly?: boolean;
};
const CustomInput = ({
  endAdornment,
  value,
  onChange,
  readOnly,
}: customInputProp) => (
  <Input
    id="standard-adornment-weight"
    endAdornment={
      <InputAdornment position="end">{endAdornment}</InputAdornment>
    }
    type="number"
    inputProps={{
      min: 0,
      style: { textAlign: "center" },
    }}
    sx={{ width: "100px" }}
    disableUnderline={true}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    readOnly={readOnly}
  />
);

type AdvancedSettingsDialogProps = {
  yearlyModal: boolean;
  siteId: number;
  scenarioId: number;
  yearlyParams: ScenarioYearlyParam[];
  fleetsData: fleetsDataType;
  annualAveragePerCharger: number;
  handleYearlyModal: () => void;
  setAnnualAveragePerCharger: (value: number) => void;
  refetch: () => void;
};
export default function AdvancedSettingsDialog({
  yearlyModal,
  siteId,
  scenarioId,
  yearlyParams,
  fleetsData,
  annualAveragePerCharger,
  handleYearlyModal,
  setAnnualAveragePerCharger,
  refetch,
}: AdvancedSettingsDialogProps) {
  const [yearData, setYearData] = useState<HubScenarioYear[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [annualAverage, setAnnualAverage] = useState<number>(
    annualAveragePerCharger
  );

  useEffect(() => {
    const yearParams = yearlyParams.map((data) => ({
      ...data,
      scenario_id: scenarioId,
    }));
    setYearData(
      yearParams.map((yearParam) => ({
        ...yearParam,
        max_utility_supply: yearParam.max_utility_supply,
      })) || []
    );
    const years = yearParams?.map((data) => data.year) || [];
    setYears(
      years.filter((year, index) => years.indexOf(year) === index).sort()
    );
  }, [yearlyParams, scenarioId]);

  const onChangeYearlyParams = (
    year: number,
    vehicleType: number,
    objectKey: keyof HubScenarioYear,
    value: string
  ) => {
    const updatedYearlyParams = yearData.map((yearlyParams) => {
      if (objectKey === "max_utility_supply" && yearlyParams.year === year) {
        yearlyParams[objectKey] = Number(value);
      } else if (
        yearlyParams.year === year &&
        yearlyParams.vehicle_type_id === vehicleType
      ) {
        yearlyParams[objectKey] = Number(value) / 100;
      }
      return yearlyParams;
    });
    setYearData(updatedYearlyParams);
  };

  const saveScenarioYear = () => {
    setAnnualAveragePerCharger(annualAverage);
    updateHubScenarioYears(siteId, scenarioId, yearData).then(() => {
      refetch();
      handleYearlyModal();
    });
  };

  const hasFleets = useMemo(() => {
    return Object.keys(fleetsData).length > 0;
  }, [fleetsData]);

  return (
    <Dialog
      open={yearlyModal}
      onClose={() => handleYearlyModal()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={false}
    >
      <IconButton
        aria-label="close"
        onClick={() => handleYearlyModal()}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <GridCloseIcon />
      </IconButton>
      <DialogContent sx={{ padding: 5, paddingBottom: 3 }}>
        <Box>
          <Typography
            sx={{ flex: "1 1 100%", marginBottom: 3 }}
            variant="h2"
            id="tableTitle"
            component="div"
          >
            Advanced Settings
          </Typography>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={2} rowSpan={2}></TableCell>
                  <TableCell align="center" rowSpan={2}>
                    Maximum Utility Supply(MW)
                  </TableCell>
                  <TableCell align="center" colSpan={5}>
                    Capture Rates(%)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center">Public Straight Trucks</TableCell>
                  <TableCell align="center">Private Straight Trucks</TableCell>
                  <TableCell align="center">Public Tractor-Trailers</TableCell>
                  <TableCell align="center">Private Tractor-Trailers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {yearData.length > 0 &&
                  years.map((year: number, index: number) => (
                    <TableRow key={index}>
                      {index === 0 && (
                        <TableCell align="center" rowSpan={years.length}>
                          Planning Year
                        </TableCell>
                      )}
                      <TableCell align="center">{year}</TableCell>
                      <TableCell align="center">
                        <CustomInput
                          endAdornment={"MW"}
                          value={
                            yearData.filter(
                              (yearlyParams) =>
                                yearlyParams.year === year &&
                                yearlyParams.vehicle_type_id ===
                                  TRUCK_VEHICLE_TYPE_ID
                            )[0]?.max_utility_supply
                          }
                          onChange={(value) => {
                            onChangeYearlyParams(
                              year,
                              TRUCK_VEHICLE_TYPE_ID,
                              "max_utility_supply",
                              value
                            );
                            onChangeYearlyParams(
                              year,
                              TRAILER_VEHICLE_TYPE_ID,
                              "max_utility_supply",
                              value
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <CustomInput
                          endAdornment={"%"}
                          value={(
                            yearData.filter(
                              (yearlyParams) =>
                                yearlyParams.year === year &&
                                yearlyParams.vehicle_type_id ===
                                  TRUCK_VEHICLE_TYPE_ID
                            )[0]?.capture_rate * 100
                          ).toFixed(0)}
                          onChange={(value) =>
                            onChangeYearlyParams(
                              year,
                              TRUCK_VEHICLE_TYPE_ID,
                              "capture_rate",
                              value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: hasFleets ? "#ddd" : "#fff" }}
                      >
                        <CustomInput
                          endAdornment={"%"}
                          value={(
                            yearData.filter(
                              (yearlyParams) =>
                                yearlyParams.year === year &&
                                yearlyParams.vehicle_type_id ===
                                  TRUCK_VEHICLE_TYPE_ID
                            )[0]?.subscription_capture_rate * 100
                          ).toFixed(0)}
                          onChange={(value) =>
                            onChangeYearlyParams(
                              year,
                              TRUCK_VEHICLE_TYPE_ID,
                              "subscription_capture_rate",
                              value
                            )
                          }
                          readOnly={hasFleets}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <CustomInput
                          endAdornment={"%"}
                          value={(
                            yearData.filter(
                              (yearlyParams) =>
                                yearlyParams.year === year &&
                                yearlyParams.vehicle_type_id ===
                                  TRAILER_VEHICLE_TYPE_ID
                            )[0]?.capture_rate * 100
                          ).toFixed(0)}
                          onChange={(value) =>
                            onChangeYearlyParams(
                              year,
                              TRAILER_VEHICLE_TYPE_ID,
                              "capture_rate",
                              value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: hasFleets ? "#ddd" : "#fff" }}
                      >
                        <CustomInput
                          endAdornment={"%"}
                          value={(
                            yearData.filter(
                              (yearlyParams) =>
                                yearlyParams.year === year &&
                                yearlyParams.vehicle_type_id ===
                                  TRAILER_VEHICLE_TYPE_ID
                            )[0]?.subscription_capture_rate * 100
                          ).toFixed(0)}
                          onChange={(value) =>
                            onChangeYearlyParams(
                              year,
                              TRAILER_VEHICLE_TYPE_ID,
                              "subscription_capture_rate",
                              value
                            )
                          }
                          readOnly={hasFleets}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginTop: 3,
            }}
          >
            <Typography
              sx={{ marginRight: 3 }}
              variant="h3"
              id="tableTitle"
              component="span"
            >
              Average Annual Maintenance Cost Per Charger
            </Typography>
            <TextField
              sx={{ m: 1, width: "130px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              type="number"
              value={annualAverage}
              inputProps={{ min: 0 }}
              onChange={(e) => setAnnualAverage(Number(e.target.value))}
            />
          </Box>
        </Box>
        <DialogActions sx={{ marginTop: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={saveScenarioYear}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="inherit"
            sx={{ color: "black" }}
            onClick={() => handleYearlyModal()}
          >
            Cancel
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
