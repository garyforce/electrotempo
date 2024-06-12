import { InputLabel, MenuItem, Select } from "@mui/material";
import { Box, FormControl } from "@mui/material";
import { HubUtilityRate } from "types/hub-utility-rate";

type UtilitySelectBoxProps = {
  utilityRates: HubUtilityRate[];
  selectedUtilityRateId: number | null;
  setSelectedUtilityRateId: (utilityRateId: number) => void;
};
export default function UtilitySelectBox({
  utilityRates,
  selectedUtilityRateId,
  setSelectedUtilityRateId,
}: UtilitySelectBoxProps) {
  return (
    <>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel>Utility Name</InputLabel>
          <Select
            value={selectedUtilityRateId ?? utilityRates[0]?.id ?? ""}
            label="Utility Name"
            onChange={(e) => setSelectedUtilityRateId(Number(e.target.value))}
          >
            {utilityRates.map((utilityRate, index) => {
              return (
                <MenuItem key={index} value={utilityRate.id}>
                  {`${utilityRate.utility.name} - ${utilityRate.energy_charge_rate}`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
    </>
  );
}
