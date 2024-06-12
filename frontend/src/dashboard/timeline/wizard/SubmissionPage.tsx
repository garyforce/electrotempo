import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { SubmissionStatus } from "./GrowthScenarioWizard";

type SubmissionPageProps = {
  onClose: () => void;
  submit: () => void;
  onFinishButtonClick: () => void;
  status: SubmissionStatus;
  message?: string;
};

export default function SubmissionPage(props: SubmissionPageProps) {
  const { onClose, status, message, submit, onFinishButtonClick } = props;

  return (
    <>
      <DialogContent>
        <Box
          sx={{
            flexGrow: 1,
            display: "grid",
            placeItems: "center",
            overflowY: "hidden",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography variant="h2">Running Simulation</Typography>
            {status === "submitting" && <CircularProgress />}
            {status === "failure" && (
              <>
                <Alert severity="error">{message ?? "An error occured."}</Alert>
                <Button variant="contained" onClick={submit}>
                  Retry
                </Button>
              </>
            )}
            {status === "success" && (
              <Alert severity="success">
                Successfully added growth scenario!
              </Alert>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          disabled={["submitting", "success"].includes(status)}
          onClick={onClose}
        >
          Cancel
        </Button>
        <div style={{ flex: "1 0 0" }} />
        <Button
          variant="contained"
          disabled={status !== "success"}
          onClick={onFinishButtonClick}
        >
          Finish
        </Button>
      </DialogActions>
    </>
  );
}
