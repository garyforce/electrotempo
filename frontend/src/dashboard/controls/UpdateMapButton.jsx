import React from "react";
import PropTypes from "prop-types";

import { Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";

function UpdateMapButton(props) {
  return (
    <Box sx={{ width: "100%" }}>
      <LoadingButton
        color="primary"
        variant="contained"
        loadingIndicator={"loading data..."}
        size="large"
        onClick={(event) => props.onClick()}
        disabled={props.disabled}
        className={props.pulse ? "btn--shockwave is-active" : ""}
        sx={{ width: "100%" }}
      >
        Update Map
      </LoadingButton>
    </Box>
  );
}

UpdateMapButton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  pulse: PropTypes.bool,
};

export default UpdateMapButton;
