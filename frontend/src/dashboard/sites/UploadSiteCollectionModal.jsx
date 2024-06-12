import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Stack,
  Typography,
  FormControl,
  TextField,
  Input,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth0 } from "@auth0/auth0-react";
import { uploadFile } from "api/s3";
import { processSitesFile } from "api/sites";
const UPLOAD_SITE_API_URL = `${process.env.REACT_APP_API_GATEWAY_URL}/site-upload`;

/**
 * Returns a new object from the old one with the properties lowercased.
 */
function objectKeysToLowerCase(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])
  );
}

/**
 * Assigns site.lat and site.lng if similar properties are present on the object.
 * It will also convert all property names to lowercase.
 * @param {object} site the site to standardize
 * @returns a new site object with site.lat and site.lng
 */
function standardizeSiteProperties(site) {
  site = objectKeysToLowerCase(site);
  site.lng = site.lng || site.long || site.longitude;
  site.lat = site.lat || site.latitude;
  return site;
}

async function validateSitesFile(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const wsJson = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );

  // make object keys lowercase for consistency
  const sitesData = wsJson.map((obj) => standardizeSiteProperties(obj));

  // make sure we have data
  if (sitesData.length === 0) {
    return {
      success: false,
      message: `There are no data rows in the provided file`,
    };
  }

  for (let i = 0; i < sitesData.length; i++) {
    const site = sitesData[i];
    const hasName = site.name && site.name.toString().length > 0;
    if (!hasName) {
      return {
        success: false,
        message: `Error on row ${i + 1}: every site must have a name`,
      };
    }
    const isValidLat = site.lat >= -90 && site.lat <= 90;
    if (!isValidLat) {
      return {
        success: false,
        message: `Error on row ${
          i + 1
        }: lat must be between -90 and 90, inclusive`,
      };
    }
    const isValidLng = site.lng >= -180 && site.lng <= 180;
    if (!isValidLng) {
      return {
        success: false,
        message: `Error on row ${
          i + 1
        }: lng must be between -180 and 180, inclusive`,
      };
    }
    const scoreIsNumber = typeof site.score === "number";
    if (!scoreIsNumber) {
      return {
        success: false,
        message: `Error on row ${i + 1}: score must be a number`,
      };
    }
  }
  return {
    success: true,
  };
}

