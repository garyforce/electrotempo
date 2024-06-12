import { Box, Stack, Typography } from "@mui/material";
type EvPenetrationProps = {
  numEvs: number | undefined;
  percent: number | undefined;
};
export default function EvPenetration({ numEvs, percent }: EvPenetrationProps) {
  const numEvsString =
    typeof numEvs === "number" ? numEvs.toLocaleString("en-US") : " - ";
  const percentString =
    typeof percent === "number" ? ` ${(100 * percent).toFixed(1)}% ` : " -% "; // space padding is important
  return (
    <Stack alignItems={"center"} className={"ev-penetration"}>
      <Box>
        <Typography display="inline" sx={{ fontSize: "22pt" }}>
          {numEvsString}
        </Typography>
        <Typography display="inline"> EVs</Typography>
      </Box>
      <Box>
        <Typography display="inline">representing</Typography>
        <Typography display="inline" sx={{ fontWeight: "bold" }}>
          {percentString}
        </Typography>
        <Typography display="inline">of all light-duty vehicles</Typography>
      </Box>
    </Stack>
  );
}
