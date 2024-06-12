import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { formatNumber } from "utils/format-number";

export type EnergyDemandInfoProps = {
  demandData: {
    totalEnergyDemand: number | undefined;
    powerDemand: number | undefined;
    utilityThreshold: number | undefined;
    siteAreaThreshold: number | undefined;
  };
};

const EnergyDemandInfo = ({ demandData }: EnergyDemandInfoProps) => {
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
          Energy Demand Info
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List dense>
        <ListItem disableGutters>
          <ListItemText
            primary={
              <Tooltip
                title={
                  "'Power demand' refers to the highest rate of energy transfer reached in an hour. " +
                  "This is directly tied to charger power level."
                }
                placement="right"
              >
                <span>Peak hourly power demand (kW)</span>
              </Tooltip>
            }
            secondary={formatNumber(demandData.powerDemand ?? 0)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary={
              <Tooltip
                title="'Energy demand' refers to the amount of energy transferred to the vehicle fleet."
                placement="right"
              >
                <span>Total daily energy demand (kWh)</span>
              </Tooltip>
            }
            secondary={formatNumber(demandData.totalEnergyDemand ?? 0)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary={
              <Tooltip
                title="Maximum power demand based on the available utility supply"
                placement="right"
              >
                <span>Utility Threshold (kW)</span>
              </Tooltip>
            }
            secondary={formatNumber(demandData.utilityThreshold ?? 0)}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default EnergyDemandInfo;
