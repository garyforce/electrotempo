import {
  Alert,
  Box,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  GrowthScenario,
  getLightDutyVehicleClass,
} from "types/growth-scenario";
import { ChartControlValues } from "./TimelinePage";
import LdvTotalDailyDemandChart, {
  getLdvTotalDailyDemandFromNumEvs,
} from "./charts/LdvTotalDailyDemandChart";
import NumChargersNeededChart from "./charts/NumChargersNeededChart";
import InputSlider from "components/InputSlider";
import ChargerInvestmentRequiredChart, {
  getChargerInvestmentRequiredFromNumChargersNeeded,
} from "./charts/ChargerInvestmentRequiredChart";
import { ChartLayout } from "./ChartLayout";
import { getNumChargersNeededFromDemandData } from "./charts/NumChargersNeededChart";

function maximumTotalDailyChargingDemand(
  growthScenario: GrowthScenario | undefined
): number {
  if (!growthScenario) {
    return 0;
  }

  const lightDutyVehicleClass = getLightDutyVehicleClass(growthScenario);

  if (lightDutyVehicleClass === undefined) {
    return 0;
  }

  const demandData = lightDutyVehicleClass.annualData!.map((e) => {
    return {
      year: e.year,
      ...getLdvTotalDailyDemandFromNumEvs(e.numEvs),
    };
  });

  let max = 0;
  demandData.forEach((e) => {
    let sum = 0;
    sum += e.dailyHomeDemandKwh;
    sum += e.dailyWorkplaceDemandKwh;
    sum += e.dailyPublicDemandKwh;
    max = Math.max(max, sum);
  });
  return max;
}

function maximumNumChargersNeeded(
  growthScenario: GrowthScenario | undefined,
  workplaceFractionServedByDcfc: number
): number {
  if (!growthScenario) {
    return 0;
  }

  const lightDutyVehicleClass = getLightDutyVehicleClass(growthScenario);

  if (lightDutyVehicleClass === undefined) {
    return 0;
  }

  const demandData = lightDutyVehicleClass.annualData!.map((e) => {
    const demand = getLdvTotalDailyDemandFromNumEvs(e.numEvs);
    return getNumChargersNeededFromDemandData(
      demand,
      workplaceFractionServedByDcfc
    );
  });

  let max = 0;
  demandData.forEach((e) => {
    let sum = 0;
    sum += e.numDcfcPublicChargersNeeded;
    sum += e.numDcfcWorkplaceChargersNeeded;
    sum += e.numL2HomeChargersNeeded;
    sum += e.numL2WorkplaceChargersNeeded;
    max = Math.max(max, sum);
  });
  return max;
}

function maximumChargerInvestmentRequired(
  growthScenario: GrowthScenario | undefined,
  workplaceFractionServedByDcfc: number,
  pricePerLevel2Charger: number,
  pricePerDcFastCharger: number
): number {
  if (!growthScenario) {
    return 0;
  }

  const lightDutyVehicleClass = getLightDutyVehicleClass(growthScenario);

  if (lightDutyVehicleClass === undefined) {
    return 0;
  }

  const demandData = lightDutyVehicleClass.annualData!.map((e) => {
    const demand = getLdvTotalDailyDemandFromNumEvs(e.numEvs);
    const numChargers = getNumChargersNeededFromDemandData(
      demand,
      workplaceFractionServedByDcfc
    );
    return getChargerInvestmentRequiredFromNumChargersNeeded(
      numChargers,
      pricePerLevel2Charger,
      pricePerDcFastCharger
    );
  });

  let max = 0;
  demandData.forEach((e) => {
    let sum = 0;
    sum += e.publicDcfcInvestment;
    sum += e.workplaceDcfcInvestment;
    sum += e.workplaceL2Investment;
    max = Math.max(max, sum);
  });
  return max;
}

type LdvChargingDemandChartsSingleViewProps = {
  growthScenario?: GrowthScenario;
  chartControlValues?: ChartControlValues;
  setChartControlValues?: (values: ChartControlValues) => void;
  variant?: "horizontal" | "vertical";
  totalDailyChargingDemandSuggestedMax?: number;
  numChargersNeededSuggestedMax?: number;
  chargerInvestmentRequiredSuggestedMax?: number;
};

