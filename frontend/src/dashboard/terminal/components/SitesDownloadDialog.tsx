import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";

import { SiteListData } from "dashboard/hub/pages/components/SiteListTable";
import { DownloadIds } from "dashboard/hub/HubPage";
import { downloadEvGrowthSiteScenarios } from "dashboard/hub/pages/components/download";

interface SiteDownloadDialogProps {
  open: boolean;
  handleClose: () => void;
  selectedSiteIds: number[];
  siteList: SiteListData[];
  downloadIds: DownloadIds[];
  setDownloadIds: React.Dispatch<React.SetStateAction<DownloadIds[]>>;
}

interface ExtendedEvGrowthScenario {
  id: string;
  siteId: number;
  siteName: string;
  scenarioId: number;
  name: string;
  location: string;
}

export default function SiteDownloadDialog({
  open,
  handleClose,
  selectedSiteIds,
  siteList,
  downloadIds,
  setDownloadIds,
}: SiteDownloadDialogProps) {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [rowData, setRowData] = useState<ExtendedEvGrowthScenario[]>([]);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<GridRowId[]>(
    []
  );

  const updatedRowData = rowData.map((row) => ({
    ...row,
    location: row.location.charAt(0).toUpperCase() + row.location.slice(1),
  }));

  const [snackbar, setSnackbar] = useState<
    { type: AlertColor; message: string; duration: number } | undefined
  >();

  useEffect(() => {
    const scenariosWithSiteInfo: Array<ExtendedEvGrowthScenario> = [];

    let siteListArray: SiteListData[];

    if (typeof siteList === "object") {
      siteListArray = Object.values(siteList);
    } else {
      siteListArray = siteList;
    }
    siteListArray?.forEach((site: any) => {
      if (selectedSiteIds.includes(site.id)) {
        site.evGrowthScenarios.forEach((scenario: any) => {
          const compositeId = `${site.id}-${scenario.id}`;
          scenariosWithSiteInfo.push({
            id: compositeId,
            siteId: site.id,
            siteName: site.name,
            scenarioId: scenario.id,
            name: scenario.name,
            location: scenario.location,
          });
        });
      }
    });

    setRowData(scenariosWithSiteInfo);
  }, [selectedSiteIds, siteList]);

  const columns: GridColDef[] = [
    { field: "siteName", headerName: "Site", width: 180 },
    {
      field: "name",
      headerName: "EV Growth Scenario",
      width: 390,
    },
    {
      field: "location",
      headerName: "Location",
      width: 390,
    },
  ];

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await downloadEvGrowthSiteScenarios(downloadIds);
      setSnackbar({
        type: "success",
        message: `Successfully downloaded ${downloadIds.length} configurations!`,
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
            <Typography variant="h2">Download EV Growth Scenarios</Typography>
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
                rows={updatedRowData}
                columns={columns}
                autoHeight
                checkboxSelection
                disableSelectionOnClick
                selectionModel={selectedScenarioIds}
                onSelectionModelChange={(newSelection) => {
                  setSelectedScenarioIds(newSelection);
                  const newDownloadIds = newSelection.map((compositeId) => {
                    const [siteId, evGrowthScenarioId] = String(compositeId)
                      .split("-")
                      .map(Number);
                    return { siteId, evGrowthScenarioId };
                  });
                  setDownloadIds(newDownloadIds);
                }}
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
