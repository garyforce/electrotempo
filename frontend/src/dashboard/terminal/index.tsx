import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTour, StepType } from "@reactour/tour";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { Terminal, TerminalScenario } from "types/terminal";
import { terminalTourSteps } from "./components/terminalTourStep";
import { useTerminals } from "api/terminal/terminals";
import AddScenarioDialog from "./components/AddScenarioDialog";
import StickyBottomBox from "dashboard/controls/StickyBottomBox";
import TerminalListTable from "./components/TerminalListTable";
import TerminalMap from "./map/TerminalMap";
import TerminalPage from "./TerminalPage";
import SelectDownloadDialog from "./components/SelectDownloadDialog";

/* NOTE: For any code in this 'terminal' folder, the following sets of words are used interchangeably:
/   - terminal <> site
/   - scenario <> configuration
/   - facility <> cost center
*/

type SiteListProp = {
  terminals: Terminal[];
  navigateToScenario: (
    terminalId: number,
    facilityId: number,
    scenarioId: number
  ) => void;
  setSteps: React.Dispatch<React.SetStateAction<StepType[]>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setIsOpen: React.Dispatch<React.SetStateAction<Boolean>>;
  selectedTerminalIds: number[];
  setSelectedTerminalIds: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedTerminalIdForPopup: React.Dispatch<React.SetStateAction<number>>;
  setSelectedFacilityIdForPopup: React.Dispatch<React.SetStateAction<number>>;
  setSelectedTerminalNameForPopup: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFacilityNameForPopup: React.Dispatch<React.SetStateAction<string>>;
  setOpenDownloadDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setTransitionState: React.Dispatch<React.SetStateAction<number>>;
  isTutorial: Boolean;
  tutorialStep: number;
  refetchTerminal: () => void;
};