export default function UploadSiteCollectionModal(props) {
  const [newSiteCollectionName, setNewSiteCollectionName] = useState("");
  const [newSiteCollectionFile, setNewSiteCollectionFile] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadingNewSiteCollection, setUploadingNewSiteCollection] =
    useState(false);
  const [formatPreviewTab, setFormatPreviewTab] = useState("csv");

  useEffect(() => {
    (async () => {
      if (!newSiteCollectionFile) return;
      const validation = await validateSitesFile(newSiteCollectionFile);
      setShowErrorMessage(validation.success);
      setErrorMessage(validation.message);
    })();
  }, [newSiteCollectionFile]);

  const { getAccessTokenSilently } = useAuth0();

  const handleUploadButtonClick = async () => {
    const apiToken = await getAccessTokenSilently();
    setUploadingNewSiteCollection(true);
    try {
      const fileName = await uploadFile(
        `${UPLOAD_SITE_API_URL}/initialize`,
        `${UPLOAD_SITE_API_URL}/complete`,
        newSiteCollectionFile,
        apiToken
      );
      await processSitesFile(
        `${UPLOAD_SITE_API_URL}/process-file`,
        newSiteCollectionName,
        fileName,
        apiToken
      );
      props.refreshSiteCollections();
      props.onClose();
    } catch (error) {
      setShowErrorMessage(false);
      setErrorMessage(
        "An unexpected error occurred. If this persists, please contact support."
      );
    }
    setUploadingNewSiteCollection(false);
  };

  const [showExtraData, setShowExtraData] = useState(false);
  const exampleFileTitle = (
    <Stack direction={"row"} alignItems={"center"} spacing={2}>
      <Typography fontWeight={"bold"}>Example File</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={showExtraData}
              onChange={(event) => setShowExtraData(event.target.checked)}
            />
          }
          label="Show optional data"
        />
      </FormGroup>
    </Stack>
  );

  const exampleData = [
    {
      // first row of data might as well be the key
      name: "name",
      lat: "lat",
      lng: "lng",
      score: "score",
      address: "address",
    },
    {
      name: "Parking Lot",
      lat: 30,
      lng: -100,
      score: 3,
      address: "123 Main St.",
    },
    {
      name: "Transit Station",
      lat: 60,
      lng: 10,
      score: 2.5,
      address: "1600 Pennsylvania Ave.",
    },
    {
      name: "Library",
      lat: -15,
      lng: -120,
      score: 10,
      address: "25 Grenfell St.",
    },
  ];

  return (
    <Modal {...props}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: "8px",
          maxHeight: "80%",
          minWidth: "30%",
          maxWidth: "500px",
          overflowY: "scroll",
        }}
      >
        <Stack sx={{ height: "100%", padding: "1em" }}>
          <Typography variant="controlTitle">Add a new site list</Typography>
          <Stack spacing={2}>
            <TextField
              label={"Site List Name"}
              value={newSiteCollectionName}
              onChange={(event) => setNewSiteCollectionName(event.target.value)}
              required
              helperText={"* required"}
            />
            <Stack>
              <FormControl>
                <Input
                  id="site-collection-file"
                  type="file"
                  inputProps={{ accept: ".csv,.geojson,.xlsx" }}
                  onChange={(event) =>
                    setNewSiteCollectionFile(Array.from(event.target.files)[0])
                  }
                />
              </FormControl>
              <Accordion disableGutters={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>See File Format Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    <Alert severity="warning">
                      Any sites outside the charging region will not be
                      displayed.
                    </Alert>
                    <List>
                      <Typography fontWeight={"bold"}>
                        For all sites and file formats:
                      </Typography>
                      <ListItem sx={{ display: "list-item" }}>
                        <Typography>
                          <Typography inline variant="inlineCode">
                            name
                          </Typography>
                          is required.
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ display: "list-item" }}>
                        <Typography>
                          <Typography inline variant="inlineCode">
                            lat
                          </Typography>
                          must be between -90 and 90, inclusive.
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ display: "list-item" }}>
                        <Typography>
                          <Typography inline variant="inlineCode">
                            lng
                          </Typography>
                          must be between -180 and 180, inclusive.
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ display: "list-item" }}>
                        <Typography>
                          <Typography inline variant="inlineCode">
                            score
                          </Typography>
                          must be a number.
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ display: "list-item" }}>
                        <Typography>
                          Multiple additional columns are optional. The values
                          will be viewable in site pop-ups, but are not
                          considered in site evaluation.
                        </Typography>
                      </ListItem>
                    </List>
                  </Stack>
                  <TabContext value={formatPreviewTab}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <TabList
                        onChange={(event, newValue) =>
                          setFormatPreviewTab(newValue)
                        }
                        centered
                        aria-label="lab API tabs example"
                      >
                        <Tab label="CSV" value="csv" />
                        <Tab label="Excel" value="excel" />
                      </TabList>
                    </Box>
                    <TabPanel value="csv">
                      {exampleFileTitle}
                      <Box
                        sx={{
                          backgroundColor: "#eee",
                          fontFamily: "monospace",
                          margin: "1em",
                          padding: "1em",
                        }}
                      >
                        <pre>
                          {exampleData.map((site) => {
                            const values = [];
                            values.push(site.name);
                            values.push(site.lat);
                            values.push(site.lng);
                            values.push(site.score);
                            if (showExtraData) values.push(site.address);
                            return values.toString() + "\n";
                          })}
                        </pre>
                      </Box>
                    </TabPanel>
                    <TabPanel value="excel">
                      <List>
                        <ListItem sx={{ display: "list-item" }}>
                          <Typography>
                            The first cell of the table must be A1.
                          </Typography>
                        </ListItem>
                        <ListItem sx={{ display: "list-item" }}>
                          <Typography>The table must be on Sheet1.</Typography>
                        </ListItem>
                      </List>
                      {exampleFileTitle}
                      <Box
                        sx={{
                          fontFamily: "monospace",
                          margin: "1em",
                          padding: "1em",
                          backgroundColor: "#eee",
                        }}
                      >
                        <Table size="small" aria-label="a dense table">
                          <TableBody>
                            {exampleData.map((site) => {
                              return (
                                <TableRow key={site.name}>
                                  <TableCell>{site.name}</TableCell>
                                  <TableCell align="right">
                                    {site.lat}
                                  </TableCell>
                                  <TableCell align="right">
                                    {site.lng}
                                  </TableCell>
                                  <TableCell align="right">
                                    {site.score}
                                  </TableCell>
                                  {showExtraData && (
                                    <TableCell align="right">
                                      {site.address}
                                    </TableCell>
                                  )}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Box>
                    </TabPanel>
                  </TabContext>
                </AccordionDetails>
              </Accordion>
            </Stack>
            {!showErrorMessage && newSiteCollectionFile && (
              <Alert severity="error">
                <AlertTitle>Validation Error</AlertTitle>
                {errorMessage}
              </Alert>
            )}
            <LoadingButton
              variant="contained"
              disabled={
                !showErrorMessage ||
                newSiteCollectionName.length === 0 ||
                newSiteCollectionFile === null
              }
              onClick={handleUploadButtonClick}
              loading={uploadingNewSiteCollection}
            >
              Upload
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
