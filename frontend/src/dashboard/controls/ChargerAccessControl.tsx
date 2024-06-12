import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Typography,
} from "@mui/material";

import HelpTooltip from "components/HelpTooltip";

import { ReactourStep } from "reactour";

const chargerAccessControlClassName: string = "charger-level-control";

export const chargerAccessControlTourStep: ReactourStep = {
  selector: `.${chargerAccessControlClassName}`,
  content: (
    <Typography>
      Private chargers and exclusive charging networks can be controlled here.
    </Typography>
  ),
};

type ChargerAccessControlProps = {
  includePrivateChargers: boolean;
  includeExclusiveNetworks: boolean;
  onIncludePrivateChargersChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  onIncludeExclusiveNetworksChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  disabled?: boolean;
};

export default function ChargerAccessControl({
  includePrivateChargers,
  includeExclusiveNetworks,
  onIncludePrivateChargersChange,
  onIncludeExclusiveNetworksChange,
  disabled,
}: ChargerAccessControlProps) {
  return (
    <FormControl component="fieldset">
      <FormLabel>Charger Access</FormLabel>
      <FormGroup>
        <HelpTooltip
          title={
            "Public chargers are available for use to the general public, but may be privately owned. Private chargers are unavailable to the general public, such as in gated communities or private parking lots."
          }
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={includePrivateChargers}
                onChange={onIncludePrivateChargersChange}
                disabled={disabled}
              />
            }
            label="Include Private Chargers"
            sx={{ marginRight: "-0.2em" }}
          />
        </HelpTooltip>
        <HelpTooltip
          title={
            "Exclusive networks are accessible to the general public, but only under certain conditions. Examples include Tesla Superchargers, which are only accessible to Tesla owners."
          }
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={includeExclusiveNetworks}
                onChange={onIncludeExclusiveNetworksChange}
                disabled={disabled}
              />
            }
            label="Include Exclusive Networks"
            sx={{ marginRight: "-0.2em" }}
          />
        </HelpTooltip>
      </FormGroup>
    </FormControl>
  );
}
