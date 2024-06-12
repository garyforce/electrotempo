import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type confirmUploadProp = {
  alertOpen: boolean;
  handleAlertClose: () => void;
  handleConfirm: () => void;
};

export default ({
  alertOpen,
  handleAlertClose,
  handleConfirm,
}: confirmUploadProp) => {
  return (
    <Dialog
      open={alertOpen}
      onClose={handleAlertClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Overwrite existing fleet record?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          A fleet record with this combination of id, vehicle type id, and label
          already exists. Are you sure you want to overwrite it?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="success"
          onClick={handleConfirm}
          autoFocus
        >
          Confirm
        </Button>
        <Button variant="contained" color="error" onClick={handleAlertClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
