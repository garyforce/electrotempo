import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { FinancialCapitalExpense } from "types/hub-scenario-data";
import { formatNumber } from "utils/format-number";

export type CapitalExpenseInformationProps = {
  data: FinancialCapitalExpense | undefined;
};

const CapitalExpenseInformation = ({
  data,
}: CapitalExpenseInformationProps) => {
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
          Capital Expense Information
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List dense>
        <ListItem disableGutters>
          <ListItemText
            primary="Charger costs (USD)"
            secondary={formatNumber(data?.charger_costs ?? 0)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary="Charger installation costs (USD)"
            secondary={formatNumber(data?.chargers_installation_costs ?? 0)}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default CapitalExpenseInformation;
