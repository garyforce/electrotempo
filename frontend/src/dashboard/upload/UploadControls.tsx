import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import {
  FormControl,
  FormGroup,
  TextField,
  Typography,
  Stack,
  Input,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Modal,
  Box,
  Checkbox,
  LinearProgress,
  Alert,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
  AlertTitle,
} from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimeSlider from "components/TimeSlider";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertPageBreakIcon from "@mui/icons-material/InsertPageBreak";
import { Location } from "types/location";

import { BlobReader, ZipReader } from "@zip.js/zip.js";
import HelpTooltip from "components/HelpTooltip";

const INITIALIZE_UPLOAD_URL = `${process.env.REACT_APP_API_GATEWAY_URL}/traffic-model/uploads/initialize`;
const FINISH_UPLOAD_URL = `${process.env.REACT_APP_API_GATEWAY_URL}/traffic-model/uploads/finish`;
const INSERT_TRAFFIC_MODEL_URL = `${process.env.REACT_APP_API_GATEWAY_URL}/traffic-model`;

function periodsOverlap(period1: number[], period2: number[]) {
  return period1[0] < period2[1] && period2[0] < period1[1];
}

type JobStatus = "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED" | "ERROR";

async function getFileNamesFromZip(file: File): Promise<string[]> {
  const zipReader = new ZipReader(new BlobReader(file));
  const entries = await zipReader.getEntries();
  return entries.map((entry) => entry.filename);
}

function getOptionalFilesByModelType(modelType: ModelType): string[] {
  const dynustFiles: string[] = ["external_stations.txt", "user_bev_types.csv"];
  const fourStepFiles: string[] = [
    "external_stations.txt",
    "user-arrivals-profile.csv",
    "user_bev_types.csv",
  ];
  const mobilitiFiles: string[] = ["user_bev_types.csv"];
  switch (modelType) {
    case "dynust":
      return dynustFiles;
    case "4step":
      return fourStepFiles;
    case "Mobiliti":
      return mobilitiFiles;
  }
}

export type PeakPeriod = number[];

/* ABM is intentionally not included in ModelType because the database currently
 * requires parameters that are not relevant for that model type, which messes
 * with the whole system design/API. It's currently out of scope as I write this,
 * so I didn't bother to include it, but if you need to add it, add "abm" as a
 * ModelType and follow the TypeScript errors to see where it leads you.
 */
type ModelType = "dynust" | "4step" | "Mobiliti";

export type FourStepSimulationParameters = {
  name: string;
  description: string | undefined;
  modelType: ModelType;
  modelYear: number;
  modelSource: string;
  location: string | undefined;
  replicates: number;
  numVehicles: number;
  adoptionPcts: number[];
  amPeriod: PeakPeriod;
  pmPeriod: PeakPeriod;
  shouldMapDemandToBlockGroups: boolean;
  locationName: string;
};

export type DynustSimulationParameters = {
  name: string;
  description: string | undefined;
  modelType: ModelType;
  modelYear: number;
  modelSource: string;
  location: string | undefined;
  replicates: number;
  numVehicles: number;
  adoptionPcts: number[];
  shouldMapDemandToBlockGroups: boolean;
};

export type MobilitiSimulationParameters = {
  name: string;
  description: string | undefined;
  modelType: ModelType;
  modelYear: number;
  modelSource: string;
  location: string | undefined;
  replicates: number;
  numVehicles: number;
  adoptionPcts: number[];
  shouldMapDemandToBlockGroups: boolean;
};

export type SimulationParameters =
  | FourStepSimulationParameters
  | DynustSimulationParameters
  | MobilitiSimulationParameters;

type UploadControlsProps = {
  onCloseButtonClick: Function;
  locations: Location[];
};

