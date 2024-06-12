import PropTypes from "prop-types";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Tooltip, Stack } from "@mui/material";
import { TooltipProps } from "@mui/material";

type HelpTooltipProps = TooltipProps & {
  iconSpacing?: string;
};

export default function HelpTooltip(props: HelpTooltipProps) {
  const iconSpacing = props.iconSpacing || "0.2em";
  return (
    <Stack direction="row" alignItems="center">
      {props.children}
      <Tooltip title={props.title}>
        <HelpOutlineIcon color="info" sx={{ marginLeft: iconSpacing }} />
      </Tooltip>
    </Stack>
  );
}

HelpTooltip.propTypes = {
  Icon: PropTypes.element,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};
