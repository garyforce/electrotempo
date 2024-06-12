import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import {
  FinancialInformation,
  FinancialControls,
} from "types/terminal-financial";

const FinancialInformationBox = ({
  financialInformation,
  financialControls,
}: {
  financialInformation?: FinancialInformation;
  financialControls?: FinancialControls;
}) => {
  const currentYear = new Date().getFullYear();

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

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
          Financial Information
        </Typography>
      </Box>
      <Divider sx={{ marginTop: 2 }} />
      <List dense>
        <ListItem disableGutters>
          <ListItemText
            primary={`Total Capital Expenditure if all Vehicles Purchased in Y1 (USD)`}
            secondary={formatter.format(
              financialInformation?.upfrontTotalCapitalExpenses
                .totalCapitalExpenses ?? 0
            )}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary={`Total Capital Expenditure Over Planning Horizon`}
            secondary={formatter.format(
              financialInformation?.totalCapitalExpenses.totalCapitalExpenses ??
                0
            )}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary={`Total Capital Expenditures Vehicle Only`}
            secondary={formatter.format(
              financialInformation?.totalCapitalExpenses.vehicleExpenses ?? 0
            )}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary={`Total Capital Expenditures Chargers Only`}
            secondary={formatter.format(
              financialInformation?.totalCapitalExpenses.chargerExpenses ?? 0
            )}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem disableGutters>
          <ListItemText
            primary={`Total Operating Expenditures / Charging Cost in Y1`}
            secondary={formatter.format(
              financialInformation?.operationalExpensesY1.fuelCosts ?? 0
            )}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default FinancialInformationBox;
