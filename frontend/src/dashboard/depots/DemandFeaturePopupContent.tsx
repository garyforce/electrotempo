import { useAuth0 } from "@auth0/auth0-react";
import { Delete } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  AlertColor,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { loadDepotDemand } from "api/depot-demand";
import { useDepotFleetByState } from "api/depot-fleet";
import { disableDepotInformation, useDepotInState } from "api/depots";
import { loadFeederLineDemand } from "api/feeder-line-demand";
import { loadFeederLine } from "api/feeder-lines";
import { Feature } from "geojson";
import { useEffect, useState } from "react";
import { DepotDemand } from "types/electric-demand";
import ChartContainer from "./ChartContainer";
import DemandChart from "./DemandChart";

function DepotProperties({
  depotId,
  year,
  state,
  isTxPPC,
}: {
  depotId: number;
  year: number;
  state: string;
  isTxPPC: boolean;
}) {
  const { depot } = useDepotInState(depotId, state);

  let businessName = depot?.properties?.business_name;
  businessName = businessName && businessName !== "" ? businessName : "unknown";

  const googlePlacesLink = depot?.properties?.google_places_list
    ? `https://www.google.com/maps/place/?q=place_id:${
        depot?.properties?.google_places_list?.split(",")[0]
      }`
    : depot?.geometry
    ? `https://www.google.com/maps/place/${(
        depot?.geometry as any
      ).coordinates[1].toString()}, ${(
        depot?.geometry as any
      ).coordinates[0].toString()}`
    : "unknown";

  const { depotFleet } = useDepotFleetByState(depotId, year, state, isTxPPC);

  const totalFleetSize =
    depotFleet?.reduce((accumulator, actFleet) => {
      return accumulator + actFleet.totalVehicles;
    }, 0) ?? 0;

  const totalEvFleetSize =
    depotFleet?.reduce((accumulator, actFleet) => {
      return accumulator + actFleet.totalEvs;
    }, 0) ?? 0;

  // sort fleet data by act category
  depotFleet?.sort((a, b) => {
    if (a.actCategory < b.actCategory) {
      return -1;
    }
    if (a.actCategory > b.actCategory) {
      return 1;
    }
    return 0;
  });

  return (
    <>
      {businessName !== "unknown" && (
        <ListItem disableGutters>
          <ListItemText
            primary="Business Name"
            secondary={
              depot ? businessName : () => <Skeleton variant={"text"} />
            }
          />
        </ListItem>
      )}
      <Divider component="li" />
      {depot?.properties?.owner &&
        businessName !== depot?.properties?.owner && (
          <ListItem disableGutters>
            <ListItemText
              primary="Owner"
              secondary={
                depot ? (
                  depot?.properties?.owner ?? "unknown"
                ) : (
                  <Skeleton variant={"text"} />
                )
              }
            />
          </ListItem>
        )}
      <Divider component="li" />
      {isTxPPC === false && (
        <ListItem disableGutters>
          <ListItemText
            primary="Total Fleet Size"
            secondary={
              depotFleet ? (
                `${Math.floor(totalFleetSize)}-${Math.ceil(
                  totalFleetSize
                )} vehicles (${totalEvFleetSize.toFixed(0)} EV${
                  totalEvFleetSize > 1 ? "s" : ""
                })`
              ) : (
                <Skeleton variant={"text"} />
              )
            }
          />
        </ListItem>
      )}
      {depotFleet?.map((actFleet) => (
        <ListItem disableGutters>
          <ListItemText
            inset
            primary={actFleet.vehicleClassName}
            secondary={`${Math.floor(actFleet.totalVehicles)}-${Math.ceil(
              actFleet.totalVehicles
            )} vehicles (${actFleet.totalEvs.toFixed(0)} EV${
              actFleet.totalEvs > 1 ? "s" : ""
            })`}
          />
        </ListItem>
      ))}
      {isTxPPC && depot && depot?.properties?.state === "TX" && (
        <ListItem disableGutters>
          <ListItemText
            primary="Address"
            secondary={
              depot ? (
                depot?.properties?.address ?? "unknown"
              ) : (
                <Skeleton variant={"text"} />
              )
            }
          />
        </ListItem>
      )}
      {isTxPPC && googlePlacesLink !== "unknown" && (
        <ListItem disableGutters>
          <Link href={googlePlacesLink} target="_blank">
            Google Maps
          </Link>
        </ListItem>
      )}
    </>
  );
}

function FeederLineProperties({
  fullFeederLine,
}: {
  fullFeederLine?: Feature;
}) {
  return (
    <>
      {fullFeederLine ? (
        <ListItem disableGutters>
          <ListItemText
            primary="Substation"
            secondary={fullFeederLine?.properties?.substation ?? "unknown"}
          />
        </ListItem>
      ) : (
        <>
          <Skeleton variant={"text"} />
          <Skeleton variant={"text"} />
        </>
      )}
    </>
  );
}

type DemandFeatureType = "Depot" | "Feeder Line";

export function getDemandFeatureType(feature: Feature): DemandFeatureType {
  const geometryType = feature.geometry.type;
  switch (geometryType) {
    case "Point":
      return "Depot";
    case "LineString":
    case "MultiLineString":
      return "Feeder Line";
    default:
      throw new Error(`Unknown geometry type: ${geometryType}`);
  }
}

export type DemandFeaturePopupContentProps = {
  isAdmin?: Boolean;
  feature: Feature;
  year: number;
  state: string;
  isTxPPC?: boolean;
  scenarioId: string;
  setSnackMessage?: (msg: string) => void;
  setOpen?: (data: boolean) => void;
  setSnackColor?: (color: AlertColor) => void;
  setPopupInfo?: () => void;
  loadDepot?: () => void;
};

