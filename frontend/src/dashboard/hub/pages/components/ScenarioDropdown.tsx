import { Add, ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Button, List, ListItem, ListItemText, Popover } from "@mui/material";
import { useRef, useState } from "react";
import { EvGrowthScenario } from "types/hub-site";
import { setLocation } from "redux/features/Header/locationSlice";
import { useAppDispatch } from "redux/store";
import { Location } from "types/location";

interface ScenarioDropdownProps {
  evGrowthScenarios: EvGrowthScenario[];
  addScenario: () => void;
  currentEvGrowthScenarioId: number;
  handleScenarioChange: (currentEvGrowthScenarioId: number) => void;
  locationName: string;
  locations: Location[];
}
export const ScenarioDropdown = ({
  evGrowthScenarios,
  addScenario,
  currentEvGrowthScenarioId,
  handleScenarioChange,
  locationName,
  locations,
}: ScenarioDropdownProps) => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const buttonRef = useRef(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocationChange = () => {
    const matchingLocation = locations.find(
      (location) => location.name.toLowerCase() === locationName
    );

    if (matchingLocation) {
      dispatch(setLocation(matchingLocation));
    }
  };

  return (
    <>
      <Button
        ref={buttonRef}
        aria-controls="customized-menu"
        aria-haspopup="true"
        sx={{
          color: "black",
          textTransform: "none",
          fontWeight: 200,
          justifyContent: "space-between",
          width: "96%",
        }}
        onClick={handleClick}
        endIcon={Boolean(anchorEl) ? <ArrowDropUp /> : <ArrowDropDown />}
      >
        {currentEvGrowthScenarioId
          ? evGrowthScenarios.find(
              (scenario) => scenario.id === currentEvGrowthScenarioId
            )?.name
          : "Select EV Adoption Scenario"}
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <List
          sx={{
            maxHeight: 140,
            overflow: "auto",
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
          }}
        >
          {evGrowthScenarios.map((scenario) => (
            <ListItem
              button
              sx={{ fontSize: "10px", py: 0.3 }}
              key={scenario.id}
              onClick={() => {
                handleScenarioChange(scenario.id);
                handleClose();
              }}
            >
              <ListItemText primary={scenario.name} />
            </ListItem>
          ))}
        </List>
        <Button
          fullWidth
          onClick={() => {
            addScenario();
            handleLocationChange();
          }}
          startIcon={<Add />}
          sx={{
            bgcolor: "#F2F2F2",
            textTransform: "none",
            fontWeight: 200,
            color: "black",
            py: 1,
            "&:hover": {
              bgcolor: "#E0E0E0",
            },
          }}
        >
          Add New EV Adoption Scenario
        </Button>
      </Popover>
    </>
  );
};
