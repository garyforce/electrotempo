import {
  Alert,
  AlertColor,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import { LoadingButton } from "@mui/lab";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

import { Terminal } from "types/terminal";
import { downloadTerminalScenarios } from "../download";

interface SelectDownloadDialogProps {
  open: boolean;
  handleClose: () => void;
  selectedTerminalIds: number[];
  terminals: Terminal[];
}

export default function SelectDownloadDialog({
  open,
  handleClose,
  selectedTerminalIds,
  terminals,
}: SelectDownloadDialogProps) {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [rowData, setRowData] = useState<
    {
      id: number;
      terminalName: string;
      facilityName: string;
      scenarioName: string;
    }[]
  >([]);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<GridRowId[]>(
    []
  );
  const [snackbar, setSnackbar] = useState<
    { type: AlertColor; message: string; duration: number } | undefined
  >();

  useEffect(() => {
    const selectedTerminals = terminals.filter((terminal) =>
      selectedTerminalIds.includes(terminal.id)
    );
    const rowData = selectedTerminals.reduce((rowData: any[], terminal) => {
      terminal.terminalFacilities.forEach((facility) => {
        facility.terminalScenarios.forEach((scenario) => {
          if (scenario.scenarioVehicles.length) {
            rowData.push({
              id: scenario.id,
              terminalName: scenario.property.name,
              facilityName: scenario.facility.name,
              scenarioName: scenario.name,
            });
          }
        });
      });
      return rowData;
    }, []);
    setRowData(rowData);
  }, [selectedTerminalIds, terminals]);

  const columns: GridColDef[] = [
    { field: "terminalName", headerName: "Terminal", width: 260 },
    { field: "facilityName", headerName: "Cost Center", width: 260 },
    { field: "scenarioName", headerName: "Configuration", width: 260 },
  ];

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await downloadTerminalScenarios(selectedScenarioIds as number[]);
      setSnackbar({
        type: "success",
        message: `Successfully downloaded ${selectedScenarioIds.length} configurations!`,
        duration: 2000,
      });
      setSelectedScenarioIds([]);
    } catch (error: any) {
      setSnackbar({
        type: "error",
        message: error.message,
        duration: 6000,
      });
    }

    setDownloading(false);
  };

  const handleSnackbarClose = () => {
    if (snackbar!.type === "success") {
      handleClose();
    }
    setSnackbar(undefined);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => handleClose()}
        scroll="paper"
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle>
          <Stack direction="row" justifyContent={"space-between"}>
            <Typography variant="h2">Download Configurations</Typography>
          </Stack>
        </DialogTitle>
        <IconButton
          aria-label="close"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          onClick={() => handleClose()}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ marginTop: "0.5em" }}>
            <Box sx={{ height: "100%", width: "100%" }}>
              <DataGrid
                rows={rowData}
                columns={columns}
                autoHeight
                checkboxSelection
                disableSelectionOnClick
                selectionModel={selectedScenarioIds}
                onSelectionModelChange={(selection) =>
                  setSelectedScenarioIds(selection)
                }
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={handleDownload}
            loading={downloading}
            disabled={downloading || !selectedScenarioIds.length}
          >
            Download
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {snackbar && (
        <Snackbar
          open={!!snackbar}
          autoHideDuration={snackbar.duration}
          anchorOrigin={{
            horizontal: "right",
            vertical: "bottom",
          }}
          onClose={() => handleSnackbarClose()}
        >
          <Alert severity={snackbar.type}>{snackbar.message}</Alert>
        </Snackbar>
      )}
    </>
  );
}
