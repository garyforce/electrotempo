import { Box, Divider, Stack, Typography } from "@mui/material";

export type LegendProps = {
  title: string;
  colors: (string | number)[];
  units: string;
};

export default function Legend({ title, colors, units }: LegendProps) {
  const rows = [];
  for (let i = 0; i < colors.length; i += 2) {
    const value = colors[i];
    const color = colors[i + 1];
    rows.push(
      <Stack
        key={i}
        direction="row"
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box
          sx={{
            height: "20px",
            width: "40px",
            borderRadius: "5px",
            backgroundColor: color,
            justifyContent: "center",
          }}
        ></Box>
        <Typography sx={{ float: "right" }}>{`${value.toLocaleString(
          "en-us"
        )} ${units}`}</Typography>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={2}
      divider={<Divider orientation="horizontal" flexItem />}
      sx={{ padding: "16px" }}
    >
      <Typography variant={"h3"}>{title}</Typography>
      <Stack spacing={1}>{rows}</Stack>
    </Stack>
  );
}
