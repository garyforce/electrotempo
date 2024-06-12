import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChartData, ChartDataset, ChartOptions, Tick } from "chart.js";

import { Chart } from "react-chartjs-2";
import HelpTooltip from "components/HelpTooltip";
import InputSlider from "components/InputSlider";
import { VehicleClass } from "types/vehicle-class";
import { levenbergMarquardt } from "ml-levenberg-marquardt";

function logisticCurve(x: number, L: number, x0: number, k: number) {
  return L / (1 + Math.E ** (-k * (x - x0)));
}

function logisticCurveFixedMaxGenerator(maxValue: number) {
  return ([midPoint, steepness]: number[]) => {
    return (x: number) => logisticCurve(x, maxValue, midPoint, steepness);
  };
}
const customSalesCurveOptions: ChartOptions = {
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (
          value: string | number,
          index: number,
          ticks: Tick[]
        ) {
          return value + "%";
        },
      },
      max: 100,
    },
    x: {
      ticks: {
        maxRotation: 90,
        minRotation: 90,
        labelOffset: -6,
        autoSkip: true,
        maxTicksLimit: 10,
      },
      min: 2010,
      max: 2100,
    },
  },
  maintainAspectRatio: false,
  responsive: true,
};

const customSalesCurveYears = Array.from(new Array(90), (x, i) => i + 2010);

export function getLogisticCurveParametersFromVehicleClass(
  vehicleClass: VehicleClass
) {
  const { config } = vehicleClass;

  const dataToFit = {
    x: [
      config.startYear,
      new Date().getFullYear(),
      config.targetYear,
      config.finalYear,
    ],
    y: [
      config.startMarketshare,
      config.currentMarketshare,
      config.targetMarketshare,
      config.finalMarketshare,
    ],
  };

  const fittingOptions = {
    damping: 1.5,
    initialValues: [2035, 0.17],
    gradientDifference: 10e-2,
    maxIterations: 100,
    errorTolerance: 10e-5,
  };
  const fittedParams = levenbergMarquardt(
    dataToFit,
    logisticCurveFixedMaxGenerator(config.finalMarketshare),
    fittingOptions
  );

  const [x0, k] = fittedParams.parameterValues;
  return {
    L: config.finalMarketshare,
    x0,
    k,
  };
}

