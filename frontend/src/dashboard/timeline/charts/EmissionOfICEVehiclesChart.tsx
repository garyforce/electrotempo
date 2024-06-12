import { Box, Paper, Typography } from "@mui/material";
import EmissionGeneratedChart from "./EmissionGeneratedChart";

type EmissionRates = {
  name: string;
  data: {
    year: number;
    value: number;
  }[];
};

export type EmissionsOfICEVehiclesChartProps = {
  type: string;
  emissionRates?: EmissionRates | undefined;
};

const EmissionsOfICEVehiclesChart = ({
  type,
  emissionRates,
}: EmissionsOfICEVehiclesChartProps) => {
  const SubscriptedText = (text: string) => {
    text = text.toLowerCase();
    if (text === "nox") {
      return { __html: `NO<sub>X</sub>` };
    }
    if (text === "pm10") {
      return { __html: `PM<sub>10</sub>` };
    }
    if (text === "pm25") {
      return { __html: `PM<sub>2.5</sub>` };
    }
    if (text === "sox") {
      return { __html: `SO<sub>X</sub>` };
    }
    if (text === "co2") {
      return { __html: `CO<sub>2</sub>` };
    }
    return { __html: text };
  };

  return (
    <Paper
      elevation={4}
      sx={{ width: "100%", padding: "14px", boxSizing: "border-box" }}
    >
      <Typography
        variant="h2"
        dangerouslySetInnerHTML={SubscriptedText(type)}
      />
      <Box sx={{ height: "18rem" }}>
        <EmissionGeneratedChart
          emissionRates={emissionRates}
          xAxisTitle={""}
          yAxisTitle={type === "co2" ? "Kg" : "Grams (Millions)"}
        />
      </Box>
    </Paper>
  );
};

export default EmissionsOfICEVehiclesChart;
