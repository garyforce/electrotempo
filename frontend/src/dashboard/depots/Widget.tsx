import { Box, SxProps } from "@mui/material";

export type WidgetProps = {
  children: React.ReactNode;
  sx?: SxProps;
};

export default function Widget({ children, sx }: WidgetProps) {
  return (
    <Box
      sx={{
        borderRadius: "10px",
        backgroundColor: "hsla(0,0%,100%,.8)",
        pointerEvents: "auto",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
