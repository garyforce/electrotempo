import { Box, Grid, Typography } from "@mui/material";
import { Section } from "components/Section";
import { ChargerStatus } from "types/charger-status";
import { Schedule, Chargers } from "types/hub-scenario-data";
import ChargerAssignmentChart from "./charts/ChargerAssignmentChart";
import ChargerInformationHub from "./components/ChargerInformationHub";

const generateChargerDataset = (
  schedules: Schedule[] | undefined
): ChargerStatus[][] => {
  if (!schedules?.length) {
    return [];
  }

  // For display reasons reverse the schedules so assigned chargers are at the bottom of the chart
  const reverseSchedules = [];
  for (let i = schedules.length - 1; i >= 0; i--) {
    reverseSchedules.push(schedules[i]);
  }

  const dataset: ChargerStatus[][] = [];
  reverseSchedules.forEach((item: Schedule, index: number) => {
    const values: ChargerStatus[] = item.schedule.map(
      (status: number, key: number) => ({
        id: index.toString(),
        status: status === 1 ? "Charging" : "Idle",
      })
    );

    if (values.length !== 0) {
      dataset.push(values);
    }
  });

  return dataset;
};

type ChargersHubProps = {
  truckChargersData: Chargers | undefined;
  trailerChargersData: Chargers | undefined;
};
const ChargersHub = ({
  truckChargersData,
  trailerChargersData,
}: ChargersHubProps) => {
  const truckPublicDataset = generateChargerDataset(
    truckChargersData?.charger_assignments.public.schedules
  );
  const truckPublicUtil =
    truckChargersData?.charger_assignments.public.avg_util_rate;
  const truckSubscriptionDataset = generateChargerDataset(
    truckChargersData?.charger_assignments.subscription.schedules
  );
  const truckPrivateUtil =
    truckChargersData?.charger_assignments.subscription.avg_util_rate;
  const trailerPublicDataset = generateChargerDataset(
    trailerChargersData?.charger_assignments.public.schedules
  );
  const trailerPublicUtil =
    trailerChargersData?.charger_assignments.public.avg_util_rate;
  const trailerSubscriptionDataset = generateChargerDataset(
    trailerChargersData?.charger_assignments.subscription.schedules
  );
  const trailerPrivateUtil =
    trailerChargersData?.charger_assignments.subscription.avg_util_rate;

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Charger assignment chart (Straight Truck Public)
              </Typography>
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {`Utilization: ${
                  typeof truckPublicUtil === "number"
                    ? `${(truckPublicUtil * 100).toFixed(2)}%`
                    : "N/A"
                }`}
              </Typography>
            </Box>
            <ChargerAssignmentChart
              variant={"charger"}
              fleetSchedule={truckPublicDataset}
            />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Charger assignment chart (Tractor-Trailer Public)
              </Typography>
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {`Utilization: ${
                  typeof trailerPublicUtil === "number"
                    ? `${(trailerPublicUtil * 100).toFixed(2)}%`
                    : "N/A"
                }`}
              </Typography>
            </Box>
            <ChargerAssignmentChart
              variant={"charger"}
              fleetSchedule={trailerPublicDataset}
            />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Charger assignment chart (Straight Truck Private)
              </Typography>
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {`Utilization: ${
                  typeof truckPrivateUtil === "number"
                    ? `${(truckPrivateUtil * 100).toFixed(2)}%`
                    : "N/A"
                }`}
              </Typography>
            </Box>
            <ChargerAssignmentChart
              variant={"charger"}
              fleetSchedule={truckSubscriptionDataset}
            />
          </Section>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                Charger assignment chart (Tractor-Trailer Private)
              </Typography>
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {`Utilization: ${
                  typeof trailerPrivateUtil === "number"
                    ? `${(trailerPrivateUtil * 100)?.toFixed(2)}%`
                    : "N/A"
                }`}
              </Typography>
            </Box>
            <ChargerAssignmentChart
              variant={"charger"}
              fleetSchedule={trailerSubscriptionDataset}
            />
          </Section>
        </Grid>
        <Grid
          container
          rowSpacing={2}
          columnSpacing={2}
          sx={{ paddingLeft: 2, paddingTop: 2 }}
          className={"charger-information"}
        >
          <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
            <ChargerInformationHub
              title="Charger Information (Straight Truck)"
              totalChargers={truckChargersData?.num_chargers}
              utilityConstrainedFeasibleCharger={
                truckChargersData?.utility_constrained_feasible_chargers
              }
              parkingAreaConstrainedFeasibleCharger={
                truckChargersData?.parking_area_constrained_feasible_chargers
              }
              chargersNeeded={truckChargersData?.num_chargers_needed}
              assignableCharger={truckChargersData?.num_assignable_chargers}
              publicCharger={truckChargersData?.num_public_chargers}
              subscriptionCharger={truckChargersData?.num_subscription_chargers}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
            <ChargerInformationHub
              title="Charger Information (Tractor-Trailer)"
              totalChargers={trailerChargersData?.num_chargers}
              utilityConstrainedFeasibleCharger={
                trailerChargersData?.utility_constrained_feasible_chargers
              }
              parkingAreaConstrainedFeasibleCharger={
                trailerChargersData?.parking_area_constrained_feasible_chargers
              }
              chargersNeeded={trailerChargersData?.num_chargers_needed}
              assignableCharger={trailerChargersData?.num_assignable_chargers}
              publicCharger={trailerChargersData?.num_public_chargers}
              subscriptionCharger={
                trailerChargersData?.num_subscription_chargers
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChargersHub;
