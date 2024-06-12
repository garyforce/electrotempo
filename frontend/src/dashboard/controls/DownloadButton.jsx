import React from "react";
import PropTypes from "prop-types";

import { LoadingButton } from "@mui/lab";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

function DownloadButton(props) {
  const getText = () => {
    if (props.loading) {
      return "Downloading...";
    } else if (props.error) {
      return "Error, unable to download";
    } else {
      return props.innerText ? props.innerText : "Download Data";
    }
  };
  return (
    <LoadingButton
      color="primary"
      variant="outlined"
      onClick={props.onClick}
      loading={props.loading}
      disabled={props.loading || props.error}
      loadingPosition="start"
      startIcon={<CloudDownloadIcon />}
      className="download-data-button"
    >
      {getText()}
    </LoadingButton>
  );
}

DownloadButton.propTypes = {
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  innerText: PropTypes.string,
};

export default DownloadButton;
