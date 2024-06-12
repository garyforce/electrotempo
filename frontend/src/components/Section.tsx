import { Box } from "@mui/material";

export function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        border: 0.5,
        padding: "16px",
        borderColor: "silver",
        borderRadius: 5,
        marginTop: 2,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </Box>
  );
}
