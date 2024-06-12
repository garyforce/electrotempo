import { Box, Grid, Typography } from "@mui/material";
import { Section } from "components/Section";
import { SegmentData } from "types/hub-scenario-data";
import TrafficProfileChart from "./charts/TrafficProfileChart";
import EvArrivalInfo from "./components/EvArrivalInfo";

type ArrivalsProps = {
  truckData: SegmentData | undefined;
  trailerData: SegmentData | undefined;
};

const Arrivals = ({ truckData, trailerData }: ArrivalsProps) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} xl={12}>
          <Section>
            <Box sx={{ marginBottom: 0.5 }}>
              <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                On-road Traffic Arrival Profile (cumulative)
              </Typography>
            </Box>
            <TrafficProfileChart
              truckHourlyArrivalsData={truckData?.arrivals.hourly_data ?? []}
              trailerHourlyArrivalsData={
                trailerData?.arrivals.hourly_data ?? []
              }
            />
          </Section>
        </Grid>
        <Grid item xs={12} xl={12}>
          <Box>
            <EvArrivalInfo
              publicTrucks={truckData?.arrivals.public_arrivals}
              publicTrailers={trailerData?.arrivals.public_arrivals}
              subscriptionTrucks={truckData?.arrivals.subscription_arrivals}
              subscriptionTrailers={trailerData?.arrivals.subscription_arrivals}
              trucks={truckData?.arrivals.subscription_capture_arrivals}
              trailers={trailerData?.arrivals.subscription_capture_arrivals}
              trucksSubscriptionCaptured={
                (truckData?.subscription_capture_rate ?? 0) * 100
              }
              trailersSubscriptionCaptured={
                (trailerData?.subscription_capture_rate ?? 0) * 100
              }
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Arrivals;