function LdvChargingDemandChartsSingleView({
  growthScenario,
  chartControlValues,
  setChartControlValues,
  variant,
  totalDailyChargingDemandSuggestedMax,
  numChargersNeededSuggestedMax,
  chargerInvestmentRequiredSuggestedMax,
}: LdvChargingDemandChartsSingleViewProps) {
  chartControlValues = chartControlValues ?? {
    workplaceFractionServedByDcfc: 0.5,
    pricePerLevel2Charger: 1000,
    pricePerDcFastCharger: 10000,
  };

  const lightDutyVehicleClass =
    growthScenario !== undefined
      ? getLightDutyVehicleClass(growthScenario)
      : undefined;

  let alert =
    lightDutyVehicleClass === undefined ? (
      // sans box the alert will grow to fill the full height of the container
      <Box>
        <Alert severity="warning">
          The currently selected growth scenario does not include the Cars
          vehicle class. Please choose another growth scenario.
        </Alert>
      </Box>
    ) : (
      <Box>
        <Alert severity="info">
          This tab only uses the Cars vehicle class.
        </Alert>
      </Box>
    );

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {alert}
      <ChartLayout variant={variant}>
        <Box>
          <Paper
            elevation={4}
            sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
          >
            <Typography variant="h2">
              Average Daily EV Energy Consumption
            </Typography>
            <Box sx={{ height: "18rem" }}>
              <LdvTotalDailyDemandChart
                vehicleClass={lightDutyVehicleClass}
                suggestedMax={totalDailyChargingDemandSuggestedMax}
              />
            </Box>
          </Paper>
        </Box>
        <Box>
          <Paper
            elevation={4}
            sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
          >
            <Typography variant="h2">Number of Chargers Needed</Typography>
            <Box sx={{ height: "18rem" }}>
              <NumChargersNeededChart
                vehicleClass={lightDutyVehicleClass}
                workplaceFractionServedByDcfc={
                  chartControlValues.workplaceFractionServedByDcfc
                }
                suggestedMax={numChargersNeededSuggestedMax}
              />
            </Box>
            <Typography>
              Percentage of workplace demand served by DCFC
            </Typography>
            <InputSlider
              value={Number(
                (
                  chartControlValues.workplaceFractionServedByDcfc * 100
                ).toFixed(1)
              )}
              min={0}
              max={100}
              step={1}
              onChange={(newValue) => {
                if (
                  chartControlValues !== undefined &&
                  setChartControlValues !== undefined
                ) {
                  const newChartControlValues = { ...chartControlValues };
                  newChartControlValues.workplaceFractionServedByDcfc =
                    newValue / 100;
                  setChartControlValues(newChartControlValues);
                }
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Paper>
        </Box>
        <Box>
          <Paper
            elevation={4}
            sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
          >
            <Typography variant="h2">Charger Investment Required</Typography>
            <Box sx={{ height: "18rem" }}>
              <ChargerInvestmentRequiredChart
                vehicleClass={lightDutyVehicleClass}
                workplaceFractionServedByDcfc={
                  chartControlValues.workplaceFractionServedByDcfc
                }
                pricePerLevel2Charger={chartControlValues.pricePerLevel2Charger}
                pricePerDcFastCharger={chartControlValues.pricePerDcFastCharger}
                suggestedMax={chargerInvestmentRequiredSuggestedMax}
              />
            </Box>
            <Typography>Price per Level 2 Charger</Typography>
            <InputSlider
              value={chartControlValues.pricePerLevel2Charger}
              min={0}
              max={30000}
              step={100}
              onChange={(newValue) => {
                if (
                  chartControlValues !== undefined &&
                  setChartControlValues !== undefined
                ) {
                  const newChartControlValues = { ...chartControlValues };
                  newChartControlValues.pricePerLevel2Charger = newValue;
                  setChartControlValues(newChartControlValues);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
            <Typography>Price per DC Fast Charger</Typography>
            <InputSlider
              value={chartControlValues.pricePerDcFastCharger}
              min={0}
              max={150000}
              step={1000}
              onChange={(newValue) => {
                if (
                  chartControlValues !== undefined &&
                  setChartControlValues !== undefined
                ) {
                  const newChartControlValues = { ...chartControlValues };
                  newChartControlValues.pricePerDcFastCharger = newValue;
                  setChartControlValues(newChartControlValues);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Paper>
        </Box>
      </ChartLayout>
    </Stack>
  );
}

export type LdvChargingDemandChartsProps = {
  growthScenario?: GrowthScenario;
  chartControlValues?: ChartControlValues;
  setChartControlValues?: (chartControlValues: ChartControlValues) => void;
  comparisonMode?: boolean;
  comparisonGrowthScenario?: GrowthScenario;
  comparisonChartControlValues?: ChartControlValues;
  setComparisonChartControlValues?: (
    comparisonChartControlValues: ChartControlValues
  ) => void;
};

export default function LdvChargingDemandCharts({
  growthScenario,
  chartControlValues,
  setChartControlValues,
  comparisonMode,
  comparisonGrowthScenario,
  comparisonChartControlValues,
  setComparisonChartControlValues,
}: LdvChargingDemandChartsProps) {
  if (comparisonMode) {
    const totalDailyChargingDemandSuggestedMax = Math.max(
      maximumTotalDailyChargingDemand(growthScenario),
      maximumTotalDailyChargingDemand(comparisonGrowthScenario)
    );
    const numChargersNeededSuggestedMax = Math.max(
      maximumNumChargersNeeded(
        growthScenario,
        chartControlValues?.workplaceFractionServedByDcfc ?? 0
      ),
      maximumNumChargersNeeded(
        comparisonGrowthScenario,
        comparisonChartControlValues?.workplaceFractionServedByDcfc ?? 0
      )
    );
    const chargerInvestmentRequiredSuggestedMax = Math.max(
      maximumChargerInvestmentRequired(
        growthScenario,
        chartControlValues?.workplaceFractionServedByDcfc ?? 0,
        chartControlValues?.pricePerLevel2Charger ?? 0,
        chartControlValues?.pricePerDcFastCharger ?? 0
      ),
      maximumChargerInvestmentRequired(
        comparisonGrowthScenario,
        comparisonChartControlValues?.workplaceFractionServedByDcfc ?? 0,
        comparisonChartControlValues?.pricePerLevel2Charger ?? 0,
        comparisonChartControlValues?.pricePerDcFastCharger ?? 0
      )
    );
    return (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="center"
        spacing={2}
      >
        <LdvChargingDemandChartsSingleView
          growthScenario={growthScenario}
          chartControlValues={chartControlValues}
          setChartControlValues={setChartControlValues}
          variant={"vertical"}
          totalDailyChargingDemandSuggestedMax={
            totalDailyChargingDemandSuggestedMax
          }
          numChargersNeededSuggestedMax={numChargersNeededSuggestedMax}
          chargerInvestmentRequiredSuggestedMax={
            chargerInvestmentRequiredSuggestedMax
          }
        />
        <LdvChargingDemandChartsSingleView
          growthScenario={comparisonGrowthScenario}
          chartControlValues={comparisonChartControlValues}
          setChartControlValues={setComparisonChartControlValues}
          variant={"vertical"}
          totalDailyChargingDemandSuggestedMax={
            totalDailyChargingDemandSuggestedMax
          }
          numChargersNeededSuggestedMax={numChargersNeededSuggestedMax}
          chargerInvestmentRequiredSuggestedMax={
            chargerInvestmentRequiredSuggestedMax
          }
        />
      </Stack>
    );
  }
  return (
    <LdvChargingDemandChartsSingleView
      growthScenario={growthScenario}
      chartControlValues={chartControlValues}
      setChartControlValues={setChartControlValues}
      variant={"horizontal"}
    />
  );
}