type SalesCurvePageProps = {
  onClose: () => void;
  onNextButtonClick: () => void;
  onBackButtonClick: () => void;
  vehicleClass: VehicleClass;
  onVehicleClassChange: (vehicleClass: VehicleClass) => void;
  lastPage: boolean;
};
export default function SalesCurvePage(props: SalesCurvePageProps) {
  const { vehicleClass } = props;
  const { config } = vehicleClass;

  const customSalesCurveData: ChartData = {
    labels: customSalesCurveYears,
    datasets: [
      {
        type: "line",
        label: "Percent of Sales",
        order: 1,
        data: [],
        borderColor: "rgb(5, 194, 204)",
        backgroundColor: "rgb(5, 194, 204, 0.5)",
      },
    ],
  };

  const pointsToDisplay = {
    x: [new Date().getFullYear(), config.targetYear, config.finalYear],
    y: [
      config.currentMarketshare,
      config.targetMarketshare,
      config.finalMarketshare,
    ],
  };

  const { x0, k, L } = getLogisticCurveParametersFromVehicleClass(vehicleClass);

  customSalesCurveData.datasets[0].data = customSalesCurveYears.map((year) =>
    logisticCurve(year, L * 100, x0, k)
  );
  const fittedDataPointsDataset: ChartDataset = {
    type: "scatter",
    label: "Fitted Points",
    order: 0,
    data: pointsToDisplay.x.map((x, index) => {
      const year = x.toString();
      const label = customSalesCurveYears.includes(x) ? year : "";
      return {
        x: x,
        y: pointsToDisplay.y[index] * 100,
        label: label, //TODO: make this label the tooltip title for fitted points
      };
    }),
    borderColor: "rgb(255, 60, 60)",
    backgroundColor: "rgb(255, 120, 120, 0.5)",
  };
  customSalesCurveData.datasets.push(fittedDataPointsDataset);

  const nextDisabled = config.startingPopulation <= 0;

  const buttonText = props.lastPage ? "Submit" : "Next";

  return (
    <>
      <DialogContent>
        <Stack spacing={2} divider={<Divider />}>
          <Typography variant="h2">Settings for {vehicleClass.name}</Typography>
          <Stack spacing={2}>
            <Typography variant="h3">Population</Typography>
            <Stack direction="row" spacing={4}>
              <TextField
                required
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                type={"number"}
                label={"Initial Vehicle Class Population"}
                value={vehicleClass.config.startingPopulation}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const newVehicleClass = structuredClone(vehicleClass);
                  newVehicleClass.config.startingPopulation = Number(
                    event.target.value
                  );
                  props.onVehicleClassChange(newVehicleClass);
                }}
                sx={{ width: "50%" }}
              />
              <Box sx={{ width: "50%" }}>
                <HelpTooltip title="The average annual growth rate of this vehicle class's population.">
                  <Typography>Vehicle Population Growth Rate</Typography>
                </HelpTooltip>
                <InputSlider
                  min={0}
                  max={6}
                  step={0.1}
                  value={Number((config.growthRate * 100).toFixed(1))} // fixing floating point bullshit
                  onChange={(newGrowthRate) => {
                    newGrowthRate = newGrowthRate / 100;
                    const newVehicleClass = structuredClone(vehicleClass);
                    newVehicleClass.config.growthRate = newGrowthRate;
                    props.onVehicleClassChange(newVehicleClass);
                  }}
                  SliderProps={{ valueLabelDisplay: "auto" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Stack>
            <Stack direction="row" spacing={4} alignItems={"center"}>
              <Stack spacing={2} sx={{ width: "50%" }}>
                <Box>
                  <HelpTooltip title="The percentage of cars that are scrapped each year.">
                    <Typography>Base Scrappage Rate</Typography>
                  </HelpTooltip>
                  <InputSlider
                    min={4}
                    max={20}
                    step={0.1}
                    value={Number((config.scrappageRate * 100).toFixed(1))}
                    onChange={(newScrappageRate) => {
                      newScrappageRate = newScrappageRate / 100;
                      const newVehicleClass = structuredClone(vehicleClass);
                      newVehicleClass.config.scrappageRate = newScrappageRate;
                      props.onVehicleClassChange(newVehicleClass);
                    }}
                    SliderProps={{ valueLabelDisplay: "auto" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.scrappageIncentive}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          const newVehicleClass = structuredClone(vehicleClass);
                          newVehicleClass.config.scrappageIncentive =
                            event.target.checked;
                          props.onVehicleClassChange(newVehicleClass);
                        }}
                        disabled={vehicleClass.name !== "Cars"}
                      />
                    }
                    label={"Incentivize EV Scrappage Rate"}
                  />
                </Box>
                {config.scrappageIncentive && (
                  <Box>
                    <HelpTooltip title="The size of the incentive as a percent of the price of purchasing a new vehicle.">
                      <Typography>Scrappage Incentive Size</Typography>
                    </HelpTooltip>
                    <InputSlider
                      min={0}
                      max={100}
                      step={0.1}
                      value={Number(
                        (config.scrappageIncentiveSize * 100).toFixed(1)
                      )}
                      onChange={(newScrappageIncentiveSize) => {
                        newScrappageIncentiveSize =
                          newScrappageIncentiveSize / 100;
                        const newVehicleClass = structuredClone(vehicleClass);
                        newVehicleClass.config.scrappageIncentiveSize =
                          newScrappageIncentiveSize;
                        props.onVehicleClassChange(newVehicleClass);
                      }}
                      SliderProps={{ valueLabelDisplay: "auto" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                )}
              </Stack>
              <Stack spacing={2} sx={{ width: "50%" }}>
                <Box>
                  <HelpTooltip title="The percentage of ICE cars that are converted to EVs each year.">
                    <Typography>Base EV Retrofit Rate</Typography>
                  </HelpTooltip>
                  <InputSlider
                    min={0}
                    max={5}
                    step={0.1}
                    value={Number((config.retrofitRate * 100).toFixed(1))} // fixing floating point inaccuracy
                    onChange={(newRetrofitRate) => {
                      newRetrofitRate = newRetrofitRate / 100;
                      const newVehicleClass = structuredClone(vehicleClass);
                      newVehicleClass.config.retrofitRate = newRetrofitRate;
                      props.onVehicleClassChange(newVehicleClass);
                    }}
                    SliderProps={{ valueLabelDisplay: "auto" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.retrofitIncentive}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          const newVehicleClass = structuredClone(vehicleClass);
                          newVehicleClass.config.retrofitIncentive =
                            event.target.checked;
                          props.onVehicleClassChange(newVehicleClass);
                        }}
                        disabled={vehicleClass.name !== "Cars"}
                      />
                    }
                    label={"Incentivize EV Retrofit Rate"}
                  />
                </Box>
                {config.retrofitIncentive && (
                  <Box>
                    <HelpTooltip title="The size of the incentive as a percent of the price of purchasing a new vehicle.">
                      <Typography>Scrappage Incentive Size</Typography>
                    </HelpTooltip>
                    <InputSlider
                      min={0}
                      max={100}
                      step={0.1}
                      value={Number(
                        (config.retrofitIncentiveSize * 100).toFixed(1)
                      )}
                      onChange={(newRetrofitIncentiveSize) => {
                        newRetrofitIncentiveSize =
                          newRetrofitIncentiveSize / 100;
                        const newVehicleClass = structuredClone(vehicleClass);
                        newVehicleClass.config.retrofitIncentiveSize =
                          newRetrofitIncentiveSize;
                        props.onVehicleClassChange(newVehicleClass);
                      }}
                      SliderProps={{ valueLabelDisplay: "auto" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={4}>
            <Stack sx={{ width: "50%" }} spacing={2}>
              <Typography variant="h3">Sales Curve</Typography>
              <Box>
                <HelpTooltip title="The desired marketshare to achieve by the target year">
                  <Typography>Target Marketshare</Typography>
                </HelpTooltip>
                <InputSlider
                  min={0}
                  max={100}
                  step={1}
                  value={Number((config.targetMarketshare * 100).toFixed(1))} // fix floating point inaccuracy
                  onChange={(newTargetMarketshare) => {
                    newTargetMarketshare = newTargetMarketshare / 100;
                    const newVehicleClass = structuredClone(vehicleClass);
                    newVehicleClass.config.targetMarketshare =
                      newTargetMarketshare;
                    props.onVehicleClassChange(newVehicleClass);
                  }}
                  SliderProps={{ valueLabelDisplay: "auto" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <HelpTooltip title="The desired year to achieve the target marketshare">
                  <Typography>Target Year</Typography>
                </HelpTooltip>
                <InputSlider
                  min={customSalesCurveYears[0]}
                  max={customSalesCurveYears[customSalesCurveYears.length - 1]}
                  step={1}
                  value={config.targetYear}
                  onChange={(newTargetYear) => {
                    const newVehicleClass = structuredClone(vehicleClass);
                    newVehicleClass.config.targetYear = newTargetYear;
                    props.onVehicleClassChange(newVehicleClass);
                  }}
                  SliderProps={{ valueLabelDisplay: "auto" }}
                />
              </Box>
              <Accordion
                disableGutters={true}
                sx={{ backgroundColor: "#f4f4f4", marginTop: "1em" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Advanced Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <HelpTooltip title="The EV marketshare in the current year">
                    <Typography>Current Marketshare</Typography>
                  </HelpTooltip>
                  <InputSlider
                    min={0}
                    max={100}
                    step={1}
                    value={Number((config.currentMarketshare * 100).toFixed(1))} // fix floating point inaccuracy
                    onChange={(newCurrentMarketshare) => {
                      newCurrentMarketshare = newCurrentMarketshare / 100;
                      const newVehicleClass = structuredClone(vehicleClass);
                      newVehicleClass.config.currentMarketshare =
                        newCurrentMarketshare;
                      props.onVehicleClassChange(newVehicleClass);
                    }}
                    SliderProps={{ valueLabelDisplay: "auto" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                  <HelpTooltip title="The maximum marketshare penetration of EVs">
                    <Typography>Final Marketshare</Typography>
                  </HelpTooltip>
                  <InputSlider
                    min={0}
                    max={100}
                    step={1}
                    value={Number((config.finalMarketshare * 100).toFixed(1))} // fix floating point inaccuracy
                    onChange={(newFinalMarketshare) => {
                      newFinalMarketshare = newFinalMarketshare / 100;
                      const newVehicleClass = structuredClone(vehicleClass);
                      newVehicleClass.config.finalMarketshare =
                        newFinalMarketshare;
                      props.onVehicleClassChange(newVehicleClass);
                    }}
                    SliderProps={{ valueLabelDisplay: "auto" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                  <HelpTooltip title="The year which the final marketshare is reached">
                    <Typography>Final Year</Typography>
                  </HelpTooltip>
                  <InputSlider
                    min={customSalesCurveYears[0]}
                    max={
                      customSalesCurveYears[customSalesCurveYears.length - 1]
                    }
                    step={1}
                    value={config.finalYear}
                    onChange={(newFinalYear) => {
                      const newVehicleClass = structuredClone(vehicleClass);
                      newVehicleClass.config.finalYear = newFinalYear;
                      props.onVehicleClassChange(newVehicleClass);
                    }}
                    SliderProps={{ valueLabelDisplay: "auto" }}
                  />
                </AccordionDetails>
              </Accordion>
              <Alert severity="info">
                <AlertTitle>Tip</AlertTitle>
                <Typography>
                  The sales curve is mathematically fitted to the data. If the
                  curve does not look as you desire, you may need to adjust the
                  advanced options.
                </Typography>
              </Alert>
            </Stack>
            <Box sx={{ flex: "1" }}>
              <Paper
                elevation={8}
                sx={{
                  width: "100%",
                  height: "100%",
                  padding: "1em",
                  boxSizing: "border-box",
                }}
              >
                <Typography variant="h2">Sales Curve</Typography>
                <Box sx={{ height: "calc(100% - 3em)" }}>
                  <Chart
                    data={customSalesCurveData}
                    options={customSalesCurveOptions}
                    type={"line"}
                  />
                </Box>
              </Paper>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={props.onClose}>
          Cancel
        </Button>
        <div style={{ flex: "1 0 0" }} />
        <Button variant="outlined" onClick={props.onBackButtonClick}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={props.onNextButtonClick}
          disabled={nextDisabled}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </>
  );
}
