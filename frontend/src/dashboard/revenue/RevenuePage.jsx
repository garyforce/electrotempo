import { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import GrowthScenarioControl from "../controls/GrowthScenarioControl";
import YearControl from "../controls/YearControl";
import SeasonControl from "../controls/SeasonControl";
import RevenueControl from "./RevenueControl";
import AccessControl from "../AccessControl";
import MapComponent from "dashboard/Map";

export default function RevenuePage(props) {
  const [revenue] = useState({});
  const [offPeakPricePerKwh, setOffPeakPricePerKwh] = useState(0.1012);
  const [peakPricePerKwh, setPeakPricePerKwh] = useState(0.1826);
  const [peakHours, setPeakHours] = useState([]);

  const handleOffPeakPricePerKwhChange = (event, value) => {
    const numberRegex = /^[+-]?((\d+(\.\d*)?)|(\.\d+))$/;
    if (numberRegex.test(event.target.value)) {
      let offPeakPricePerKwh = parseFloat(event.target.value);
      setOffPeakPricePerKwh(offPeakPricePerKwh);
    }
  };

  const handlePeakPricePerKwhChange = (event, value) => {
    const numberRegex = /^[+-]?((\d+(\.\d*)?)|(\.\d+))$/;
    if (numberRegex.test(event.target.value)) {
      let peakPricePerKwh = parseFloat(event.target.value);
      setPeakPricePerKwh(peakPricePerKwh);
    }
  };

  const handleAddPeakHourRange = (id, start, end) => {
    peakHours.push({ id: id, range: [start, end] });
    setPeakHours(peakHours);
  };

  const handleRemovePeakHourRange = (id) => {
    const newPeakHours = peakHours.filter((peak) => peak.id !== id);
    setPeakHours(newPeakHours);
  };

  const handlePeakHourChange = (id, range) => {
    let newPeakHours = peakHours;
    for (let i = 0; i < newPeakHours.length; i++) {
      let currentPeak = newPeakHours[i];
      if (currentPeak.id === id) {
        currentPeak.range = range;
        break;
      }
    }
    setPeakHours(newPeakHours);
  };
  return (
    <Stack direction={"row"} sx={{ height: "100%" }}>
      <Stack sx={{ width: "462px", height: "100%" }}>
        <Stack
          divider={<Divider orientation="horizontal" flexItem />}
          spacing={2}
          alignItems
          sx={{ padding: "30px", overflowY: "auto" }}
        >
          <Alert severity="warning">
            <AlertTitle>Under Development</AlertTitle>
            This page's functionality is incomplete. It may not work and could
            crash the application.
          </Alert>
          <Box>
            <Typography variant="controlTitle">Electricity Cost</Typography>
            <AccessControl permission={"read:block_group_popups"}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent={"flex-end"}
                spacing={1}
              >
                <InfoIcon color="info" fontSize="small" />
                <Typography>
                  Click a block group to see detailed information
                </Typography>
              </Stack>
            </AccessControl>
          </Box>
          <Stack spacing={2}>
            <GrowthScenarioControl
              selectedGrowthScenario={props.selectedGrowthScenario}
              growthScenarios={props.growthScenarios}
              onChange={props.onGrowthScenarioChange}
            />
            <YearControl
              growthScenarioData={props.selectedGrowthScenarioData}
              selectedTrafficModel={props.selectedTrafficModel}
              chargingDemandSimulations={props.chargingDemandSimulations}
              selectedChargingDemandSimulation={
                props.selectedChargingDemandSimulation
              }
            />
          </Stack>
          <SeasonControl
            ac={props.ac}
            onChange={props.onAcChange}
            chargingDemandSimulations={props.chargingDemandSimulations}
          />
          <RevenueControl
            peakHours={peakHours}
            onPeakHourChange={handlePeakHourChange}
            onRemovePeakHourRange={handleRemovePeakHourRange}
            onAddPeakHourRange={handleAddPeakHourRange}
            offPeakPricePerKwh={offPeakPricePerKwh}
            onOffPeakPricePerKwhChange={handleOffPeakPricePerKwhChange}
            peakPricePerKwh={peakPricePerKwh}
            onPeakPricePerKwhChange={handlePeakPricePerKwhChange}
          />
        </Stack>
      </Stack>
      <MapComponent
        blockGroups={props.blockGroups}
        revenue={revenue}
        offPeakPricePerKwh={offPeakPricePerKwh}
        peakPricePerKwh={peakPricePerKwh}
        chargingStations={props.chargingStations}
        substations={props.substations}
        demographics={props.demographics}
        location={props.location}
        currentView={"revenue"}
      />
    </Stack>
  );
}
