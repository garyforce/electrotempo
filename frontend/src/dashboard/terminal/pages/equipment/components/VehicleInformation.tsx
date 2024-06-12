import {
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";
import { Box } from "@mui/system";
import { useMemo } from "react";
import { useAppSelector } from "redux/store";
import { Vehicle } from "types/vehicle";

export type VehicleInformationProps = {
  currentICE?: number;
  optimalEV?: number;
  vehicleConfiguration?: Vehicle;
  vehiclesPerShift?: number;
  evReserve?: number;
  baseVehicleEngineType: string;
};

const VehicleInformation = ({
  currentICE,
  optimalEV,
  vehicleConfiguration,
  vehiclesPerShift,
  evReserve,
  baseVehicleEngineType,
}: VehicleInformationProps) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  const financialControls = useAppSelector((store) => store.financial);

  const optimalActiveEVs = useMemo(() => {
    return Math.max((optimalEV ?? 0) - (evReserve ?? 0), 0);
  }, [optimalEV, evReserve]);

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
          Vehicle Information
        </Typography>
        <Stack sx={{ textAlign: "right" }}>
          <Typography component="span" variant="body2">
            {`Current ${baseVehicleEngineType} count`}
            <Chip
              label={currentICE}
              color="primary"
              sx={{ fontWeight: "bold", color: "#fff", marginLeft: 1 }}
            />
          </Typography>
          <Typography component="span" variant="body2">
            Optimal Active EVs
            <Chip
              label={optimalActiveEVs}
              color="primary"
              sx={{ fontWeight: "bold", color: "#fff", marginLeft: 1 }}
            />
          </Typography>
          <Typography component="span" variant="body2">
            EVs in Reserve due to Downtime
            <Chip
              label={evReserve}
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
            primary="Make"
            secondary={vehicleConfiguration?.make ?? ""}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Model"
            secondary={vehicleConfiguration?.model ?? ""}
            secondaryTypographyProps={{ component: "h3" }}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Battery capacity (kWh)"
            secondary={vehicleConfiguration?.batteryCapacityKwh ?? ""}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Battery max charging rate (kW)"
            secondary={vehicleConfiguration?.batteryMaxChargeRateKw ?? ""}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Vehicle price (USD)"
            secondary={financialControls.vehicleCost?.toLocaleString()}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Number of vehicles on each shift"
            secondary={vehiclesPerShift}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Buy America Compliant"
            secondary={
              vehicleConfiguration?.buyAmericaCompliance ? "Yes" : "No"
            }
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default VehicleInformation;