export function DemandFeaturePopupContent({
  isAdmin,
  feature,
  year,
  state,
  isTxPPC,
  scenarioId,
  setSnackMessage,
  setOpen,
  setSnackColor,
  setPopupInfo,
  loadDepot,
}: DemandFeaturePopupContentProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [fullFeature, setFullFeature] = useState<Feature | undefined>(
    undefined
  );
  const [demand, setDemand] = useState<DepotDemand[] | undefined>(undefined);
  const [tab, setTab] = useState<"properties" | "power" | "energy">(
    "properties"
  );
  const [deleteScenarioPopup, setDeleteScenarioPopup] = useState(false);

  const featureType = getDemandFeatureType(feature);
  const isLonghaulFleets = feature.properties?.datasource?.includes("FMCSA");

  useEffect(() => {
    const loadData = async () => {
      const apiToken = await getAccessTokenSilently();

      if (featureType === "Depot") {
        try {
          const depotDemand = await loadDepotDemand(
            apiToken,
            feature.properties!.id,
            state,
            year,
            undefined,
            scenarioId
          );
          setDemand(depotDemand);
        } catch (error) {
          setSnackMessage && setSnackMessage("Failed to fetch depot demand.");
          setOpen && setOpen(true);
        }
      }

      if (featureType === "Feeder Line" && !isTxPPC) {
        const feederLine = await loadFeederLine(
          feature.properties!.id,
          apiToken
        );
        const feederLineDemand = await loadFeederLineDemand(
          apiToken,
          feature.properties!.id,
          undefined,
          year,
          undefined
        );
        setFullFeature(feederLine);
        setDemand(feederLineDemand);
      }
    };
    if (feature) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature, featureType, year, state, isTxPPC, getAccessTokenSilently]);

  const disableDepot = async () => {
    try {
      const apiToken = await getAccessTokenSilently();
      await disableDepotInformation(apiToken, feature.properties!.id, state);
      setPopupInfo && setPopupInfo();
      setSnackColor && setSnackColor("success");
      setSnackMessage && setSnackMessage("Successfully disabled the depot.");
      setOpen && setOpen(true);
      loadDepot && loadDepot();
    } catch (error) {
      setSnackColor && setSnackColor("error");
      setSnackMessage && setSnackMessage("Failed to disable depot.");
      setOpen && setOpen(true);
    }
  };

  return (
    <Stack spacing={2} sx={{ width: "406px", padding: "10px" }}>
      <Grid container justifyContent={"space-between"}>
        <Grid item>
          <Typography variant={"h2"}>{featureType} Information</Typography>
        </Grid>
        {isAdmin && isTxPPC && (
          <Grid item>
            <Tooltip title="Disable Depot">
              <IconButton onClick={() => setDeleteScenarioPopup(true)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
      </Grid>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={(e, value) => setTab(value)}>
            <Tab value={"properties"} label={`Properties`} />
            <Tab value={"power"} label="Power" disabled={isLonghaulFleets} />
            <Tab value={"energy"} label="Energy" disabled={isLonghaulFleets} />
          </TabList>
        </Box>
        <TabPanel value={"properties"}>
          <List dense>
            <ListItem disableGutters>
              <ListItemText
                primary="ID"
                secondary={feature.properties?.id ?? "unknown"}
              />
            </ListItem>
            <Divider component="li" />
            {featureType === "Depot" && (
              <DepotProperties
                depotId={feature.properties?.id}
                year={year}
                state={state}
                isTxPPC={isTxPPC ?? false}
              />
            )}
            {featureType === "Feeder Line" && (
              <FeederLineProperties fullFeederLine={fullFeature} />
            )}
          </List>
        </TabPanel>
        <TabPanel value={"power"}>
          <Stack spacing={2}>
            <ChartContainer>
              <Typography variant={"h3"}>Power Profile</Typography>
              {demand ? (
                <Box sx={{ height: "200px", width: "100%" }}>
                  <DemandChart data={demand} variant="power" />
                </Box>
              ) : (
                <Skeleton
                  width={"100%"}
                  height={"200px"}
                  sx={{ top: 0, right: 0 }}
                />
              )}
            </ChartContainer>
          </Stack>
        </TabPanel>
        <TabPanel value={"energy"}>
          <ChartContainer>
            <Typography variant="h3">Energy Profile</Typography>
            {demand ? (
              <Box sx={{ height: "200px", width: "100%" }}>
                <DemandChart data={demand} variant="energy" />
              </Box>
            ) : (
              <Skeleton
                width={"100%"}
                height={"200px"}
                sx={{ top: 0, right: 0 }}
              />
            )}
          </ChartContainer>
        </TabPanel>
      </TabContext>

      {/* Delete Growth Scenario Popup */}
      <Dialog
        open={deleteScenarioPopup}
        onClose={() => setDeleteScenarioPopup(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <IconButton
          aria-label="close"
          onClick={() => setDeleteScenarioPopup(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <GridCloseIcon />
        </IconButton>
        <DialogTitle id="alert-dialog-title">
          {`Do you want to disable the depot (${
            (feature.properties?.business_name || feature.properties?.id) ?? ""
          })?`}
        </DialogTitle>
        <DialogActions>
          <Button color="error" onClick={() => disableDepot()}>
            Delete
          </Button>
          <Button
            color="inherit"
            sx={{ color: "black" }}
            onClick={() => setDeleteScenarioPopup(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
