import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { FinancialOperationalCost } from "types/hub-scenario-data";
import { formatNumber } from "utils/format-number";

export type OperationalExpenseInformationProps = {
  data: FinancialOperationalCost | undefined;
};

const OperationalExpenseInformation = ({
  data,
}: OperationalExpenseInformationProps) => {
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
          Operational Expense Information (Annual)
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List dense>
        <ListItem disableGutters>
          <ListItemText
            primary="Electricity usage costs (USD)"
            secondary={formatNumber(data?.energy_cost ?? 0)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Electricity demand costs (USD)"
            secondary={formatNumber(data?.energy_demand_cost ?? 0)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Maintenance costs (USD)"
            secondary={formatNumber(data?.maintenance_cost ?? 0)}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default OperationalExpenseInformation;
