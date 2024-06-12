import { Box, Divider, Stack, Typography } from "@mui/material";
import { DataGrid, GridColumns } from "@mui/x-data-grid";
import {
  VehiclePurchaseSuggestion,
  ChargerPurchaseSuggestion,
} from "types/fleet-electrification-scenario";

export type FleetOverviewProps = {
  vehiclePurchaseSuggestions?: VehiclePurchaseSuggestion[];
  chargerPurchaseSuggestions?: ChargerPurchaseSuggestion[];
};

function FleetOverview({
  vehiclePurchaseSuggestions,
  chargerPurchaseSuggestions,
}: FleetOverviewProps) {
  const vehicleColumns: GridColumns = [
    {
      field: "referenceMakeModel",
      headerName: "Reference Make/Model",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "numElectricVehicles",
      headerName: "Quantity (EV)",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "numIceVehicles",
      headerName: "Quantity (ICE)",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "totalCapexUsd",
      headerName: "Total Capex (USD)",
      valueFormatter: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(params.value)),
      minWidth: 140,
      flex: 1,
    },
  ];

  const chargerColumns: GridColumns<ChargerPurchaseSuggestion> = [
    {
      field: "referenceMakeModel",
      headerName: "Reference Make/Model",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "level",
      headerName: "Level",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "numChargers",
      headerName: "Quantity",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "totalCapexUsd",
      headerName: "Total Capex (USD)",
      valueFormatter: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(params.value)),
      minWidth: 140,
      flex: 1,
    },
  ];

  return (
    <Box>
      <Typography variant="controlTitle" sx={{ fontWeight: "bold" }}>
        Fleet Overview
      </Typography>
      <Stack spacing={2} divider={<Divider />}>
        <Stack spacing={1}>
          <Typography
            variant="h3"
            color={"GrayText"}
            sx={{ marginTop: "15px", fontWeight: "bold" }}
          >
            Vehicles
          </Typography>
          <Box sx={{ height: "300px" }}>
            <DataGrid
              rows={vehiclePurchaseSuggestions ?? []}
              columns={vehicleColumns}
              checkboxSelection={true}
              loading={false}
              keepNonExistentRowsSelected={false}
            />
          </Box>
        </Stack>
        <Stack spacing={1}>
          <Typography
            variant="h3"
            color={"GrayText"}
            sx={{ fontWeight: "bold" }}
          >
            Chargers
          </Typography>
          <Box sx={{ height: "300px" }}>
            <DataGrid
              rows={chargerPurchaseSuggestions ?? []}
              columns={chargerColumns}
              checkboxSelection={true}
              loading={false}
              keepNonExistentRowsSelected={false}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

export default FleetOverview;
