import { Divider, Stack, Typography } from "@mui/material";
import { GrowthScenario } from "types/growth-scenario";
import { ReactNode } from "react";

type ParameterRowProps = {
  field: string;
  value?: string | number | ReactNode;
};

function ParameterRow({ field, value }: ParameterRowProps) {
  let valueComponent: ReactNode = value;
  if (typeof value === "string" || typeof value === "number") {
    valueComponent = <Typography>{value}</Typography>;
  }

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ padding: "4px 8px" }}
    >
      <Typography fontWeight="500" sx={{ marginRight: "1em" }}>
        {field}
      </Typography>
      {valueComponent}
    </Stack>
  );
}

type FunctionSectionProps = {
  title: string;
  children:
    | React.ReactElement<ParameterRowProps>
    | React.ReactElement<ParameterRowProps>[];
};

function TableSection({ title, children }: FunctionSectionProps) {
  return (
    <>
      <Typography fontWeight={"bold"} variant={"h3"}>
        {title}
      </Typography>
      <Stack sx={{ "&>:nth-of-type(even)": { backgroundColor: "#EEE" } }}>
        {children}
      </Stack>
    </>
  );
}

function percentize(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export type ParameterTableProps = {
  growthScenario: GrowthScenario | undefined;
};

export default function ParameterTable({
  growthScenario,
}: ParameterTableProps) {
  if (growthScenario === undefined) {
    return null;
  }
  const spacing = 1;
  return (
    <Stack spacing={spacing}>
      <Typography fontWeight={"bold"} variant={"h2"}>
        Parameters for {growthScenario?.name}
      </Typography>
      <ParameterRow field="Name" value={growthScenario?.name} />
      <ParameterRow
        field="Description"
        value={
          growthScenario?.description === undefined ||
          growthScenario?.description === "" ? (
            <Typography color="#AAA" fontStyle={"italic"}>
              None Given
            </Typography>
          ) : (
            growthScenario?.description
          )
        }
      />
      {growthScenario?.vehicleClasses.map((vehicleClass) => (
        <Stack spacing={spacing} key={vehicleClass.name}>
          <Divider />
          <TableSection title={`Vehicle Class: ${vehicleClass.name}`}>
            <ParameterRow field={"Vehicle Class"} value={vehicleClass.name} />
            <ParameterRow
              field={"Description"}
              value={vehicleClass.description}
            />
          </TableSection>
          <TableSection title={"Population"}>
            <ParameterRow
              field={"Starting Population"}
              value={vehicleClass.config?.startingPopulation.toLocaleString(
                "en-US"
              )}
            />
            <ParameterRow
              field={"Growth Rate"}
              value={
                vehicleClass.config?.growthRate !== undefined
                  ? percentize(vehicleClass.config?.growthRate)
                  : undefined
              }
            />
            <ParameterRow
              field={"Scrappage Rate"}
              value={
                vehicleClass.config?.scrappageRate !== undefined
                  ? percentize(vehicleClass.config?.scrappageRate)
                  : undefined
              }
            />
            <ParameterRow
              field={"Scrappage Incentive Program"}
              value={vehicleClass.config?.scrappageIncentive ? "Yes" : "No"}
            />
            <ParameterRow
              field={"Scrappage Incentive Size"}
              value={
                vehicleClass.config?.scrappageIncentive ? (
                  percentize(vehicleClass.config?.scrappageIncentiveSize)
                ) : (
                  <Typography color="#AAA" fontStyle={"italic"}>
                    N/A
                  </Typography>
                )
              }
            />
            <ParameterRow
              field={"Retrofit Rate"}
              value={
                vehicleClass.config?.retrofitRate !== undefined
                  ? percentize(vehicleClass.config?.retrofitRate)
                  : undefined
              }
            />
            <ParameterRow
              field={"Retrofit Incentive Program"}
              value={vehicleClass.config?.retrofitIncentive ? "Yes" : "No"}
            />
            <ParameterRow
              field={"Retrofit Incentive Size"}
              value={
                vehicleClass.config?.retrofitIncentive ? (
                  percentize(vehicleClass.config?.retrofitIncentiveSize)
                ) : (
                  <Typography color="#AAA" fontStyle={"italic"}>
                    N/A
                  </Typography>
                )
              }
            />
          </TableSection>
          <TableSection title={"Sales Curve"}>
            <ParameterRow
              field={"Starting Year"}
              value={vehicleClass.config?.startYear}
            />
            <ParameterRow
              field={"Starting Marketshare"}
              value={
                vehicleClass.config?.startMarketshare !== undefined
                  ? percentize(vehicleClass.config?.startMarketshare)
                  : undefined
              }
            />
            <ParameterRow
              field={"Current Year"}
              value={vehicleClass.config?.currentYear}
            />
            <ParameterRow
              field={"Current Marketshare"}
              value={
                vehicleClass.config?.currentMarketshare !== undefined
                  ? percentize(vehicleClass.config?.currentMarketshare)
                  : undefined
              }
            />
            <ParameterRow
              field={"Target Year"}
              value={vehicleClass.config?.targetYear}
            />
            <ParameterRow
              field={"Target Marketshare"}
              value={
                vehicleClass.config?.targetMarketshare !== undefined
                  ? percentize(vehicleClass.config?.targetMarketshare)
                  : undefined
              }
            />
            <ParameterRow
              field={"Final Year"}
              value={vehicleClass.config?.finalYear}
            />
            <ParameterRow
              field={"Final Marketshare"}
              value={
                vehicleClass.config?.finalMarketshare !== undefined
                  ? percentize(vehicleClass.config?.finalMarketshare)
                  : undefined
              }
            />
          </TableSection>
        </Stack>
      ))}
    </Stack>
  );
}
