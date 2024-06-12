import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import TcoBarChart, { TcoLegend } from "./charts/TcoBarChart";
import { FleetElectrificationScenario } from "types/fleet-electrification-scenario";
import { useState } from "react";

function getTotalCost(scenario: FleetElectrificationScenario) {
  return (
    scenario.fuelCostUsd +
    scenario.insuranceCostUsd +
    scenario.downtimeCostUsd +
    scenario.maintenanceCostUsd +
    scenario.otherOAndMCostUsd +
    scenario.laborCostUsd +
    scenario.vehiclePurchaseSuggestions.reduce((acc, suggestion) => {
      return acc + suggestion.totalCapexUsd;
    }, 0) +
    scenario.chargerPurchaseSuggestions.reduce((acc, suggestion) => {
      return acc + suggestion.totalCapexUsd;
    }, 0)
  );
}

export type TotalCostOfOwnershipProps = {
  scenario?: FleetElectrificationScenario;
  referenceScenarios: FleetElectrificationScenario[];
};

function TotalCostOfOwnership({
  scenario,
  referenceScenarios,
}: TotalCostOfOwnershipProps) {
  const [selectedReferenceScenarioId, setSelectedReferenceScenarioId] =
    useState<number | undefined>(undefined);

  const referenceScenario = referenceScenarios?.find(
    (scenario) => scenario.id === selectedReferenceScenarioId
  );

  let suggestedMax;
  if (scenario && referenceScenario) {
    suggestedMax = Math.max(
      getTotalCost(scenario),
      getTotalCost(referenceScenario)
    );
  } else {
    suggestedMax = 0;
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="controlTitle" sx={{ fontWeight: "bold" }}>
          Total Cost of Ownership{" "}
          <Typography component="span">(10 year amortization)</Typography>
        </Typography>
      </Box>

      <FormControl fullWidth>
        <InputLabel id="reference-scenario-select-label">
          Select Reference Scenario
        </InputLabel>
        <Select
          labelId="reference-scenario-select-label"
          value={selectedReferenceScenarioId}
          onChange={(e) =>
            setSelectedReferenceScenarioId(
              e.target.value === "" ? undefined : (e.target.value as number)
            )
          }
          label="Select Reference Scenario"
        >
          <MenuItem value={""}>None</MenuItem>
          {referenceScenarios.map((scenario) => (
            <MenuItem key={scenario.id} value={scenario.id}>
              {scenario.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack>
        <Stack>
          <TcoBarChart
            fleetElectificationScenario={scenario}
            disableXaxis={true}
            title={scenario?.name || "This Scenario"}
            suggestedMax={suggestedMax}
          />
          {selectedReferenceScenarioId !== undefined && (
            <TcoBarChart
              fleetElectificationScenario={referenceScenario}
              disableXaxis={true}
              title={referenceScenario?.name || "Reference Scenario"}
              suggestedMax={suggestedMax}
            />
          )}
        </Stack>
        <TcoLegend />
      </Stack>
    </Stack>
  );
}

export default TotalCostOfOwnership;
