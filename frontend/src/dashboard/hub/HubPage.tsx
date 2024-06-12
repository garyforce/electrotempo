import { useEffect, useState } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTour } from "@reactour/tour";

import useSite from "api/hub/site";
import SiteListTable, {
  SiteListData,
} from "dashboard/hub/pages/components/SiteListTable";
import HubMap from "./map/HubMap";
import HubScenarioPage from "./pages/HubScenarioPage";
import { tourSteps } from "./pages/components/TutorialStep";
import { HubSite } from "types/hub-site";
import SiteDownloadDialog from "dashboard/terminal/components/SitesDownloadDialog";
import { useAccessToken } from "utils/get-access-token";
import { Location } from "types/location";

export interface DownloadIds {
  siteId: number;
  evGrowthScenarioId: number;
}

type HupPageProp = {
  handleFromHubToTimeline: () => void;
};
function HubPage({ handleFromHubToTimeline }: HupPageProp) {
  const { getToken } = useAccessToken();

  const [siteList, setSiteList] = useState<SiteListData[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);
  const [openDownloadDialog, setOpenDownloadDialog] = useState<boolean>(false);
  const [downloadIds, setDownloadIds] = useState<DownloadIds[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<
    | {
        siteId: number;
        evGrowthScenarioId: number;
      }
    | undefined
  >();
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const [transitionState, setTransitionState] = useState(0);
  const [locations, setLocations] = useState<Location[]>([]);

  const { sites } = useSite();
  const { setIsOpen, setSteps, setCurrentStep, currentStep, isOpen } =
    useTour();

  useEffect(() => {
    const loadLocations = async () => {
      const apiToken = await getToken();
      try {
        const locationResponse = await fetch(
          `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/locations`,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );
        if (locationResponse.ok) {
          const locationsData = await locationResponse.json();
          setLocations(locationsData);
        }
      } catch (e) {}
    };
    loadLocations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const data: SiteListData[] = [];
    sites.forEach((site: HubSite) => {
      data[`${site.id}`] = {
        id: site.id,
        name: site.name,
        evGrowthScenarios: site.evGrowthScenarios,
        currentEvGrowthScenarioId: siteList[site?.id]
          ? siteList[site.id].currentEvGrowthScenarioId
          : site.evGrowthScenarios[0]?.id,
      };
    });
    setSiteList(data);

    setMapRenderKey(mapRenderKey + 1);
  }, [sites]);

  useEffect(() => {
    if (currentStep >= 6 && !selectedScenario && transitionState === 1) {
      const demoSite = Object.values(siteList)[0];
      setSelectedScenario({
        siteId: demoSite.id,
        evGrowthScenarioId: demoSite.currentEvGrowthScenarioId,
      });
      setTransitionState(2);
      setIsOpen(false);
    } else if (currentStep >= 6 && transitionState === 2) {
      setTransitionState(1);
      setIsOpen(true);
    }
    if (currentStep <= 5 && selectedScenario && transitionState === 1) {
      setTransitionState(2);
      setIsOpen(false);
      setSelectedScenario(undefined);
    } else if (currentStep <= 5 && transitionState === 2) {
      setTransitionState(1);
      setIsOpen(true);
    }
  }, [currentStep, selectedScenario, transitionState, siteList, setIsOpen]);

  useEffect(() => {
    if (!isOpen) setTransitionState(0);
    else setTransitionState(1);
  }, [isOpen]);

  const handleSiteListScenariosChange = (
    siteId: number,
    evGrowthScenarioId: number
  ) => {
    const newSiteList = { ...siteList };
    newSiteList[`${siteId}`].currentEvGrowthScenarioId = evGrowthScenarioId;
    setSiteList(newSiteList);
  };

  const navigateToScenario = (siteId: number, evGrowthScenarioId: number) => {
    setSelectedScenario({ siteId, evGrowthScenarioId });
  };

  const handleDownloadDialogClose = () => {
    setOpenDownloadDialog(false);
  };

  return (
    <>
      {selectedScenario ? (
        <HubScenarioPage
          siteId={selectedScenario.siteId}
          evGrowthScenarioId={selectedScenario.evGrowthScenarioId}
          evGrowthScenarios={
            siteList[selectedScenario.siteId].evGrowthScenarios
          }
          backToLandingPage={() => setSelectedScenario(undefined)}
          handleSiteListScenariosChange={handleSiteListScenariosChange}
          tutorialStep={currentStep}
          isTutorial={isOpen}
          setIsOpen={setIsOpen}
        />
      ) : (
        <>
          <Stack direction={"row"} sx={{ height: "100%" }}>
            <Stack
              sx={{
                width: "600px",
                minWidth: "25%",
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
                    spacing={2}
                    direction={"row"}
                    alignItems={"center"}
                    sx={{ mb: "1rem" }}
                  >
                    <Typography variant="h2">Site List</Typography>
                    <Button
                      onClick={() => {
                        setSteps(tourSteps);
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
                  <Box sx={{ minHeight: 320, height: "320px", width: "100%" }}>
                    <SiteListTable
                      siteList={Object.values(siteList)}
                      handleSiteListScenariosChange={
                        handleSiteListScenariosChange
                      }
                      selectedSiteIds={selectedSiteIds}
                      setSelectedSiteIds={(ids: number[]) =>
                        setSelectedSiteIds(ids)
                      }
                      navigateToScenario={navigateToScenario}
                      handleFromHubToTimeline={handleFromHubToTimeline}
                      setOpenDownloadDialog={setOpenDownloadDialog}
                      locations={locations}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Stack>
            <HubMap
              key={mapRenderKey}
              sites={sites}
              siteList={siteList}
              navigateToScenario={navigateToScenario}
              loading={false}
              isTutorial={isOpen}
            />
            {openDownloadDialog && (
              <SiteDownloadDialog
                open={openDownloadDialog}
                handleClose={handleDownloadDialogClose}
                selectedSiteIds={selectedSiteIds}
                downloadIds={downloadIds}
                setDownloadIds={setDownloadIds}
                siteList={siteList}
              />
            )}
          </Stack>
        </>
      )}
    </>
  );
}

export default HubPage;
