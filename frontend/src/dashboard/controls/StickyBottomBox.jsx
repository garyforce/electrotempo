import React from "react";

import { Stack } from "@mui/material";

function StickyBottomBox(props) {
  return (
    <Stack
      spacing={2}
      sx={{
        boxShadow: "0px 0px 10px 2px #ddd",
        padding: "15px",
        color: "#05C2CC",
        marginTop: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* `marginTop: 'auto'` is required to make this stack sticky to the bottom of the panel */}
      {props.children}
    </Stack>
  );
}

export default StickyBottomBox;
