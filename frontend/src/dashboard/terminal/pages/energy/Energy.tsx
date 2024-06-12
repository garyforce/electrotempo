import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Section } from "components/Section";
import ChargingProfileChart from "./chart/ChargingProfileChart";
import FleetScheduleChart from "./chart/FleetScheduleChart";
import { VehicleStatus } from "types/vehicle-status";
import { TerminalEnergyDemandDatapoint } from "types/terminal-energy-demand-datapoint";
import { TerminalVehicleStatusDatapoint } from "types/terminal-vehicle-status-datapoint";
import { useMemo } from "react";

export type energyProps = {
  energyDemandDatapoints: TerminalEnergyDemandDatapoint[];
  vehicleStatusDatapoints: TerminalVehicleStatusDatapoint[];
};

const Energy = ({
  energyDemandDatapoints,
  vehicleStatusDatapoints,
}: energyProps) => {
  let {
    powerProfile,
    energyProfile,
  }: { powerProfile: number[]; energyProfile: number[] } = useMemo(() => {
    let powerProfile: number[] = [];
    let energyProfile: number[] = [];
    energyDemandDatapoints.forEach((datapoint) => {
      powerProfile.push(datapoint.powerDemandKw);
      energyProfile.push(datapoint.energyDemandKwh);
    });
    return { powerProfile, energyProfile };
  }, [energyDemandDatapoints]);

  let vehicleScheduleString: VehicleStatus[][] = useMemo(() => {
    return vehicleStatusDatapoints.map((datapoint: any, index) => {
      return new Array(24).fill(0).map((_, i) => {
        return {
          id: `${index + 1}`,
          status: datapoint[`hour${i}`].toString(),
        };
      });
    });
  }, vehicleStatusDatapoints);
  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Charger Power Demand Profile
              </Typography>
            </Box>
            <ChargingProfileChart variant="power" data={powerProfile} />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Charger Energy Consumption Profile
              </Typography>
            </Box>
            <ChargingProfileChart variant="energy" data={energyProfile} />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Vehicle Usage Data
              </Typography>
            </Box>
            <FleetScheduleChart
              variant="vehicle"
              fleetSchedule={vehicleScheduleString}
            />
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Energy;
