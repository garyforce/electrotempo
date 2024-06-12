import { Box, Grid } from "@mui/material";
import { useMemo } from "react";
import { HubUtilityRate } from "types/hub-utility-rate";
import { ScenarioYearlyParam, SegmentData } from "types/hub-scenario-data";
import ParametersBox from "./components/ParametersBox";
import VehicleClassBox from "./components/VehicleClassBox";

type ParametersHubProp = {
  siteName: string | undefined;
  scenarioName: string | undefined;
  utilityRate: HubUtilityRate | null | undefined;
  truckData: SegmentData | undefined;
  trailerData: SegmentData | undefined;
  truckYearlyParams: ScenarioYearlyParam[];
  trailerYearlyParams: ScenarioYearlyParam[];
};
export const ParametersHub = ({
  siteName,
  scenarioName,
  utilityRate,
  truckData,
  trailerData,
  truckYearlyParams,
  trailerYearlyParams,
}: ParametersHubProp) => {
  const vehiclesData = useMemo(() => {
    return [
      {
        vehicleClassId: truckData?.vehicle_type_id,
        vehicleClass: truckData?.vehicle_type,
        vehicleClassDescription: truckData?.vehicle_type_description,
        yearlyParams: truckYearlyParams,
      },
      {
        vehicleClassId: trailerData?.vehicle_type_id,
        vehicleClass: trailerData?.vehicle_type,
        vehicleClassDescription: trailerData?.vehicle_type_description,
        yearlyParams: trailerYearlyParams,
      },
    ];
  }, [truckData, trailerData, truckYearlyParams, trailerYearlyParams]);

  return (
    <Box sx={{ padding: 2 }}>
      <ParametersBox
        siteName={siteName}
        scenarioName={scenarioName}
        utilityRate={utilityRate}
        truckData={truckData}
        trailerData={trailerData}
        truckYearlyParams={truckYearlyParams}
        trailerYearlyParams={trailerYearlyParams}
      />
      <Grid container rowSpacing={2} columnSpacing={2}>
        {vehiclesData.map((vehicleData, index) => (
          <Grid item xs={12} sm={12} md={12} lg={12} xl={6} key={index}>
            <VehicleClassBox
              vehicleClass={vehicleData.vehicleClass}
              vehicleClassDescription={vehicleData.vehicleClassDescription}
              yearlyParams={vehicleData.yearlyParams}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ParametersHub;
