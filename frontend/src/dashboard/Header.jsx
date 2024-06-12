import { styled } from "@mui/material/styles";
import { Box, MenuItem, Select, InputBase, Stack } from "@mui/material";

import TopBarMenu from "./TopBarMenu.js";
import ElectroTempoLogo from "components/ElectroTempoLogo";

// this function is straight from the MUI examples.
// Can't say I entirely know how it works.
const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderRadius: 4,
    border: "1px solid white",
    color: "white",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    "&:focus": {
      borderRadius: 4,
      borderColor: "#FDBE02",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
  "& .MuiSelect-icon": {
    color: "white",
  },
}));

function Title(props) {
  if (!props?.location || !props?.locations || props.locations.length < 1)
    return null;
  const numLocations = props.locations.length;
  if (numLocations > 1) {
    return (
      <Select
        value={props.location.id}
        input={<BootstrapInput />}
        onChange={props.onLocationChange}
        sx={{ m: 1 }}
        disabled={props.disabledState}
      >
        {props.locations.map((location) => {
          return (
            <MenuItem key={location.id} value={location.id}>
              {location.name}
            </MenuItem>
          );
        })}
      </Select>
    );
  } else {
    // No title text if 0 or 1 location
    return null;
  }
}

export default function Header(props) {
  return (
    <Stack
      direction="row"
      sx={{
        position: "relative",
        /* give a position so that it has a z-index and doesn't get shadowed */
        zIndex: 100,
        alignItems: "center",
        background: "#05C2CC",
        justifyContent: "space-between",
        height: "64px",
        /* UPDATE #content.height IF THIS IS CHANGED */
      }}
    >
      <a href="https://electrotempo.com/" target="_blank" rel="noreferrer">
        <Box sx={{ width: "200px", paddingLeft: "30px" }}>
          <ElectroTempoLogo />
        </Box>
      </a>
      <Title
        location={props.location}
        locations={props.locations}
        onLocationChange={props.onLocationChange}
        disabledState={props.disabledState}
      />
      <TopBarMenu className="account-menu" />
    </Stack>
  );
}
