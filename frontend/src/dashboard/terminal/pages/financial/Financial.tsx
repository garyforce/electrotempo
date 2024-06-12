import {
  Box,
  Grid,
  Typography,
  InputAdornment,
  Input,
  Tooltip,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { useAppDispatch, useAppSelector } from "redux/store";

import {
  setFuelCostGrowthRate,
  setPlanningHorizonYears,
  setPPARate,
  setChargerCost,
  setVehicleCost,
  setInstallationCost,
  setAttributableInstallationCost,
  setDiscountRate,
} from "redux/features/terminal/financialSlice";
import { Section } from "components/Section";
import CostComparisonChart from "./charts/CostComparisonChart";
import HelpTooltip from "components/HelpTooltip";
import InputSlider from "components/InputSlider";
import { FinancialData } from "types/terminal-financial";
import CostComparisonTable from "./components/CostComparisonTable";
import TwoSideSlider from "dashboard/terminal/components/TwoSideSlider";
import { useUpdateScenarioCosts } from "api/terminal/update-scenario-cost";
import { useState } from "react";
import { TerminalScenario } from "types/terminal";
import { LoadingButton } from "@mui/lab";

type FinancialPageProps = {
  selectedScenario: TerminalScenario;
  financialData: FinancialData | null;
  baseVehicleEngineType: string;
};

const FinancialPage = ({
  selectedScenario,
  financialData,
  baseVehicleEngineType,
}: FinancialPageProps) => {
  const dispatch = useAppDispatch();

  const {
    id: scenarioId,
    propertyId: terminalId,
    facilityId,
  } = selectedScenario;

  const [openCostUpdateAlert, setOpenCostUpdateAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [snackbarType, setSnackBarType] = useState<
    "success" | "info" | "error" | "warning"
  >("success");

  const financialControls = useAppSelector((store) => store.financial);

  const {
    updateScenarioCosts,
    loadingScenarioCosts: updatingCosts,
    errorScenarioCosts,
  } = useUpdateScenarioCosts();

  const LongWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,
      textAlign: "justify",
      textJustify: "inter-word",
    },
  });

  const convertLocalizedValue = (value: string): number => {
    return Number(value.replace(/\D/g, "")) || 0;
  };

  const handleAttributableCostChange = (attributableValue: number) => {
    dispatch(setAttributableInstallationCost(attributableValue));
  };

  const handleUpdateCosts = async () => {
    await updateScenarioCosts(
      terminalId,
      facilityId,
      scenarioId,
      financialControls.chargerCost,
      financialControls.vehicleCost,
      financialControls.installationCost
    );
    if (errorScenarioCosts) {
      setAlertMessage(`Error: ${errorScenarioCosts.message}`);
      setOpenCostUpdateAlert(true);
      setSnackBarType("error");
    } else {
      setAlertMessage("Scenario costs updated successfully.");
      setOpenCostUpdateAlert(true);
      setSnackBarType("success");
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Section>
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
            Financial Controls
          </Typography>
          <Grid container rowSpacing={2} columnSpacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
              <Typography variant="subtitle1">
                Planning horizon years:
              </Typography>
              <InputSlider
                min={1}
                max={24}
                step={1}
                value={financialControls.planningHorizonYears}
                onChange={(newValue) =>
                  dispatch(setPlanningHorizonYears(newValue))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Year(s)</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
              <Typography variant="subtitle1">
                Fuel Cost Growth Rate (%):
              </Typography>
              <InputSlider
                min={0}
                max={10}
                step={0.1}
                value={Number(
                  (financialControls.fuelCostGrowthRate * 100).toFixed(1)
                )}
                onChange={(newValue) => {
                  dispatch(
                    setFuelCostGrowthRate(Number(newValue.toFixed(1)) / 100)
                  );
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
              <HelpTooltip
                title={"This is the same as Interest Rate"}
                placement="right"
              >
                <Typography variant="subtitle1">Discount Rate (%):</Typography>
              </HelpTooltip>
              <InputSlider
                min={0}
                max={10}
                step={0.1}
                value={Number(
                  (financialControls.discountRate * 100).toFixed(1)
                )}
                onChange={(newValue) =>
                  dispatch(setDiscountRate(Number(newValue.toFixed(1)) / 100))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
              <HelpTooltip
                title={
                  "The Power Purchase Agreement (PPA) percentage is the percentage " +
                  "of the total energy that is taken from the grid. The remaining " +
                  "percentage is assumed to be generated on-site."
                }
              >
                <Typography variant="subtitle1">
                  Power Purchase Agreement (%):
                </Typography>
              </HelpTooltip>
              <InputSlider
                min={0}
                max={100}
                step={1}
                value={Number((financialControls.ppaRate * 100).toFixed(1))}
                onChange={(newValue) =>
                  dispatch(setPPARate(Number(newValue.toFixed(1)) / 100))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
              <Grid container alignItems="center" sx={{ marginTop: "0.2em" }}>
                <Grid
                  item
                  xs={11}
                  sx={{
                    marginRight: "1em",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="subtitle1">
                    Attributable Installation Cost ($)
                  </Typography>
                  <Typography variant="subtitle1">
                    Non-Attributable Installation Cost ($)
                  </Typography>
                </Grid>
              </Grid>
              <TwoSideSlider
                max={financialControls.installationCost}
                min={0}
                value={Number(financialControls.attributableInstallationCost)}
                onChange={handleAttributableCostChange}
              />
            </Grid>
          </Grid>
          <Grid container rowSpacing={2} columnSpacing={2} marginTop={3}>
            <Grid item xs={8} sm={8} md={8} lg={6} xl={4}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle1">Charger Cost =</Typography>
                <Input
                  sx={{ marginLeft: "10px", width: "120px" }}
                  type="string"
                  value={financialControls.chargerCost.toLocaleString()}
                  onChange={(e) =>
                    dispatch(
                      setChargerCost(convertLocalizedValue(e.target.value))
                    )
                  }
                  endAdornment={
                    <InputAdornment position="end">$</InputAdornment>
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={8} sm={8} md={8} lg={6} xl={4}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle1">Vehicle Cost =</Typography>
                <Input
                  sx={{ marginLeft: "10px", width: "120px" }}
                  type="string"
                  value={financialControls.vehicleCost.toLocaleString()}
                  onChange={(e) =>
                    dispatch(
                      setVehicleCost(convertLocalizedValue(e.target.value))
                    )
                  }
                  endAdornment={
                    <InputAdornment position="end">$</InputAdornment>
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={8} sm={8} md={8} lg={6} xl={4}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle1">
                  Total Initial Installation Cost =
                </Typography>
                <Input
                  sx={{ marginLeft: "10px", width: "120px" }}
                  type="string"
                  value={financialControls.installationCost.toLocaleString()}
                  onChange={(e) =>
                    dispatch(
                      setInstallationCost(convertLocalizedValue(e.target.value))
                    )
                  }
                  endAdornment={
                    <InputAdornment position="end">$</InputAdornment>
                  }
                />
              </Box>
            </Grid>

            <Grid container justifyContent="flex-end" mt={2} xs={10.6} lg={12}>
              <Grid item>
                {updatingCosts ? (
                  <LoadingButton variant="contained" loading>
                    Update Scenario Costs
                  </LoadingButton>
                ) : (
                  <Button variant="contained" onClick={handleUpdateCosts}>
                    Update Scenario Costs
                  </Button>
                )}

                <Snackbar
                  open={openCostUpdateAlert}
                  autoHideDuration={6000}
                  anchorOrigin={{
                    horizontal: "right",
                    vertical: "bottom",
                  }}
                  onClose={() => setOpenCostUpdateAlert(false)}
                >
                  <Alert severity={snackbarType}>{alertMessage}</Alert>
                </Snackbar>
                <Grid />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Section>
      <Box
        sx={{
          border: 0.5,
          padding: "16px",
          borderColor: "silver",
          borderRadius: 5,
          marginTop: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
            Total Optimized Expenses (Net Present Value: USD)
          </Typography>
          <Typography variant="h3" sx={{ marginLeft: "30px" }}>
            {`$${Number(
              financialData?.costComparisonTableData.evOptimizedChargingData.totalExpensesNPV.toFixed(
                0
              )
            ).toLocaleString()}`}
          </Typography>
        </Box>
      </Box>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <LongWidthTooltip
                title={`${baseVehicleEngineType} Only configuration is the current workload without EVs. EV-reference case is all EVs running till end of shift and then charging to full. EV-optimized charging optimizes the operational and charging schedule for EVs.`}
              >
                <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                  Configuration Comparison
                </Typography>
              </LongWidthTooltip>
            </Box>
            {financialData && (
              <CostComparisonChart
                dataSets={financialData.costComparisonData}
                baseVehicleEngineType={baseVehicleEngineType}
              />
            )}
          </Section>
        </Grid>
      </Grid>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Section>
            <Box sx={{ marginBottom: 3 }}>
              <LongWidthTooltip
                title={`${baseVehicleEngineType} Only configuration is the current workload without EVs. EV-reference case is all EVs running till end of shift and then charging to full. EV-optimized charging optimizes the operational and charging schedule for EVs.`}
              >
                <Typography variant="controlTitle" sx={{ fontWeight: 600 }}>
                  Configuration Comparison Data
                </Typography>
              </LongWidthTooltip>
            </Box>
            {financialData && (
              <CostComparisonTable
                data={financialData.costComparisonTableData}
                baseVehicleEngineType={baseVehicleEngineType}
              />
            )}
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialPage;