function UploadControls({
  onCloseButtonClick,
  locations,
}: UploadControlsProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [trafficModelName, setTrafficModelName] = useState("");
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [numReplicates, setNumReplicates] = useState("1"); // string to have better text field input UX
  const [modelType, setModelType] = useState<ModelType>("dynust");
  const [modelYear, setModelYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [numVehicles, setNumVehicles] = useState<string>("1000000");
  const [modelSource, setModelSource] = useState<string>("Statewide");
  const [mapDemandToBlockGroups, setMapDemandToBlockGroups] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [uploadErrorText, setUploadErrorText] = useState<string>("");
  const [zipFile, setZipFile] = useState<File | undefined>(undefined);
  const [zipFileContents, setZipFileContents] = useState<string[]>([]);
  const [initializeUploadStatus, setInitializeUploadStatus] =
    useState<JobStatus>("NOT_STARTED");
  const [zipFileUploadStatus, setZipFileUploadStatus] =
    useState<JobStatus>("NOT_STARTED");
  const [
    simulationParametersUploadStatus,
    setSimulationParametersUploadStatus,
  ] = useState<JobStatus>("NOT_STARTED");
  const [trafficModelInsertStatus, setTrafficModelInsertStatus] =
    useState<JobStatus>("NOT_STARTED");
  const [amPeriod, setAmPeriod] = useState([6.5, 9]);
  const [pmPeriod, setPmPeriod] = useState([15, 18.5]);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const locationId = location?.id;

  function getRequiredFilesByModelType(modelType: ModelType): string[] {
    const dynustFiles = [
      "VehTrajectory.dat",
      "output_vehicle.dat",
      "network_definition_links.geojson",
    ];
    if (mapDemandToBlockGroups) {
      dynustFiles.push("network_definition_nodes.geojson");
    }

    const fourStepFiles = [
      "AM_All_Purposes.xlsx",
      "PM_All_Purposes.xlsx",
      "OP_All_Purposes.xlsx",
    ];
    if (mapDemandToBlockGroups) {
      fourStepFiles.push("TAZ.shp");
      fourStepFiles.push("TAZ.shx");
      fourStepFiles.push("TAZ.dbf");
      fourStepFiles.push("TAZ.prj");
    }

    const mobilitiFiles = ["mobiliti_trips.csv"];

    switch (modelType) {
      case "dynust":
        return dynustFiles;
      case "4step":
        return fourStepFiles;
      case "Mobiliti":
        return mobilitiFiles;
    }
  }

  function createSimulationParameters(): SimulationParameters {
    switch (modelType) {
      case "dynust":
        return {
          name: trafficModelName,
          description: description,
          modelType: modelType,
          modelYear: Number(modelYear),
          modelSource: modelSource,
          location: locationId,
          replicates: Number(numReplicates),
          numVehicles: Number(numVehicles),
          adoptionPcts: [100],
          shouldMapDemandToBlockGroups: mapDemandToBlockGroups,
        };
      case "4step":
        return {
          name: trafficModelName,
          description: description,
          modelType: modelType,
          modelYear: Number(modelYear),
          modelSource: modelSource,
          location: locationId,
          replicates: Number(numReplicates),
          numVehicles: Number(numVehicles),
          adoptionPcts: [100],
          amPeriod: amPeriod,
          pmPeriod: pmPeriod,
          shouldMapDemandToBlockGroups: mapDemandToBlockGroups,
          locationName:
            location?.name ||
            "Unspecified location. If you see this, there's a bug.",
        };
      case "Mobiliti":
        return {
          name: trafficModelName,
          description: description,
          modelType: modelType,
          modelYear: Number(modelYear),
          modelSource: modelSource,
          location: locationId,
          replicates: Number(numReplicates),
          numVehicles: Number(numVehicles),
          adoptionPcts: [100],
          shouldMapDemandToBlockGroups: mapDemandToBlockGroups,
        };
    }
  }

  const uploadError = (errorText: string) => {
    setUploadInProgress(false);
    setUploadErrorText(errorText);
  };

  const uploadFiles = async () => {
    if (zipFile === undefined) {
      throw TypeError("zipFile must not be undefined");
    }
    setUploadInProgress(true);
    setUploadModalOpen(true);

    const token = await getAccessTokenSilently();

    /* Initialize upload with AWS */
    const FILE_CHUNK_SIZE = 1_000_000_000;
    const getNumParts = (file: Blob, chunkSize: number) =>
      Math.floor(file.size / chunkSize) + 1;
    const queryStringParams = new URLSearchParams({
      numFileParts: String(getNumParts(zipFile, FILE_CHUNK_SIZE)),
    });
    const getUploadEndpointURL = `${INITIALIZE_UPLOAD_URL}?${new URLSearchParams(
      queryStringParams
    )}`;
    setInitializeUploadStatus("IN_PROGRESS");
    let initializeUploadResponse;
    try {
      initializeUploadResponse = await fetch(getUploadEndpointURL, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!initializeUploadResponse.ok) {
        setInitializeUploadStatus("ERROR");
        uploadError(
          "There was an error initializing the upload. Please try again."
        );
        return;
      }
    } catch (error) {
      setInitializeUploadStatus("ERROR");
      uploadError(
        "There was an error initializing the upload. Please try again."
      );
      return;
    }
    let { uuid, zipUpload, simulationParametersUpload } =
      await initializeUploadResponse.json();
    setInitializeUploadStatus("COMPLETED");

    try {
      setZipFileUploadStatus("IN_PROGRESS");
      await uploadFileParts(
        zipFile,
        FILE_CHUNK_SIZE,
        zipUpload.urls,
        zipUpload.filename,
        zipUpload.uploadId
      );
      setZipFileUploadStatus("COMPLETED");
    } catch (error) {
      console.error(error);
      uploadError(
        "There was an error uploading the .zip file. Please try again."
      );
      return;
    }

    const simulationParams = createSimulationParameters();
    try {
      setSimulationParametersUploadStatus("IN_PROGRESS");
      await uploadFileParts(
        new File(
          [JSON.stringify(simulationParams)],
          "simulation_parameters.json"
        ),
        FILE_CHUNK_SIZE,
        simulationParametersUpload.urls,
        simulationParametersUpload.filename,
        simulationParametersUpload.uploadId,
        uuid
      );
      setSimulationParametersUploadStatus("COMPLETED");
    } catch (error) {
      setSimulationParametersUploadStatus("ERROR");
      console.error(error);
      uploadError(
        "There was an error uploading the simulation parameters file. Please try again."
      );
      return;
    }

    try {
      setTrafficModelInsertStatus("IN_PROGRESS");
      await insertTrafficModel(uuid, simulationParams);
      setTrafficModelInsertStatus("COMPLETED");
    } catch (error) {
      console.error(error);
      uploadError(
        "There was an error finalizing the upload. Please try again."
      );
    }
    setUploadInProgress(false);
  };

  const uploadFileParts = async (
    file: Blob,
    chunkSize: number,
    partUrls: string[],
    filename: string,
    uploadId: string,
    uuid = undefined
  ) => {
    const partPromises = [];

    for (let i = 0; i < partUrls.length; i++) {
      const start = i * chunkSize;
      const end = (i + 1) * chunkSize;
      const blob =
        i < partUrls.length ? file.slice(start, end) : file.slice(start);

      partPromises.push(
        fetch(partUrls[i], {
          method: "PUT",
          body: blob,
        })
      );
    }
    let partResponses: Response[] = [];
    try {
      partResponses = await Promise.all(partPromises);
    } catch (error) {
      Promise.reject(error);
    }

    // construct the JSON object to send to completeUpload endpoint
    let parts = [];
    for (let i = 0; i < partResponses.length; i++) {
      parts.push({
        ETag: JSON.parse(partResponses[i].headers.get("ETag") || ""),
        PartNumber: i + 1,
      });
    }
    const token = await getAccessTokenSilently();
    let completeUploadResponse;
    try {
      completeUploadResponse = await fetch(FINISH_UPLOAD_URL, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: filename,
          parts: parts,
          uploadId: uploadId,
          uuid: uuid,
        }),
      });
    } catch (error) {
      return Promise.reject(error);
    }
    if (completeUploadResponse.ok) {
      return Promise.resolve(completeUploadResponse);
    } else {
      return Promise.reject(completeUploadResponse);
    }
  };

  const insertTrafficModel = async (
    awsUuid: string,
    simulationParams: SimulationParameters
  ) => {
    const token = await getAccessTokenSilently();
    let response;
    try {
      response = await fetch(INSERT_TRAFFIC_MODEL_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: simulationParams.name,
          description: simulationParams.description,
          modelType: simulationParams.modelType,
          modelYear: simulationParams.modelYear,
          modelSource: simulationParams.modelSource,
          location: simulationParams.location,
          replicates: numReplicates,
          numVehicles: numVehicles,
          awsUuid: awsUuid,
          hasNodesFile: simulationParams.shouldMapDemandToBlockGroups,
        }),
      });
    } catch (error) {
      return Promise.reject(error);
    }
    if (response.ok) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (zipFile !== undefined) {
        setZipFileContents([]);
        let files = await getFileNamesFromZip(zipFile);
        setZipFileContents(files);
      }
    }
    loadData();
  }, [zipFile]);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 4,
  };

  const validateTrafficModelName = (name: string) => {
    return name.length > 0;
  };

  const minReplicates = 1;
  const maxReplicates = 10;
  const validateNumberOfReplicates = (replicates: string) => {
    const integerRegex = /^\d+$/;
    if (!integerRegex.test(replicates)) {
      return false;
    }
    let replicatesNum = parseInt(replicates);
    return replicatesNum >= minReplicates && replicatesNum <= maxReplicates;
  };

  const validateNumberOfVehicles = (vehicles: string) => {
    const integerRegex = /^\d+$/;
    return integerRegex.test(vehicles) && parseInt(vehicles) > 0;
  };

  const minYear = 2010;
  const maxYear = 2050;
  const validateModelYear = (year: string) => {
    return Number(year) >= minYear && Number(year) <= maxYear;
  };
  const handleModelYearChange = (value: string) => {
    let year = parseInt(value);
    isNaN(year) ? setModelYear("") : setModelYear(value);
  };

  const handleMapDemandToBlockGroupsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let checked = event.target.checked;
    setMapDemandToBlockGroups(checked);
  };

  const periodsAreOverlapping = periodsOverlap(amPeriod, pmPeriod);
  const amPeriodAfterPmPeriod = Math.min(...amPeriod) >= Math.max(...pmPeriod);
  const validTrafficModelName = validateTrafficModelName(trafficModelName);
  const validNumberOfReplicates = validateNumberOfReplicates(numReplicates);
  const validModelYear = validateModelYear(modelYear);
  const validNumberOfVehicles = validateNumberOfVehicles(numVehicles);
  const missingRequiredFiles = getRequiredFilesByModelType(modelType).filter(
    (file) => !zipFileContents.includes(file)
  );
  const zipFileContainsRequiredFiles = missingRequiredFiles.length === 0;
  const disableModelSourceButton = modelType === "Mobiliti";
  const disableUploadButton =
    zipFile === undefined ||
    !validTrafficModelName ||
    !validNumberOfReplicates ||
    !validModelYear ||
    periodsAreOverlapping ||
    !zipFileContainsRequiredFiles ||
    modelSource === "" ||
    location === undefined;

  return (
    <>
      <Stack
        spacing={2}
        sx={{
          width: "462px",
          padding: "30px",
          overflowY: "scroll",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h1">New Simulation</Typography>
        <TextField
          error={!validTrafficModelName}
          helperText={
            validTrafficModelName
              ? ""
              : "Please enter a name for the traffic model"
          }
          label={"Traffic Model Name"}
          value={trafficModelName}
          onChange={(event) => setTrafficModelName(event.target.value)}
        />
        <TextField
          helperText={
            validTrafficModelName
              ? ""
              : "Optionally, enter a description of the traffic model"
          }
          label={"Description"}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Stack spacing={8} direction="row">
          <Typography variant="h2">Model Type</Typography>
          <Typography variant="h2">Model Source</Typography>
        </Stack>
        <Stack spacing={4.8} direction="row">
          <FormControl>
            <RadioGroup
              name="type"
              value={modelType}
              onChange={(event, value) => {
                if (modelType === "Mobiliti") setModelSource("");
                setModelType(value as ModelType);
                if (value === "Mobiliti") setModelSource("Mobiliti");
              }}
            >
              <FormControlLabel
                value="dynust"
                control={<Radio />}
                label="DynusT"
              />
              <FormControlLabel
                value="4step"
                control={<Radio />}
                label="4-Step"
              />
              <FormControlLabel
                value="Mobiliti"
                control={<Radio />}
                label="Mobiliti"
              />
              <FormControlLabel
                value="tripList"
                control={<Radio />}
                label="Trip List"
                disabled
              />
              <FormControlLabel
                value="activityBasedModel"
                control={<Radio />}
                label="Activity-based"
                disabled
              />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <RadioGroup
              name="source"
              value={modelSource}
              onChange={(event, value) => setModelSource(value as ModelType)}
            >
              <FormControlLabel
                value="MPO"
                control={<Radio />}
                label="MPO"
                disabled={disableModelSourceButton}
              />
              <FormControlLabel
                value="Statewide"
                control={<Radio />}
                label="Statewide"
                disabled={disableModelSourceButton}
              />
            </RadioGroup>
          </FormControl>
        </Stack>
        <Typography variant={"h3"}>Model Year</Typography>
        <TextField
          inputProps={{
            inputMode: "numeric",
          }}
          error={!validModelYear}
          helperText={
            validModelYear
              ? ""
              : `Please enter a year from ${minYear} to ${maxYear}`
          }
          label="Year of Traffic Model"
          value={modelYear}
          onChange={(event) => handleModelYearChange(event.target.value)}
        />
        <Typography variant="h2">Simulation Parameters</Typography>
        <Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={mapDemandToBlockGroups}
                  onChange={handleMapDemandToBlockGroupsChange}
                />
              }
              label="Map demand to block groups"
            />
          </FormGroup>
        </Box>
        <Typography variant={"h3"}>Location</Typography>
        <FormControl
          required
          className="location-select"
          error={location === undefined}
        >
          <InputLabel id="location-select-label">Location</InputLabel>
          <Select
            labelId="location-select-label"
            value={locationId}
            label="Location"
            onChange={(event) =>
              setLocation(
                locations.find((location) => location.id === event.target.value)
              )
            }
          >
            {locations.map((location) => {
              return <MenuItem value={location.id}>{location.name}</MenuItem>;
            })}
          </Select>
          <FormHelperText>Required</FormHelperText>
        </FormControl>
        {modelType === "4step" && (
          <Stack spacing={2}>
            <Stack spacing={2}>
              <Typography variant={"h3"}>Periods</Typography>
              <Stack>
                <Typography id="am-period-slider" variant={"h4"}>
                  AM Period
                </Typography>
                <TimeSlider
                  aria-labelledby="am-period-slider"
                  value={amPeriod}
                  onChange={(event: Event, newValue: number | number[]) =>
                    setAmPeriod(newValue as number[])
                  }
                  valueLabelDisplay="auto"
                  getAriaValueText={(value: number, index: number) => "TODO"}
                  step={0.25}
                  duplicateMidnight
                />
              </Stack>
              <Stack>
                <Typography id="pm-period-slider" variant={"h4"}>
                  PM Period
                </Typography>
                <TimeSlider
                  aria-labelledby="pm-period-slider"
                  value={pmPeriod}
                  onChange={(event: Event, newValue: number | number[]) =>
                    setPmPeriod(newValue as number[])
                  }
                  valueLabelDisplay="auto"
                  getAriaValueText={(value: number, index: number) => "TODO"}
                  step={0.25}
                  duplicateMidnight
                />
              </Stack>
              {periodsAreOverlapping && (
                <Alert severity="error">Periods overlap</Alert>
              )}
              {!periodsAreOverlapping && amPeriodAfterPmPeriod && (
                <Alert severity="warning">AM period is after PM period</Alert>
              )}
            </Stack>
          </Stack>
        )}
        <Typography variant={"h3"}>Replicates</Typography>
        <TextField
          inputProps={{
            inputMode: "numeric",
          }}
          error={!validNumberOfReplicates}
          helperText={
            validNumberOfReplicates
              ? ""
              : `Please enter a number from ${minReplicates} to ${maxReplicates}`
          }
          label="Number of Replicates"
          value={numReplicates}
          onChange={(event) => setNumReplicates(event.target.value)}
        />
        <Typography variant={"h3"}>Number of Vehicles</Typography>
        <TextField
          inputProps={{
            inputMode: "numeric",
          }}
          error={!validNumberOfVehicles}
          helperText={
            validNumberOfVehicles ? "" : `Please enter a number greater than 0`
          }
          label="Number of Vehicles"
          value={numVehicles}
          onChange={(event) => setNumVehicles(event.target.value)}
        />
        <HelpTooltip
          title={
            <>
              <Typography>
                Choose a .zip file containing the following files:
              </Typography>
              <Box sx={{ marginLeft: "2.5em", width: "300px" }}>
                <ul>
                  {getRequiredFilesByModelType(modelType).map((file) => (
                    <Typography component={"li"}>{file}</Typography>
                  ))}
                  {getOptionalFilesByModelType(modelType).map((file) => (
                    <Typography component={"li"}>{file} (optional)</Typography>
                  ))}
                </ul>
              </Box>
            </>
          }
        >
          <Typography variant="h2">Input Files</Typography>
        </HelpTooltip>
        <Stack spacing={1}>
          <Stack direction="row" alignItems={"center"}>
            <FolderZipIcon
              color={
                zipFile === undefined || !zipFileContainsRequiredFiles
                  ? "error"
                  : "primary"
              }
              sx={{ marginRight: "1.2em" }}
            />
            <FormControl>
              <Input
                id="zip-file"
                type="file"
                inputProps={{ accept: ".zip" }}
                onChange={(event) => {
                  let files = (event.target as HTMLInputElement).files || [];
                  if (files.length > 0) {
                    setZipFile(files[0]);
                  }
                }}
                disableUnderline
              />
            </FormControl>
          </Stack>
          {zipFile !== undefined && !zipFileContainsRequiredFiles && (
            <List disablePadding>
              {getRequiredFilesByModelType(modelType).map((filename) => {
                const icon = zipFileContents.includes(filename) ? (
                  <DescriptionIcon color="primary" />
                ) : (
                  <InsertPageBreakIcon color={"error"} />
                );
                return (
                  <ListItem>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{filename}</ListItemText>
                  </ListItem>
                );
              })}
              {getOptionalFilesByModelType(modelType).map((filename) => {
                const icon = zipFileContents.includes(filename) ? (
                  <DescriptionIcon color="primary" />
                ) : (
                  <InsertPageBreakIcon color={"secondary"} />
                );
                return (
                  <ListItem>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{filename} (optional)</ListItemText>
                  </ListItem>
                );
              })}
            </List>
          )}
          {zipFile !== undefined && !zipFileContainsRequiredFiles && (
            <Alert severity="error">
              <AlertTitle>Error in Selected File</AlertTitle>
              There are required files missing in the selected .zip file.
            </Alert>
          )}
        </Stack>
        <Button
          variant="contained"
          onClick={uploadFiles}
          disabled={disableUploadButton}
        >
          Submit Simulation
        </Button>
      </Stack>
      <Modal open={uploadModalOpen}>
        <Box sx={modalStyle}>
          <Typography variant="h2">Uploading Files</Typography>
          <Typography variant="subtitle1">
            Please wait, this may take a moment
          </Typography>
          <Stack>
            {uploadErrorText && (
              <Typography color="red">{uploadErrorText}</Typography>
            )}
            <Timeline
              sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  padding: 0,
                },
                marginBottom: "-16px", // counters final TimelineSeparator
              }}
            >
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color={"primary"}></TimelineDot>
                  <TimelineConnector
                    sx={{
                      bgcolor:
                        initializeUploadStatus === "COMPLETED"
                          ? "primary.main"
                          : "grey",
                    }}
                  />
                </TimelineSeparator>
                <TimelineContent>Initializing upload</TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot
                    color={
                      zipFileUploadStatus !== "NOT_STARTED" ? "primary" : "grey"
                    }
                  ></TimelineDot>
                  <TimelineConnector
                    sx={{
                      bgcolor:
                        zipFileUploadStatus === "COMPLETED"
                          ? "primary.main"
                          : "grey",
                    }}
                  />
                </TimelineSeparator>
                <TimelineContent>
                  <Stack direction={"row"} alignItems={"center"} spacing={2}>
                    <Typography>Uploading file</Typography>
                    <Stack direction="row" alignItems={"center"} spacing={1}>
                      {zipFileUploadStatus === "IN_PROGRESS" && (
                        <Box sx={{ width: "150px" }}>
                          <LinearProgress />
                        </Box>
                      )}
                      {zipFileUploadStatus === "COMPLETED" && (
                        <>
                          <Box sx={{ width: "150px" }}>
                            <LinearProgress variant="determinate" value={100} />
                          </Box>
                          <Typography fontSize={"0.8em"} sx={{ color: "#444" }}>
                            100%
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot
                    color={
                      zipFileUploadStatus === "COMPLETED" ? "primary" : "grey"
                    }
                  ></TimelineDot>
                  <TimelineConnector
                    sx={{
                      bgcolor:
                        simulationParametersUploadStatus === "COMPLETED"
                          ? "primary.main"
                          : "grey",
                    }}
                  />
                </TimelineSeparator>
                <TimelineContent>
                  Processing Simulation Parameters
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot
                    color={
                      trafficModelInsertStatus === "COMPLETED"
                        ? "primary"
                        : "grey"
                    }
                  />
                </TimelineSeparator>
                <TimelineContent>Done</TimelineContent>
              </TimelineItem>
            </Timeline>
            {!uploadInProgress && (
              <Button
                variant="contained"
                onClick={() => {
                  onCloseButtonClick();
                }}
              >
                Close
              </Button>
            )}
          </Stack>
        </Box>
      </Modal>
    </>
  );
}

export default UploadControls;
