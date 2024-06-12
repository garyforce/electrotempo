import { Box, Stack } from "@mui/material";

export type SoloViewProps = {
  children?: React.ReactNode;
  variant?: "horizontal" | "vertical";
};
export function ChartLayout({ children, variant }: SoloViewProps) {
  variant = variant || "horizontal";
  if (variant === "horizontal") {
    return (
      <Box
        sx={{
          display: "grid",
          gridGap: "1rem",
          gridTemplateColumns: "repeat(auto-fill,minmax(27rem, 1fr))",
        }}
      >
        {children}
      </Box>
    );
  } else {
    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        {children}
      </Stack>
    );
  }
}
