import { Paper } from "@mui/material";

export type ChartContainerProps = {
  children: React.ReactNode;
};

export default function ChartContainer({ children }: ChartContainerProps) {
  return (
    <Paper elevation={2} sx={{ padding: "10px" }}>
      {children}
    </Paper>
  );
}
