import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type OptimalConfirmDialogProp = {
  open: boolean;
  handleConfirm: () => void;
  handleClose: () => void;
};
export default function OptimalConfirmDialog({
  open,
  handleConfirm,
  handleClose,
}: OptimalConfirmDialogProp) {
  // const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    handleConfirm();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Charger Assignment Warning
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          This can result in suboptimal charger assignment. Do you want to
          proceed?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClickOpen} variant="contained">
          Proceed
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
