import { Box, Grid, Typography } from "@mui/material";
import { Section } from "components/Section";
import ChargingProfileChart from "dashboard/terminal/pages/energy/chart/ChargingProfileChart";
import { EnergyDemand, EnergyHourlyData } from "types/hub-scenario-data";
import EnergyDemandInfo from "./components/EnergyDemandInfo";

export type EnergyHubProps = {
  aggregateEnergyDemandData: EnergyDemand | undefined;
};

const EnergyHub = ({ aggregateEnergyDemandData }: EnergyHubProps) => {
  const demandData = {
    totalEnergyDemand: aggregateEnergyDemandData?.energy_demand,
    powerDemand: aggregateEnergyDemandData?.power_supply,
    utilityThreshold: aggregateEnergyDemandData?.utility_threshold,
    siteAreaThreshold: aggregateEnergyDemandData?.site_area_threshold,
  };

  const powerDemandProfile = aggregateEnergyDemandData?.hourly_data.map(
    (item: EnergyHourlyData) => {
      return item.power_supply;
    }
  );

  const energyDemandProfile = aggregateEnergyDemandData?.hourly_data.map(
    (item: EnergyHourlyData) => {
      return item.energy_demand;
    }
  );

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
            <ChargingProfileChart
              variant="power"
              data={powerDemandProfile}
              utilityConstraint={aggregateEnergyDemandData?.utility_threshold}
            />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Charger Energy Consumption Profile
              </Typography>
            </Box>
            <ChargingProfileChart variant="energy" data={energyDemandProfile} />
          </Section>
        </Grid>
        <Grid item xs={12} xl={6}>
          <Box>
            <EnergyDemandInfo demandData={demandData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnergyHub;
