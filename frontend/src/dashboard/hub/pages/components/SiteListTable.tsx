/* eslint-disable import/no-anonymous-default-export */
import { Visibility } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { usePermissions } from "dashboard/PermissionContext";
import React, { useState } from "react";
import { EvGrowthScenario } from "types/site";
import { ScenarioDropdown } from "./ScenarioDropdown";
import StickyBottomBox from "dashboard/controls/StickyBottomBox";
import { Location } from "types/location";

export interface SiteListData {
  id: number;
  name: string;
  evGrowthScenarios: EvGrowthScenario[];
  currentEvGrowthScenarioId: number;
}

interface SiteListTableProps {
  siteList: SiteListData[];
  handleSiteListScenariosChange: (
    siteId: number,
    evGrowthScenarioId: number
  ) => void;
  setSelectedSiteIds: (ids: number[]) => void;
  selectedSiteIds: number[];
  navigateToScenario: (siteId: number, evGrowthScenarioId: number) => void;
  handleFromHubToTimeline: () => void;
  setOpenDownloadDialog: React.Dispatch<React.SetStateAction<boolean>>;
  locations: Location[];
}

export default ({
  siteList,
  handleSiteListScenariosChange,
  setSelectedSiteIds,
  selectedSiteIds,
  navigateToScenario,
  handleFromHubToTimeline,
  setOpenDownloadDialog,
  locations,
}: SiteListTableProps) => {
  const [showModal, setShowModal] = useState(false);
  const [rowPerPage, setRowPerPage] = useState<number>(15);

  const permissions = usePermissions();

  const groupedByLocation = siteList.reduce<Record<string, any[]>>(
    (acc, site) => {
      const locationName = site.evGrowthScenarios?.find(
        (scenario) => scenario?.location !== undefined
      )?.location;
      if (locationName) {
        if (!acc[locationName]) {
          acc[locationName] = [];
        }
        acc[locationName].push(site);
      }

      return acc;
    },
    {}
  );

  const addScenario = () => {
    if (permissions.includes("read:timeline_tab")) handleFromHubToTimeline();
    else {
      setShowModal(true);
    }
  };

  const checkSitesForDownload = (siteId: number) => {
    const ids = [...selectedSiteIds];
    if (ids.includes(siteId)) {
      ids.splice(ids.indexOf(siteId), 1);
    } else ids.push(siteId);
    setSelectedSiteIds(ids);
  };

  const getColumns = (locationName: any) => [
    {
      field: " ",
      header: " ",
      width: 40,
      sortable: false,
      renderCell: (params: any) => (
        <Checkbox
          color="default"
          sx={{ minWidth: "30px" }}
          checked={selectedSiteIds.includes(params.row.id)}
          onClick={() => checkSitesForDownload(params.row.id)}
        />
      ),
    },
    { field: "name", headerName: "Site", width: 175 },
    {
      field: "evGrowthScenarios",
      headerName: "EV Adoption Scenario",
      width: 220,
      cellClassName: "scenario--cell",
      renderCell: (params: any) => (
        <ScenarioDropdown
          evGrowthScenarios={params.row.evGrowthScenarios}
          locationName={locationName}
          addScenario={addScenario}
          handleScenarioChange={(currentEvGrowthScenarioId) =>
            handleSiteListScenariosChange(
              params.row.id,
              currentEvGrowthScenarioId
            )
          }
          currentEvGrowthScenarioId={params.row.currentEvGrowthScenarioId}
          locations={locations}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "View",
      width: 80,
      cellClassName: "actions",
      getActions: (params: any) => {
        return [
          <GridActionsCellItem
            icon={
              <Tooltip title="View/Edit">
                <Visibility />
              </Tooltip>
            }
            label="Edit"
            onClick={() =>
              navigateToScenario(
                params.row.id,
                params.row.currentEvGrowthScenarioId
              )
            }
            disabled={!params.row.evGrowthScenarios.length}
          />,
        ];
      },
    },
  ];

  return (
    <>
      <Dialog
        open={showModal}
        onClose={setShowModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`This feature has been disabled.`}
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setShowModal(false)}
            color="error"
            variant="contained"
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Stack sx={{ height: "80vh" }}>
        <div style={{ flexGrow: 1, overflow: "auto", marginBottom: "3rem" }}>
          {Object.entries(groupedByLocation).map(
            ([locationName, sites], index) => (
              <div
                key={index}
                style={{ height: "320px", marginBottom: "3rem" }}
              >
                <Typography
                  variant="h6"
                  textAlign="center"
                  sx={{ mt: 1, mb: 1 }}
                >
                  {locationName.toUpperCase()}
                </Typography>
                <DataGrid
                  rows={sites}
                  columns={getColumns(locationName)}
                  hideFooterSelectedRowCount={true}
                  rowsPerPageOptions={[5, 10, 15, 20]}
                  pageSize={rowPerPage}
                  onPageSizeChange={(newPageSize) => setRowPerPage(newPageSize)}
                  selectionModel={[]}
                  sx={{
                    "& .MuiDataGrid-columnHeadersInner .MuiDataGrid-columnHeader:last-child":
                      {
                        "& .MuiDataGrid-columnSeparator": {
                          display: "none",
                        },
                      },
                    "& .scenario--cell": {
                      padding: 0,
                    },
                    mb: 3,
                  }}
                />
              </div>
            )
          )}
        </div>

        <StickyBottomBox>
          <Button
            variant="contained"
            onClick={() => setOpenDownloadDialog(true)}
            disabled={!selectedSiteIds.length}
            style={{ width: "100%" }}
          >
            Download Site Data
          </Button>
        </StickyBottomBox>
      </Stack>
    </>
  );
};
