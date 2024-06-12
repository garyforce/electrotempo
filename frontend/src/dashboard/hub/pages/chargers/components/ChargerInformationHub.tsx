import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";

export type ChargerInformationProps = {
  title: string;
  totalChargers: number | undefined;
  utilityConstrainedFeasibleCharger: number | undefined;
  parkingAreaConstrainedFeasibleCharger: number | undefined;
  chargersNeeded: number | undefined;
  assignableCharger: number | undefined;
  publicCharger: number | undefined;
  subscriptionCharger: number | undefined;
};

const ChargerInformationHub = ({
  title,
  totalChargers,
  utilityConstrainedFeasibleCharger,
  parkingAreaConstrainedFeasibleCharger:
    siteParkingAreaConstrainedFeasibleCharger,
  chargersNeeded,
  assignableCharger,
  publicCharger,
  subscriptionCharger,
}: ChargerInformationProps) => {
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
          {title}
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List dense>
        <ListItem disableGutters>
          <ListItemText
            primary="Recommended charger count"
            secondary={assignableCharger ?? 0}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Public chargers assigned"
            secondary={publicCharger ?? 0}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Private chargers assigned"
            secondary={subscriptionCharger ?? 0}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default ChargerInformationHub;
