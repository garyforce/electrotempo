import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import ChargerInformation from "./components/ChargerInformation";
import VehicleInformation from "./components/VehicleInformation";
import { Vehicle } from "types/vehicle";
import { TerminalVehicleScenario } from "types/terminal-scenario-vehicle";
export type EquipmentProps = {
  vehicle?: Vehicle;
  scenario?: TerminalVehicleScenario;
  vehiclesPerShift?: number;
  fleetSize?: number;
  numICEVehicles?: number;
  evReserve?: number;
  baseVehicleEngineType: string;
};

const Equipment = ({
  vehicle,
  scenario,
  vehiclesPerShift,
  fleetSize,
  numICEVehicles,
  evReserve,
  baseVehicleEngineType,
}: EquipmentProps) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <ChargerInformation
            currentChargers={scenario?.numChargers}
            optimalChargers={scenario?.optNumChargers}
            chargerConfiguration={scenario?.charger ?? undefined}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
          <VehicleInformation
            currentICE={numICEVehicles}
            optimalEV={fleetSize}
            vehicleConfiguration={vehicle}
            vehiclesPerShift={vehiclesPerShift}
            evReserve={evReserve}
            baseVehicleEngineType={baseVehicleEngineType}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Equipment;
