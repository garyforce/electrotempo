import React, { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Divider,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
  AlertTitle,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import GetAppIcon from "@mui/icons-material/GetApp";
import { confirmDuplicate, deleteFleetData } from "api/hub/fleetData";
import { fleetsDataType } from "api/hub/fleetData";

import ConfirmUpload from "./ConfirmUpload";

type UploadDialogProps = {
  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
  siteId: number;
  refetchScenarioData: () => void;
  fleetsData: fleetsDataType;
  refetchFleetsData: () => void;
};

type tableDataType = {
  id?: number;
  name: string;
  truckCount: number;
  tractorCount: number;
};
const UploadDialog = ({
  uploadDialogOpen,
  setUploadDialogOpen,
  siteId,
  refetchScenarioData,
  fleetsData,
  refetchFleetsData,
}: UploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  const [snackbarType, setSnackBarType] = useState<
    "success" | "info" | "error" | "warning"
  >("success");
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const handleClose = () => {
    setUploadDialogOpen(false);
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files === null ? null : event.target.files[0]);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleConfirm = async () => {
    await onUpload();
    const formData = new FormData();
    if (!selectedFile) {
      throw new Error("No file selected");
    }
    formData.append("upload-arrivals", selectedFile);
    const res: any = await confirmDuplicate(siteId, formData, 1);
    setAlertOpen(false);
    setSelectedFile(null);
  };
  const onUpload = async () => {
    const formData = new FormData();
    try {
      if (!selectedFile) {
        throw new Error("No file selected");
      }
      formData.append("upload-arrivals", selectedFile);
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/hub/site/${siteId}/arrivals`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${errorData.error}`);
      }
      setSnackbarMessage("Fleet data uploaded successfully, 0 errors detected");
      setSnackBarType("success");
    } catch (error: any) {
      console.log("Upload Error:", error);
      const errorMessage = error.message || "An unknown error occurred";
      setSnackbarMessage(errorMessage);
      setSnackBarType("error");
    } finally {
      setShowSnackbar(true);
      setUploadDialogOpen(false);
      refetchFleetsData();
      refetchScenarioData();
    }
  };

  const tableData: tableDataType[] = useMemo(() => {
    const fleetNames = Object.keys(fleetsData);
    const tableData: tableDataType[] = [];
    fleetNames.forEach((fleetName, index) => {
      const fleets = fleetsData[fleetName];
      tableData.push({
        id: index + 1,
        name: fleetName,
        truckCount:
          fleets.filter((fleet) => fleet.vehicle_type_id === 2)[0]
            ?.num_arrivals ?? 0,
        tractorCount:
          fleets.filter((fleet) => fleet.vehicle_type_id === 3)[0]
            ?.num_arrivals ?? 0,
      });
    });
    return tableData;
  }, [fleetsData]);

  const onClickRemove = async (fleetName: string) => {
    const rowData = fleetsData[fleetName];
    const ids = [];
    const truckId =
      rowData.filter((fleet) => fleet.vehicle_type_id === 2)[0]?.id ?? 0;
    const tractorId =
      rowData.filter((fleet) => fleet.vehicle_type_id === 3)[0]?.id ?? 0;
    truckId !== 0 && ids.push(truckId);
    tractorId !== 0 && ids.push(tractorId);
    deleteFleetData(siteId, ids)
      .then((res) => {
        refetchFleetsData();
        refetchScenarioData();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onUploadClick = async () => {
    const formData = new FormData();
    try {
      if (!selectedFile) {
        throw new Error("No file selected");
      }
      formData.append("upload-arrivals", selectedFile);
      const res: any = await confirmDuplicate(siteId, formData, 0);
      if (res.overrides.length) {
        setAlertOpen(true);
      } else {
        await handleConfirm();
        setAlertOpen(false);
      }
    } catch (err: any) {
      console.log("Verificaion Error:", err);
    }
  };
  return (
    <div>
      <Dialog
        open={uploadDialogOpen}
        onClose={handleClose}
        sx={{ padding: 20, paddingBottom: 5 }}
      >
        <DialogTitle>Subscription/Private Fleets</DialogTitle>
        <Box margin="15px">
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Fleet No.</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Truck Count</TableCell>
                <TableCell align="center">Tractor-Trailer count</TableCell>
                <TableCell align="center" sx={{ width: 50 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    key={row.id}
                  >
                    {row.id}
                  </TableCell>
                  <TableCell align="center" key={`name${row.id}`}>
                    {row.name}
                  </TableCell>
                  <TableCell align="center" key={`truckCount${row.id}`}>
                    {row.truckCount}
                  </TableCell>
                  <TableCell align="center" key={`tractorCount${row.id}`}>
                    {row.tractorCount}
                  </TableCell>
                  <TableCell
                    align="center"
                    onClick={() => onClickRemove(row.name)}
                  >
                    <RemoveCircleOutlineIcon color="error" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider
          orientation="horizontal"
          sx={{
            marginLeft: "15px",
            marginRight: "15px",
            marginTop: "10px",
            background: "#0000ff",
          }}
        />
        <DialogContent sx={{ paddingBottom: 0, overflow: "hidden" }}>
          Download the Sample Fleets CSV file:
          <Button
            startIcon={<GetAppIcon />}
            href="/Sample_fleet_upload.csv"
            target="_blank"
            download
          ></Button>
        </DialogContent>
        <DialogContent sx={{ paddingBottom: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            Upload Fleets CSV file
            <FolderZipIcon
              sx={{ marginRight: "15px", marginLeft: "15px" }}
              color="error"
            />
            <input
              type="file"
              onChange={handleFileSelect}
              accept="text/csv"
              formEncType="multipart/form-data"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={onUploadClick}
            disabled={!selectedFile}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity={snackbarType}>
          <AlertTitle>
            {snackbarType[0].toUpperCase() + snackbarType.slice(1)}
          </AlertTitle>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <ConfirmUpload
        alertOpen={alertOpen}
        handleAlertClose={handleAlertClose}
        handleConfirm={handleConfirm}
      />
    </div>
  );
};

export default UploadDialog;
