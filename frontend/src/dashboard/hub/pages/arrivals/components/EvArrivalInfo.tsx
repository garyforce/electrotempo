import {
  Divider,
  Stack,
  Table,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";

export type EvArrivalInfoProps = {
  publicTrucks: number | undefined;
  publicTrailers: number | undefined;
  subscriptionTrucks: number | undefined;
  subscriptionTrailers: number | undefined;
  trucks: number | undefined;
  trailers: number | undefined;
  trucksSubscriptionCaptured: number | undefined;
  trailersSubscriptionCaptured: number | undefined;
};

const EvArrivalInfo = ({
  publicTrucks,
  publicTrailers,
  subscriptionTrucks,
  subscriptionTrailers,
  trucks,
  trailers,
  trucksSubscriptionCaptured,
  trailersSubscriptionCaptured,
}: EvArrivalInfoProps) => {
  return (
    <Box
      sx={{
        border: 0.5,
        borderColor: "silver",
        padding: "16px",
        borderRadius: 5,
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
          Daily EV Arrivals
        </Typography>
      </Box>
      <Box>
        <Stack spacing={2} direction={"row"} alignItems="center">
          <Divider sx={{ marginTop: 2 }} />
          <Table border={1}>
            <TableRow>
              <TableCell>Straight Trucks (public)</TableCell>
              <TableCell>{publicTrucks ?? 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Straight Trucks (private)</TableCell>
              <TableCell>{subscriptionTrucks ?? 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Straight Trucks (total private addressable market)
              </TableCell>
              <TableCell>{trucks ?? 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Straight Trucks (% private captured)</TableCell>
              <TableCell>{`${(trucksSubscriptionCaptured ?? 0).toFixed(
                0
              )}%`}</TableCell>
            </TableRow>
          </Table>
          <Divider sx={{ marginTop: 2 }} />
          <Table border={1}>
            <TableRow>
              <TableCell>Tractor-Trailers (public)</TableCell>
              <TableCell>{publicTrailers ?? 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tractor-Trailers (private)</TableCell>
              <TableCell>{subscriptionTrailers ?? 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Tractor-Trailers (total private addressable market)
              </TableCell>
              <TableCell>{Math.floor(trailers ?? 0)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tractor-Trailers (% private captured)</TableCell>
              <TableCell>{`${(trailersSubscriptionCaptured ?? 0).toFixed(
                0
              )}%`}</TableCell>
            </TableRow>
          </Table>
        </Stack>
      </Box>
    </Box>
  );
};

export default EvArrivalInfo;
