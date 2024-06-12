import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Menu, MenuItem, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { usePermissions } from "./PermissionContext";

const TopBarMenu = () => {
  const { logout, user } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const logoutUrl = process.env.REACT_APP_HOME_URL;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const permissions = usePermissions();

  const logoutTheUser = () => {
    localStorage.clear();
    logout({ returnTo: logoutUrl });
  };

  return (
    <React.Fragment>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <span style={{ color: "white" }}>{user?.nickname || "Logout"}</span>{" "}
        <ArrowDropDownIcon sx={{ color: "white" }} />
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => logoutTheUser()}>Log out</MenuItem>
        {process.env.REACT_APP_DEBUG_MODE === "true" && (
          <MenuItem>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: "1.2rem" }}>
                Debug Mode Active
              </Typography>
              <Typography>Permissions</Typography>
              {permissions.map((permission) => (
                <Chip size="small" label={permission} key={permission} />
              ))}
            </Stack>
          </MenuItem>
        )}
      </Menu>
    </React.Fragment>
  );
};

export default TopBarMenu;
