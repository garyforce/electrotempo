import {
  Box,
  DialogTitle,
  DialogProps,
  Dialog,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useMemo, useState } from "react";

import { runGrowthScenarioSimulation } from "api/growth_scenario";
import { useAuth0 } from "@auth0/auth0-react";

import { Chart as ChartJS, ScatterController } from "chart.js";

import SubmissionPage from "./SubmissionPage";
import SalesCurvePage, {
  getLogisticCurveParametersFromVehicleClass,
} from "./SalesCurvePage";
import InitializationPage, { baseVehicleClasses } from "./InitializationPage";
import { SalesCurveSettings, VehicleClass } from "types/vehicle-class";
import { GrowthScenario } from "types/growth-scenario";
import { Location } from "types/location";
import { usePermissions } from "dashboard/PermissionContext";

ChartJS.register(ScatterController);

export type SubmissionStatus =
  | "not started"
  | "submitting"
  | "success"
  | "failure";

type GrowthScenarioWizardProps = DialogProps & {
  onSubmit: () => void;
  growthScenarios: GrowthScenario[];
  location?: Location;
};

export default function GrowthScenarioWizard(props: GrowthScenarioWizardProps) {
  const { getAccessTokenSilently } = useAuth0();

  const permissions = usePermissions();
  const canCreateGrowthScenario = useMemo(() => {
    return permissions.includes("write:growth_scenarios");
  }, [permissions]);

  const [growthScenario, setGrowthScenario] = useState<GrowthScenario>({
    name: "",
    description: "",
    vehicleClasses: [],
  });

  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("not started");
  const [activeStep, setActiveStep] = useState(0);

  /**
   * Wraps props.onClose() so that this dialog can't be closed while the growth
   * scenario is being submitted.
   */
  const handleClose = () => {
    if (props.onClose === undefined) return;
    if (submissionStatus === "submitting") return;
    // use backdropClick as the reason so that the dialog doesn't reopen,
    // but it doesn't really matter cause who cares. TypeScript hack.
    props.onClose({}, "backdropClick");
  };

  const handleVehicleClassChange = (vehicleClass: VehicleClass) => {
    setGrowthScenario((previousGrowthScenario) => {
      const newVehicleClasses = previousGrowthScenario.vehicleClasses.map(
        (previousVehicleClass) => {
          if (previousVehicleClass.name === vehicleClass.name) {
            return vehicleClass;
          } else {
            return previousVehicleClass;
          }
        }
      );
      return { ...previousGrowthScenario, vehicleClasses: newVehicleClasses };
    });
  };

  const pages = [
    <InitializationPage
      growthScenario={growthScenario}
      setGrowthScenario={setGrowthScenario}
      onClose={handleClose}
      onNextButtonClick={() => {
        setActiveStep((previousActiveStep) => previousActiveStep + 1);
      }}
      growthScenarios={props.growthScenarios}
    />,
  ];

  // add SalesCurvePages in the same order that the baseVehicleClasses are in
  let pagesAdded = 0;
  baseVehicleClasses.forEach((vehicleClass, index) => {
    const vehicleClassToAdd = growthScenario.vehicleClasses.find((vc) => {
      return vc.name === vehicleClass.name;
    });
    if (vehicleClassToAdd !== undefined) {
      pagesAdded++;
      if (pagesAdded === growthScenario.vehicleClasses.length) {
        // advancing to the last page submits the growth scenario

        pages.push(
          <SalesCurvePage
            vehicleClass={vehicleClassToAdd}
            onVehicleClassChange={handleVehicleClassChange}
            onClose={handleClose}
            onNextButtonClick={() => {
              setActiveStep((previousActiveStep) => previousActiveStep + 1);
              submitGrowthScenario();
            }}
            onBackButtonClick={() =>
              setActiveStep((previousActiveStep) => previousActiveStep - 1)
            }
            lastPage={true}
          />
        );
      } else {
        pages.push(
          <SalesCurvePage
            vehicleClass={vehicleClassToAdd}
            onVehicleClassChange={handleVehicleClassChange}
            onClose={handleClose}
            onNextButtonClick={() => {
              setActiveStep((previousActiveStep) => previousActiveStep + 1);
            }}
            onBackButtonClick={() =>
              setActiveStep((previousActiveStep) => previousActiveStep - 1)
            }
            lastPage={false}
          />
        );
      }
    }
  });

  pages.push(
    <SubmissionPage
      onClose={handleClose}
      submit={submitGrowthScenario}
      status={submissionStatus}
      onFinishButtonClick={props.onSubmit}
    />
  );

  async function submitGrowthScenario() {
    const growthScenarioWithSimulationSettings = {
      ...growthScenario,
      vehicleClasses: growthScenario.vehicleClasses.map((vehicleClass) => {
        const logisticCurveParameters =
          getLogisticCurveParametersFromVehicleClass(vehicleClass);
        const salesCurveSettings: SalesCurveSettings = {
          logisticL: logisticCurveParameters.L,
          logisticK: logisticCurveParameters.k,
          logisticX0: logisticCurveParameters.x0,
        };
        return {
          ...vehicleClass,
          salesCurveSettings,
        };
      }),
    };
    const apiToken = await getAccessTokenSilently();
    setSubmissionStatus("submitting");
    try {
      await runGrowthScenarioSimulation(
        growthScenarioWithSimulationSettings,
        apiToken,
        props.location
      );
      setSubmissionStatus("success");
    } catch (error) {
      setSubmissionStatus("failure");
    }
  }

  return (
    <Dialog {...props} onClose={handleClose}>
      {canCreateGrowthScenario ? (
        <>
          <DialogTitle>Add a new Growth Scenario</DialogTitle>
          {/* There's a bug with MUI padding DialogContent incorrectly. This <Box>
           * is a workaround. Track https://github.com/mui/material-ui/issues/27851
           * to see if it has gotten fixed. */}
          <Box>{pages[activeStep]}</Box>
        </>
      ) : (
        <Stack p={10} spacing={4} textAlign={"center"} alignItems={"center"}>
          <Typography sx={{ color: "grey" }}>
            This feature is not currently included in your subscription. Please
            email <span style={{ color: "blue" }}>info@electrotempo.com</span>{" "}
            to inquire about adding this feature.
          </Typography>
          <Button
            variant="contained"
            sx={{ width: "16%" }}
            onClick={handleClose}
          >
            Close
          </Button>
        </Stack>
      )}
    </Dialog>
  );
}