const SiteList = ({
  terminals,
  navigateToScenario,
  setSteps,
  setCurrentStep,
  setIsOpen,
  selectedTerminalIds,
  setSelectedTerminalIds,
  setSelectedTerminalIdForPopup,
  setSelectedFacilityIdForPopup,
  setSelectedTerminalNameForPopup,
  setSelectedFacilityNameForPopup,
  setOpenDownloadDialog,
  setTransitionState,
  isTutorial,
  tutorialStep,
  refetchTerminal,
}: SiteListProp) => {
  return (
    <Stack
      sx={{
        width: "600px",
        height: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <Stack
        spacing={2}
        divider={<Divider />}
        sx={{ padding: "30px", height: "100%" }}
      >
        <Stack
          spacing={1}
          flexGrow={1}
          className="sites-table"
          sx={{ height: "100%" }}
        >
          <Stack
            spacing={1}
            flexGrow={1}
            className="sites-table"
            sx={{ height: "100%" }}
          >
            <Stack spacing={2} direction={"row"} alignItems={"center"}>
              <Typography variant="h2">Terminal List</Typography>
              <Button
                onClick={() => {
                  setSteps(terminalTourSteps);
                  setCurrentStep(0);
                  setIsOpen(true);
                  setTransitionState(1);
                }}
                startIcon={<HelpOutlineIcon />}
                color="info"
                variant={"outlined"}
                size={"small"}
              >
                Tutorial
              </Button>
            </Stack>
            <Box
              sx={{ minHeight: 400, height: "100%", width: "100%" }}
              className="terminal-list-table"
            >
              <TerminalListTable
                terminals={terminals}
                navigateToScenario={navigateToScenario}
                selectedTerminalIds={selectedTerminalIds}
                setSelectedTerminalIds={(ids: number[]) =>
                  setSelectedTerminalIds(ids)
                }
                setSelectedTerminalIdForPopup={setSelectedTerminalIdForPopup}
                setSelectedFacilityIdForPopup={setSelectedFacilityIdForPopup}
                setSelectedTerminalNameForPopup={
                  setSelectedTerminalNameForPopup
                }
                setSelectedFacilityNameForPopup={
                  setSelectedFacilityNameForPopup
                }
                isTutorial={isTutorial}
                tutorialStep={tutorialStep}
                refetchTerminal={refetchTerminal}
              />
            </Box>
          </Stack>
        </Stack>
        <StickyBottomBox>
          <Tooltip title="Selecting Terminals makes the associated data available for download">
            <span style={{ width: "100%" }}>
              <Button
                variant="contained"
                disabled={!selectedTerminalIds.length}
                className={"download-data-button"}
                sx={{ width: "100%" }}
                onClick={() => setOpenDownloadDialog(true)}
              >
                Download Terminal Data
              </Button>
            </span>
          </Tooltip>
        </StickyBottomBox>
      </Stack>
    </Stack>
  );
};

export default function TerminalLandingPage() {
  const [selectedScenario, setSelectedScenario] = useState<
    TerminalScenario | undefined
  >(undefined);
  const [scenarios, setScenarios] = useState<TerminalScenario[]>([]);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState<boolean>(false);
  const [selectedTerminalIds, setSelectedTerminalIds] = useState<number[]>([]);
  const [selectedTerminalIdForPopup, setSelectedTerminalIdForPopup] =
    useState<number>(0);
  const [selectedTerminalNameForPopup, setSelectedTerminalNameForPopup] =
    useState<string>("");
  const [selectedFacilityIdForPopup, setSelectedFacilityIdForPopup] =
    useState<number>(0);
  const [selectedFacilityNameForPopup, setSelectedFacilityNameForPopup] =
    useState<string>("");
  const [openScenarioDropdownForTutorial, setOpenScenarioDropdownForTutorial] =
    useState<boolean>(false);

  const statusCheckInterval = useRef<
    string | number | NodeJS.Timeout | undefined
  >();

  useEffect(() => {
    if (
      selectedTerminalIdForPopup &&
      selectedFacilityIdForPopup &&
      selectedTerminalNameForPopup &&
      selectedFacilityNameForPopup
    ) {
      setOpenAddDialog(true);
    }
  }, [
    selectedTerminalIdForPopup,
    selectedFacilityIdForPopup,
    selectedTerminalNameForPopup,
    selectedFacilityNameForPopup,
  ]);

  const { setIsOpen, setSteps, setCurrentStep, currentStep, isOpen } =
    useTour();
  const [transitionState, setTransitionState] = useState(0);
  const { terminals, refetch } = useTerminals();

  useEffect(() => {
    if (
      currentStep >= 4 &&
      currentStep < 9 &&
      transitionState === 1 &&
      !openAddDialog
    ) {
      setTransitionState(2);
      setIsOpen(false);
      setOpenAddDialog(true);
    } else if (currentStep >= 4 && currentStep < 9 && transitionState === 2) {
      setTransitionState(1);
      setIsOpen(true);
    } else if ((currentStep >= 9 || currentStep < 4) && transitionState === 1) {
      setOpenAddDialog(false);
    }
    if (currentStep >= 11 && transitionState === 1 && !selectedScenario) {
      // setSelectedScenario as the first scenario in terminals object
      setSelectedScenario(
        terminals[0].terminalFacilities[0].terminalScenarios[0]
      );
      setTransitionState(2);
      setIsOpen(false);
    } else if (currentStep >= 11 && transitionState === 2) {
      setTransitionState(1);
      setIsOpen(true);
    } else if (currentStep < 11 && transitionState === 1 && selectedScenario) {
      setSelectedScenario(undefined);
      setTransitionState(2);
      setIsOpen(false);
    } else if (currentStep < 11 && transitionState === 2) {
      setTransitionState(1);
      setIsOpen(true);
    }
  }, [
    currentStep,
    transitionState,
    setIsOpen,
    openAddDialog,
    selectedScenario,
    terminals,
  ]);

  useEffect(() => {
    if (!isOpen) setTransitionState(0);
    else setTransitionState(1);
  }, [isOpen]);

  useEffect(() => {
    if (selectedScenario) {
      setScenarios(
        terminals
          .filter((t) => t.id === selectedScenario.propertyId)[0]
          .terminalFacilities.filter(
            (f) => f.id === selectedScenario.facilityId
          )[0].terminalScenarios
      );
    }
  }, [terminals, selectedScenario]);

  useEffect(() => {
    const inProgressIds = terminals.reduce((ids: number[], terminal) => {
      terminal.terminalFacilities.forEach((facility) => {
        facility.terminalScenarios.forEach((scenario) => {
          if (scenario.status && scenario.status.status === "IN-PROGRESS") {
            ids.push(scenario.id);
          }
        });
      });
      return ids;
    }, []);

    clearInterval(statusCheckInterval.current);

    if (inProgressIds.length) {
      statusCheckInterval.current = setInterval(async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_HOST}:${
              process.env.REACT_APP_API_PORT
            }/terminals/check-status?ids=${inProgressIds.join(",")}`
          );

          if (response.ok) {
            const result = await response.json();
            const hasStatusChange = result.filter(
              (scenarioStatus: any) => scenarioStatus.status !== "IN-PROGRESS"
            );
            if (
              hasStatusChange.length ||
              result.length !== inProgressIds.length
            ) {
              refetch();
            }
          }
        } catch (error: unknown) {
          console.error(
            `Failed to retrieve scenarios status: ${inProgressIds}`
          );
        }
      }, 15000); // every 15s
    }
  }, [terminals, refetch]);

  useEffect(() => {
    setMapRenderKey(mapRenderKey + 1);
  }, [terminals]);

  const navigateToScenario = (
    terminalId: number,
    facilityId: number,
    scenarioId: number
  ) => {
    setSelectedScenario(
      terminals
        .filter((t) => t.id === terminalId)[0]
        .terminalFacilities.filter((f) => f.id === facilityId)[0]
        .terminalScenarios.filter((s) => s.id === scenarioId)[0]
    );
  };

  const changeViewFromMap = (terminal: Terminal) => {
    setSelectedScenario(terminal.terminalFacilities[0].terminalScenarios[0]);
  };

  const onDialogClose = () => {
    setOpenAddDialog(false);
    setSelectedTerminalIdForPopup(0);
    setSelectedTerminalNameForPopup("");
    setSelectedFacilityIdForPopup(0);
    setSelectedFacilityNameForPopup("");
  };

  const handleDownloadDialogClose = () => {
    setOpenDownloadDialog(false);
  };

  return (
    <>
      {selectedScenario ? (
        <TerminalPage
          scenarios={scenarios}
          terminals={terminals}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          refetchData={refetch}
          isTutorial={isOpen}
          tutorialStep={currentStep}
          setIsOpen={setIsOpen}
          goBack={() => {
            setSelectedScenario(undefined);
            refetch();
          }}
        />
      ) : (
        <Stack direction={"row"} sx={{ height: "100%" }}>
          <SiteList
            terminals={terminals}
            navigateToScenario={navigateToScenario}
            setSteps={setSteps}
            setCurrentStep={setCurrentStep}
            setIsOpen={setIsOpen}
            selectedTerminalIds={selectedTerminalIds}
            setSelectedTerminalIds={setSelectedTerminalIds}
            setSelectedTerminalIdForPopup={setSelectedTerminalIdForPopup}
            setSelectedFacilityIdForPopup={setSelectedFacilityIdForPopup}
            setSelectedTerminalNameForPopup={setSelectedTerminalNameForPopup}
            setSelectedFacilityNameForPopup={setSelectedFacilityNameForPopup}
            setOpenDownloadDialog={setOpenDownloadDialog}
            setTransitionState={setTransitionState}
            isTutorial={isOpen}
            tutorialStep={currentStep}
            refetchTerminal={refetch}
          />
          <TerminalMap
            key={mapRenderKey}
            sites={terminals}
            changeView={changeViewFromMap}
            loading={false}
            isTutorial={isOpen}
            mapData={terminals.map((terminal) => terminal.fleetSizeSum)}
          />
          {openAddDialog && (
            <AddScenarioDialog
              DialogProps={{
                open: openAddDialog,
                onClose: onDialogClose,
              }}
              selectedTerminal={{
                id: selectedTerminalIdForPopup,
                name: selectedTerminalNameForPopup,
              }}
              selectedFacility={{
                id: selectedFacilityIdForPopup,
                name: selectedFacilityNameForPopup,
              }}
              terminals={terminals}
              refetchData={refetch}
            />
          )}
          {openDownloadDialog && (
            <SelectDownloadDialog
              open={openDownloadDialog}
              handleClose={handleDownloadDialogClose}
              selectedTerminalIds={selectedTerminalIds}
              terminals={terminals}
            />
          )}
        </Stack>
      )}
    </>
  );
}
