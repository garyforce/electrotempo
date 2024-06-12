import { useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { HubCharger } from "types/hub-charger";

export interface VehicleChargerValues {
  truckChargerId?: number;
  truckChargerCost?: number;
  trailerChargerId?: number;
  trailerChargerCost?: number;
}

type ChargerChoicesProp = {
  chargers: HubCharger[];
  truckChargerId: number | null;
  truckChargerCost: number;
  trailerChargerId: number | null;
  trailerChargerCost: number;
  handleChargerValuesChange: (
    vehicleChargerValues: VehicleChargerValues
  ) => void;
};
export default function ChargerChoices({
  chargers,
  truckChargerId,
  truckChargerCost,
  trailerChargerId,
  trailerChargerCost,
  handleChargerValuesChange,
}: ChargerChoicesProp) {
  const selectedChargerValues = useMemo(() => {
    return [
      {
        chargerFor: "Straight Trucks",
        chargerId: truckChargerId ?? chargers[0]?.id,
        chargerCost: truckChargerCost,
        handleChargerIdChange: (truckChargerId: number) =>
          handleChargerValuesChange({ truckChargerId }),
        handleChargerCostChange: (truckChargerCost: number) =>
          handleChargerValuesChange({ truckChargerCost }),
      },
      {
        chargerFor: "Tractor-Trailers",
        chargerId: trailerChargerId ?? chargers[0]?.id,
        chargerCost: trailerChargerCost,
        handleChargerIdChange: (trailerChargerId: number) =>
          handleChargerValuesChange({ trailerChargerId }),
        handleChargerCostChange: (trailerChargerCost: number) =>
          handleChargerValuesChange({ trailerChargerCost }),
      },
    ];
  }, [
    chargers,
    truckChargerId,
    truckChargerCost,
    trailerChargerId,
    trailerChargerCost,
    handleChargerValuesChange,
  ]);

  return (
    <>
      <Typography sx={{ marginBottom: 2 }}>Charger Choices:</Typography>
      <Grid container columnSpacing={2}>
        {selectedChargerValues.map((selectedChargerValue, index) => (
          <Grid item xs={6} sm={6} md={6} lg={6} xl={6} key={index}>
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="inherit" sx={{ marginBottom: 1 }}>
                {selectedChargerValue.chargerFor}
              </Typography>
              <Select
                value={selectedChargerValue.chargerId ?? ""}
                onChange={(e) =>
                  selectedChargerValue.handleChargerIdChange(
                    Number(e.target.value)
                  )
                }
                sx={{ width: "100%" }}
              >
                {chargers.map((charger, i) => (
                  <MenuItem key={i} value={charger.id}>
                    {`${charger.charge_rate_kw}KW`}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>
        ))}
        {selectedChargerValues.map((selectedChargerValue, index) => (
          <Grid item xs={6} sm={6} md={6} lg={6} xl={6} key={index}>
            <TextField
              id="outlined-read-only-input"
              value={selectedChargerValue.chargerCost ?? 0}
              onChange={(e) =>
                selectedChargerValue.handleChargerCostChange(
                  Number(e.target.value)
                )
              }
              sx={{ width: "100%" }}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              key={index}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
