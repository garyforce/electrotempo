import { Stack } from "@mui/material";

const margin = "8px";

export type WidgetContainerProps = {
  children: React.ReactNode;
};

export default function WidgetContainer({ children }: WidgetContainerProps) {
  return (
    <Stack
      spacing={2}
      sx={{
        position: "absolute",
        margin: margin,
        zIndex: "1000",
        top: 0,
        right: 0,
        // height is calculated to remove margin (border-box not working). 20px
        // is the height of the attribution bar, so we don't cover it up and
        // appropriately space around it.
        height: `calc(100% - 20px - ${margin} * 2)`,
        pointerEvents: "none",
      }}
      alignItems={"flex-end"}
      direction={"column-reverse"}
    >
      {children}
    </Stack>
  );
}
