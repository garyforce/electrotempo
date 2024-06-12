import { Box } from "@mui/system";
import { Grid, Typography } from "@mui/material";

import { Section } from "components/Section";
import { TerminalScenarioVehicle } from "types/terminal-scenario-vehicle";
import AssumptionsPanel from "./components/AssumptionsPanel";
import ParametersPanel from "./components/ParametersPanel";
import ShiftScheduleChart from "./charts/ShiftScheduleChart";
import ShiftScheduleInformation from "./components/ShiftScheduleInformation";
import { AssumptionParameters } from "types/terminal-financial";

type ParametersProps = {
  terminalScenarioVehicle: TerminalScenarioVehicle | null;
  financialAssumptions: AssumptionParameters | undefined;
  baseVehicleEngineType: string;
};

const Parameters = ({
  terminalScenarioVehicle,
  financialAssumptions,
  baseVehicleEngineType,
}: ParametersProps) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Shift Schedule
              </Typography>
            </Box>
            <ShiftScheduleChart
              shiftSchedule={terminalScenarioVehicle?.shiftSchedule}
            />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <ShiftScheduleInformation
            shiftSchedule={terminalScenarioVehicle?.shiftSchedule}
            vehiclePerShift={terminalScenarioVehicle?.vehiclesPerShift}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <ParametersPanel
            financialAssumptions={financialAssumptions}
            terminalScenarioVehicle={terminalScenarioVehicle}
            baseVehicleEngineType={baseVehicleEngineType}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <AssumptionsPanel
            financialAssumptions={financialAssumptions}
            baseVehicleEngineType={baseVehicleEngineType}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Parameters;
