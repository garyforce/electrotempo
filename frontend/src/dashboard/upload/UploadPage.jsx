import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import {
  Typography,
  Stack,
  Button,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RefreshIcon from "@mui/icons-material/Refresh";

import UploadControls from "./UploadControls";

import RelativeTime from "@yaireo/relative-time";

const GET_TRAFFIC_MODELS_URL = `${process.env.REACT_APP_API_GATEWAY_URL}/traffic-model`;
const GET_TRAFFIC_MODEL_DOWNLOAD_URL = `${process.env.REACT_APP_API_GATEWAY_URL}/traffic-model/download`;

function UploadPage(props) {
  const { getAccessTokenSilently } = useAuth0();
  const [trafficModels, setTrafficModels] = useState([]);
  const [loadingTrafficModels, setLoadingTrafficModels] = useState(false);
  const [openMenuId, setOpenMenuId] = React.useState("");
  const [downloadMenuAnchorElement, setDownloadMenuAnchorElement] =
    React.useState(null);
  const [uploadControlsKey, setUploadControlsKey] = useState(0);

  const downloadFile = async (modelType, uuid, downloadType) => {
    const token = await getAccessTokenSilently();
    let result = await fetch(
      `${GET_TRAFFIC_MODEL_DOWNLOAD_URL}?${new URLSearchParams({
        awsUuid: uuid,
        modelType: modelType,
        downloadType: downloadType,
      })}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    let data = await result.json();
    const downloadUrl = data.url;
    const link = document.createElement("a");
    link.href = downloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function onUploadFinish() {
    fetchTrafficModels();
    setUploadControlsKey(uploadControlsKey + 1);
  }

  async function fetchTrafficModels() {
    setLoadingTrafficModels(true);
    setTrafficModels([]);
    const token = await getAccessTokenSilently();
    const response = await fetch(GET_TRAFFIC_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setTrafficModels(data);
    }
    setLoadingTrafficModels(false);
  }

  useEffect(() => {
    fetchTrafficModels();
    /* Disabling eslint warning because we want to use this effect like
     * componentDidMount, only calling it once. */
    // eslint-disable-next-line
  }, []);

  const formatRelativeDate = (timestamp) => {
    if (!timestamp) return "";
    const relativeTime = new RelativeTime();
    const date = new Date(timestamp);
    return relativeTime.from(date);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(date);
  };

  /**
   * Sets the state of parameters associated with a particular element: the
   * HTML element to use as an anchor, and the ID of which Menu is open.
   * @param {element} anchor the HTML element to use as an anchor. Usually
   * event.currentTarget
   * @param {*} id the unique ID of the particular element, so that each menu
   * only opens itself and not all menus.
   */
  const setDownloadMenuParameters = (anchor, id) => {
    setDownloadMenuAnchorElement(anchor);
    setOpenMenuId(id);
  };

  const renderStatusCell = (params) => {
    if (params.row.status === "Completed") {
      return (
        <>
          <Button
            variant="contained"
            disabled={params.row.status !== "Completed"}
            onClick={(event) =>
              setDownloadMenuParameters(
                event.currentTarget,
                params.row.aws_uuid
              )
            }
          >
            Download
            <ArrowDropDownIcon />
          </Button>
          <Menu
            open={openMenuId === params.row.aws_uuid}
            onClose={() => setDownloadMenuParameters(null, "")}
            anchorEl={downloadMenuAnchorElement}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() =>
                downloadFile(
                  params.row.model_type,
                  params.row.aws_uuid,
                  "nodal_demand"
                )
              }
            >
              Raw Simulation Data
            </MenuItem>
            <MenuItem
              disabled={!params.row.has_nodes_file}
              onClick={() =>
                downloadFile(
                  params.row.model_type,
                  params.row.aws_uuid,
                  "block_group_demand"
                )
              }
            >
              Simulation Data Mapped to Block Groups
            </MenuItem>
          </Menu>
        </>
      );
    }
    return params.row.status;
  };

  const columns = [
    { field: "name", headerName: "Name", minWidth: 200, flex: 1 },
    { field: "model_type", headerName: "Model Type", width: 125 },
    { field: "replicates", headerName: "Replicates", width: 100 },
    {
      field: "created",
      headerName: "Submitted",
      width: 130,
      renderCell: (params) => (
        <Tooltip title={formatDate(params.value)} placement={"top"}>
          <span className="table-cell-trucate">
            {formatRelativeDate(params.value)}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "updated",
      headerName: "Updated",
      width: 150,
      renderCell: (params) => (
        <Tooltip title={formatDate(params.value)} placement={"top"}>
          <span className="table-cell-trucate">
            {formatRelativeDate(params.value)}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: renderStatusCell,
    },
  ];

  return (
    <Stack direction="row" sx={{ height: "100%" }}>
      <UploadControls
        key={uploadControlsKey}
        onCloseButtonClick={onUploadFinish}
        locations={props.locations}
      />
      <Stack
        spacing={1}
        sx={{
          backgroundColor: "white",
          height: "100%",
          overflowY: "auto",
          flexGrow: 1,
          padding: "1em",
          boxSizing: "border-box",
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Typography variant="h1">Submitted Simulations</Typography>
          <Button onClick={fetchTrafficModels} variant="outlined" color="info">
            <RefreshIcon sx={{ color: "#222" }} />
          </Button>
        </Stack>
        <div style={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={trafficModels}
            columns={columns}
            loading={loadingTrafficModels}
          />
        </div>
      </Stack>
    </Stack>
  );
}

export default UploadPage;
