import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

import SalesCurveChart from "./charts/SalesCurveChart";
import NumberOfEvsChart from "./charts/NumberOfEvsChart";
import SaturationChart from "./charts/SaturationChart";
import { GrowthScenario } from "types/growth-scenario";
import { ChartLayout } from "./ChartLayout";
import HelpTooltip from "components/HelpTooltip";

function maximumNumEvs(growthScenario: GrowthScenario | undefined): number {
  if (!growthScenario) {
    return 0;
  }

  let max = 0;

  for (
    let i = 0;
    i < growthScenario.vehicleClasses[0].annualData!.length;
    i++
  ) {
    let sum = 0;
    for (let j = 0; j < growthScenario.vehicleClasses.length; j++) {
      sum += growthScenario.vehicleClasses[j].annualData![i].numEvs;
    }
    max = Math.max(max, sum);
  }
  return max;
}

type MarketAdoptionChartsSingleViewProps = {
  growthScenario?: GrowthScenario;
  suggestedMax?: number;
};

function MarketAdoptionChartsSingleView({
  growthScenario,
  suggestedMax,
}: MarketAdoptionChartsSingleViewProps) {
  return (
    <>
      <Box>
        <Paper
          elevation={4}
          sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
        >
          <HelpTooltip title="The percent of new vehicle sales that are EVs.">
            <Typography variant="h2">Sales Curve</Typography>
          </HelpTooltip>
          <Box sx={{ height: "18rem" }}>
            <SalesCurveChart growthScenario={growthScenario} />
          </Box>
        </Paper>
      </Box>
      <Box>
        <Paper
          elevation={4}
          sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
        >
          <HelpTooltip title="The percent of all vehicles, including ICE, that are EVs.">
            <Typography variant="h2">EV Penetration</Typography>
          </HelpTooltip>
          <Box sx={{ height: "18rem" }}>
            <SaturationChart growthScenario={growthScenario} />
          </Box>
        </Paper>
      </Box>
      <Box>
        <Paper
          elevation={4}
          sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
        >
          <Typography variant="h2">Number of EVs</Typography>
          <Box sx={{ height: "18rem" }}>
            <NumberOfEvsChart
              growthScenario={growthScenario}
              suggestedMax={suggestedMax}
            />
          </Box>
        </Paper>
      </Box>
    </>
  );
}

export type MarketAdoptionChartsProps = {
  growthScenario?: GrowthScenario;
  comparisonMode?: boolean;
  comparisonGrowthScenario?: GrowthScenario;
};

export default function MarketAdoptionCharts({
  growthScenario,
  comparisonMode,
  comparisonGrowthScenario,
}: MarketAdoptionChartsProps) {
  if (comparisonMode) {
    const suggestedMax = Math.max(
      maximumNumEvs(growthScenario),
      maximumNumEvs(comparisonGrowthScenario)
    );
    return (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="center"
        spacing={2}
      >
        <ChartLayout variant={"vertical"}>
          <MarketAdoptionChartsSingleView
            growthScenario={growthScenario}
            suggestedMax={suggestedMax}
          />
        </ChartLayout>
        <ChartLayout variant={"vertical"}>
          <MarketAdoptionChartsSingleView
            growthScenario={comparisonGrowthScenario}
            suggestedMax={suggestedMax}
          />
        </ChartLayout>
      </Stack>
    );
  }
  return (
    <ChartLayout variant={"horizontal"}>
      <MarketAdoptionChartsSingleView growthScenario={growthScenario} />
    </ChartLayout>
  );
}
