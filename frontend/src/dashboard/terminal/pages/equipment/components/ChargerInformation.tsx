import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { Box } from "@mui/system";
import { useAppSelector } from "redux/store";
import { Charger } from "types/charger";

export type ChargerInformationProps = {
  currentChargers?: number;
  optimalChargers?: number;
  chargerConfiguration?: Charger;
};

const ChargerInformation = ({
  currentChargers,
  optimalChargers,
  chargerConfiguration,
}: ChargerInformationProps) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
  const financialControls = useAppSelector((store) => store.financial);
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
          Charger Information
        </Typography>
        <Stack sx={{ textAlign: "right" }}>
          <Typography component="span" variant="body2">
            Current count
            <Chip
              label={currentChargers ?? 0}
              color="primary"
              sx={{
                fontWeight: "bold",
                color: "#fff",
                marginLeft: 1,
              }}
            />
          </Typography>
          <Typography component="span" variant="body2">
            Optimal count
            <Chip
              label={optimalChargers}
              color="primary"
              sx={{ fontWeight: "bold", color: "#fff", marginLeft: 1 }}
            />
          </Typography>
        </Stack>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List dense>
        <ListItem disableGutters>
          <ListItemText
            primary="Charger charge rate (kW)"
            secondary={chargerConfiguration?.chargeRateKw ?? ""}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Charger voltage (V)"
            secondary={chargerConfiguration?.voltage ?? ""}
            secondaryTypographyProps={{ component: "h3" }}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Charger current (A)"
            secondary={chargerConfiguration?.amperage ?? ""}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Charger price (USD)"
            secondary={financialControls.chargerCost?.toLocaleString()}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default ChargerInformation;
