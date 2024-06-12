/* eslint-disable import/no-anonymous-default-export */
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Delete, Visibility } from "@mui/icons-material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import {
  Terminal,
  TerminalFacility,
  TerminalScenario,
  TerminalTableData,
} from "../../../types/terminal";
import { deleteTerminalScenario } from "api/terminal/scenarios";
import { usePermissions } from "dashboard/PermissionContext";

interface ScenarioDropdownProps {
  rowId: number;
  scenarios: TerminalScenario[];
  scenarioId: number;
  onScenarioChange: (value: number) => void;
  isTutorial: Boolean;
  tutorialStep: number;
}

export const ScenarioDropdown = (props: ScenarioDropdownProps) => {
  const {
    rowId,
    scenarios,
    scenarioId,
    onScenarioChange,
    isTutorial,
    tutorialStep,
  } = props;

  const [open, setOpen] = useState<boolean>(false);
  // finding first terminal with at least one scenario
  const isFirstTerminal = rowId === 1;

  useEffect(() => {
    if (isTutorial && tutorialStep === 1 && isFirstTerminal) {
      // only opening one dropdown in the tutorial
      setOpen(true);
    } else if (isTutorial && tutorialStep !== 1) {
      setOpen(false);
    }
  }, [isTutorial, tutorialStep]);

  return (
    <Select
      value={scenarioId}
      className="sites-table"
      onChange={(e) => onScenarioChange(Number(e.target.value))}
      open={open}
      onClick={() => setOpen(!open)}
      displayEmpty
      sx={{
        width: "100%",
        height: "100%",
        ".MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiSelect-select": {
          paddingLeft: "0px!important",
          paddingRight: "20px !important",
          fontSize: "0.875rem",
        },
        ".MuiSvgIcon-root": { right: 0 },
      }}
    >
      {scenarios.length > 0 ? (
        scenarios.map((scenario, index) => (
          <MenuItem key={index} value={scenario.id} disabled={!scenario.active}>
            {scenario.name}
            {!scenario.active && scenario.status
              ? ` (${scenario.status.status.toLowerCase()})`
              : ""}
          </MenuItem>
        ))
      ) : (
        <MenuItem value="" disabled>
          No configuration records
        </MenuItem>
      )}
    </Select>
  );
};

interface CostCenterDropdownProps {
  facilities: TerminalFacility[];
  facilityId: number;
  onCenterChange: (value: number) => void;
}

export const CostCenterDropdown = (props: CostCenterDropdownProps) => {
  const { facilities, facilityId, onCenterChange } = props;

  const [selectedFacilityId, setSelectedFacilityId] = useState<number | string>(
    facilityId
  );

  const handleChange = (event: SelectChangeEvent<number | string>) => {
    const newValue = event.target.value as number;
    setSelectedFacilityId(newValue);
    onCenterChange(newValue);
  };

  return (
    <Select
      value={selectedFacilityId}
      onChange={handleChange}
      displayEmpty
      sx={{
        width: "100%",
        height: "100%",
        ".MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiSelect-select": {
          paddingLeft: "0px!important",
          paddingRight: "20px !important",
          fontSize: "0.875rem",
        },
        ".MuiSvgIcon-root": { right: 0 },
        padding: 0,
      }}
    >
      {facilities.length > 0 ? (
        facilities.map((facility, index) => (
          <MenuItem key={index} value={facility.id}>
            {facility.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem value="" disabled>
          No Cost Center records
        </MenuItem>
      )}
    </Select>
  );
};

interface TerminalListTableProps {
  terminals: Terminal[];
  navigateToScenario: (
    terminalId: number,
    facilityId: number,
    scenarioId: number
  ) => void;
  setSelectedTerminalIds: (ids: number[]) => void;
  selectedTerminalIds: number[];
  setSelectedTerminalIdForPopup: React.Dispatch<React.SetStateAction<number>>;
  setSelectedFacilityIdForPopup: React.Dispatch<React.SetStateAction<number>>;
  setSelectedTerminalNameForPopup: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFacilityNameForPopup: React.Dispatch<React.SetStateAction<string>>;
  isTutorial: Boolean;
  tutorialStep: number;
  refetchTerminal: () => void;
}

type DeleteConfigType = {
  name: string;
  ids: { terminalId: number; facilityId: number; scenarioId: number };
};
export default function TerminalListTable({
  terminals,
  navigateToScenario,
  setSelectedTerminalIds,
  selectedTerminalIds,
  setSelectedTerminalIdForPopup,
  setSelectedFacilityIdForPopup,
  setSelectedTerminalNameForPopup,
  setSelectedFacilityNameForPopup,
  isTutorial,
  tutorialStep,
  refetchTerminal,
}: TerminalListTableProps) {
  const [rowData, setRowData] = useState<{
    [terminalId: number]: TerminalTableData;
  }>({});
  const [rowPerPage, setRowPerPage] = useState<number>(15);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<DeleteConfigType>({
    name: "",
    ids: { terminalId: 0, facilityId: 0, scenarioId: 0 },
  });

  const permissions = usePermissions();

  const canCreateConfigurations = useMemo(() => {
    return permissions.includes("write:terminal_configurations");
  }, [permissions]);

  useEffect(() => {
    const data = terminals.reduce(
      (tableData: { [terminalId: number]: TerminalTableData }, terminal) => {
        tableData[terminal.id] = {
          id: terminal.id,
          name: terminal.name,
          terminalId: terminal.id,
          facilityName:
            terminal.terminalFacilities.find(
              (facility) => facility.name?.toUpperCase() === "ALL"
            )?.name || terminal.terminalFacilities[0]?.name,
          facilityId:
            terminal.terminalFacilities.find(
              (facility) => facility.name?.toUpperCase() === "ALL"
            )?.id || terminal.terminalFacilities[0]?.id,
          scenarioId: terminal.terminalFacilities[0]?.terminalScenarios[0]?.id,
        };
        return tableData;
      },
      {}
    );
    setRowData(data);
  }, [terminals]);

  const getTerminalFacilities = (terminalId: number) => {
    return terminals.filter((terminal) => terminal.id === terminalId)[0]
      .terminalFacilities;
  };

  const getTerminalScenarios = (terminalId: number, facilityId: number) => {
    return terminals
      .filter((terminal) => terminal.id === terminalId)[0]
      .terminalFacilities.filter((facility) => facility.id === facilityId)[0]
      .terminalScenarios;
  };

  const setRowDataFromId = useCallback(
    (
      terminalId: number,
      facilityId: number = 0,
      facilityName: string = "",
      scenarioId: number = 0
    ) => {
      const data = { ...rowData };
      data[terminalId] = {
        ...data[terminalId],
        facilityId,
        facilityName,
        scenarioId,
      };
      setRowData(data);
    },
    [rowData]
  );

  const onCostCenterChange = (terminalId: number, facilityId: number) => {
    const facilityName = getTerminalFacilities(terminalId).filter(
      (facility) => facility.id === facilityId
    )[0].name;
    setRowDataFromId(terminalId, facilityId, facilityName);
  };

  const onScenarioChange = (
    terminalId: number,
    facilityId: number,
    facilityName: string,
    newValue: number
  ) => {
    setRowDataFromId(terminalId, facilityId, facilityName, newValue);
  };

  const goToScenario = (params: any) => {
    navigateToScenario(
      params.row.terminalId,
      params.row.facilityId,
      params.row.scenarioId
    );
  };

  const checkTerminalForDownload = (terminalId: number) => {
    const ids = [...selectedTerminalIds];
    if (ids.includes(terminalId)) {
      ids.splice(ids.indexOf(terminalId), 1);
    } else ids.push(terminalId);
    setSelectedTerminalIds(ids);
  };

  const deleteConfiguration = async () => {
    deleteTerminalScenario(
      deleteConfig.ids.terminalId,
      deleteConfig.ids.facilityId,
      deleteConfig.ids.scenarioId
    )
      .then((response) => {
        refetchTerminal();
        setShowDeleteModal(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const deleteModalShow = (params: any) => {
    setDeleteConfig({
      name: getTerminalScenarios(
        params.row.terminalId,
        params.row.facilityId
      ).filter((config) => config.id === params.row.scenarioId)[0].name,
      ids: {
        terminalId: params.row.terminalId,
        facilityId: params.row.facilityId,
        scenarioId: params.row.scenarioId,
      },
    });
    setShowDeleteModal(true);
  };

  const columns = [
    {
      field: " ",
      header: " ",
      width: 40,
      sortable: false,
      renderCell: (params: any) => (
        <Checkbox
          color="default"
          sx={{ minWidth: "30px" }}
          checked={selectedTerminalIds.includes(params.row.terminalId)}
          onClick={() => checkTerminalForDownload(params.row.terminalId)}
        />
      ),
    },
    { field: "name", headerName: "Terminal", width: 120 },
    {
      field: "costCenters",
      headerName: "Cost Center",
      width: 130,
      sortable: false,
      renderCell: (params: any) => (
        <CostCenterDropdown
          facilities={getTerminalFacilities(params.row.terminalId)}
          facilityId={params.row.facilityId}
          onCenterChange={(selectedFacilityId: number) =>
            onCostCenterChange(params.row.terminalId, selectedFacilityId)
          }
        />
      ),
    },
    {
      field: "scenario",
      headerName: "Configuration",
      width: 130,
      sortable: false,
      renderCell: (params: any) => (
        <ScenarioDropdown
          rowId={params.row.id}
          scenarios={getTerminalScenarios(
            params.row.terminalId,
            params.row.facilityId
          )}
          scenarioId={params.row.scenarioId}
          onScenarioChange={(newValue: number) =>
            onScenarioChange(
              params.row.terminalId,
              params.row.facilityId,
              params.row.facilityName,
              newValue
            )
          }
          isTutorial={isTutorial}
          tutorialStep={tutorialStep}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      cellClassName: "actions",
      getActions: (params: any) => {
        return [
          <Tooltip
            title={
              canCreateConfigurations
                ? "Add new configuration"
                : "This action is disabled for this trial account"
            }
          >
            <span>
              <GridActionsCellItem
                icon={<AddBoxIcon />}
                label="Add"
                onClick={() => {
                  setSelectedTerminalIdForPopup(params.row.terminalId);
                  setSelectedFacilityIdForPopup(params.row.facilityId);
                  setSelectedTerminalNameForPopup(params.row.name);
                  setSelectedFacilityNameForPopup(params.row.facilityName);
                }}
                disabled={!canCreateConfigurations}
              />
            </span>
          </Tooltip>,
          <GridActionsCellItem
            icon={
              <Tooltip title="View configuration">
                <Visibility />
              </Tooltip>
            }
            label="View"
            className="view-action"
            onClick={() => goToScenario(params)}
            disabled={
              getTerminalScenarios(params.row.terminalId, params.row.facilityId)
                .length === 0
            }
          />,
          <GridActionsCellItem
            icon={
              <Tooltip title="Delete configuration">
                <Delete />
              </Tooltip>
            }
            label="View"
            onClick={() => deleteModalShow(params)}
            disabled={
              getTerminalScenarios(params.row.terminalId, params.row.facilityId)
                .length === 0
            }
          />,
        ];
      },
    },
  ];
  return (
    <>
      <DataGrid
        rows={Object.values(rowData)}
        columns={columns}
        hideFooterSelectedRowCount={true}
        rowsPerPageOptions={[5, 10, 15, 20]}
        pageSize={rowPerPage}
        onPageSizeChange={(newPageSize) => setRowPerPage(newPageSize)}
        selectionModel={[]}
        sx={{ "& .scenario--cell": { padding: 0 } }}
        disableColumnMenu
      />
      <Dialog
        open={showDeleteModal}
        onClose={setShowDeleteModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure you want to delete ${deleteConfig.name}?`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => deleteConfiguration()} color="error" autoFocus>
            DELETE
          </Button>
          <Button onClick={() => setShowDeleteModal(false)} color="inherit">
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
