import React from "react";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

export function BlockGroupPopupContent(props) {
  /* WARNING: This gets rendered thousands of times. Attaching complicated
   * behavior may mean the map takes much longer to render. */

  const primaryDataElement = (currentView = props.currentView) => {
    switch (currentView) {
      case "demand":
        return (
          <>
            <Typography sx={{ fontSize: "22pt" }} display="inline">
              {props.demand.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Typography
              sx={{ fontSize: "14pt", paddingLeft: "0.2em" }}
              display="inline"
            >
              kWh
            </Typography>
          </>
        );
      case "demandDensity":
        return (
          <>
            <Typography sx={{ fontSize: "22pt" }} display="inline">
              {(props.demand / (props.area * 3.86102e-7)).toLocaleString(
                "en-US",
                { maximumFractionDigits: 2 }
              )}
            </Typography>
            <Typography
              sx={{ fontSize: "14pt", paddingLeft: "0.2em" }}
              display="inline"
            >
              kWh / sq. mi.
            </Typography>
          </>
        );
      case "coverage":
        return (
          <>
            <Typography sx={{ fontSize: "24pt" }} display="inline">
              {(100 * props.existingChargerCoverage).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
              %
            </Typography>
            <Typography
              sx={{ fontSize: "14pt", paddingLeft: "0.2em" }}
              display="inline"
            >
              covered
            </Typography>
          </>
        );
      case "revenue":
        return (
          <>
            <Typography sx={{ fontSize: "22pt" }} display="inline">
              {props.revenue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Typography>
            <Typography
              sx={{ fontSize: "14pt", paddingLeft: "0.2em" }}
              display="inline"
            >
              per day
            </Typography>
          </>
        );
      default:
        return <React.Fragment />;
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ textAlign: "center" }}>{primaryDataElement()}</Box>
      <h3>Block Group Information</h3>
      <p>
        <strong>Block Group FIPS ID:</strong> {props.geoid}
      </p>
      <p>
        <strong>Area (land):</strong> {(props.area * 3.86102e-7).toFixed(2)} sq.
        mi.
      </p>
    </React.Fragment>
  );
}

export function SubstationPopupContent(props) {
  return (
    <React.Fragment>
      <h2>Substation Information</h2>
      <p>
        <strong>Name:</strong> {props.name}
      </p>
      <p>
        <strong>Status:</strong> {props.status}
      </p>
      <p>
        <strong>Lines:</strong> {props.lines}
      </p>
      <p>
        <strong>Max voltage:</strong> {props.maxVoltage} kV{" "}
        {props.maxInfer === "Y" && "(inferred)"}
      </p>
      <p>
        <strong>Min voltage:</strong> {props.minVoltage} kV{" "}
        {props.maxInfer === "Y" && "(inferred)"}
      </p>
    </React.Fragment>
  );
}

export function Justice40PopupContent(props) {
  const properties = props.feature?.properties || {};
  return (
    <>
      <Typography fontWeight={"bold"}>
        Clean Transit Disadvantaged Community
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Property</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Value</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Traffic Proximity</TableCell>
            <TableCell align="right">
              {properties.tpli === 1
                ? "Identified as disadvantaged"
                : "Not identified as disadvantaged"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Air Pollution</TableCell>
            <TableCell align="right">
              {properties.dpmli === 1
                ? "Identified as disadvantaged"
                : "Not identified as disadvantaged"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>GEOID</TableCell>
            <TableCell align="right">{properties.geoid}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

export function SitePopupContent(props) {
  const properties = props.feature?.properties || {};
  return (
    <>
      <Typography fontWeight={"bold"}>{properties.name}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Field</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Value</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">{properties.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>User Score</TableCell>
            <TableCell align="right">{properties.score}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              Is in a Clean Transit Disadvantaged Community?
            </TableCell>
            <TableCell align="right">{properties.justiceFlag}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Charger Coverage</TableCell>
            <TableCell align="right">
              {(properties.chargerCoverage * 100).toFixed(2)}%
            </TableCell>
          </TableRow>
          {properties?.extra &&
            properties.extra !== {} &&
            Object.keys(properties.extra).map((extraProperty) => {
              <TableRow>
                <TableCell>
                  <strong>Extra Data</strong>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>;
              return (
                <TableRow key={extraProperty}>
                  <TableCell>{extraProperty}</TableCell>
                  <TableCell align="right">
                    {properties.extra[extraProperty]}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </>
  );
}

export function GenericGeoJsonFeaturePopupContent(props) {
  const properties = props.feature?.properties || {};
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            <strong>Property</strong>
          </TableCell>
          <TableCell align="right">
            <strong>Value</strong>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.keys(properties).map((property) => {
          return (
            <TableRow key={property}>
              <TableCell>{property}</TableCell>
              <TableCell align="right">{properties[property]}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function SchoolDistrictPopupContent(props) {
  const properties = props.feature?.properties || {};
  return (
    <>
      <Typography fontWeight={"bold"}>{properties.name}</Typography>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell scope="row" sx={{ width: "200px" }}>
              Percent Eligible for Reduced Lunch
            </TableCell>
            <TableCell align="right">
              {(properties.reduced_eligible_fraction * 100).toFixed(2)}%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

export function ChargingStationPopupContent(props) {
  const properties = props.feature?.properties || {};
  return (
    <>
      <Typography fontWeight={"bold"}>Charging Station Info</Typography>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell scope="row" sx={{ width: "200px" }}>
              Level 1 Ports
            </TableCell>
            <TableCell align="right">{properties.l1Ports}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Level 2 Ports</TableCell>
            <TableCell align="right">{properties.l2Ports}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>DC Fast Ports</TableCell>
            <TableCell align="right">{properties.dcFastPorts}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Access</TableCell>
            <TableCell align="right">{properties.access}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Network</TableCell>
            <TableCell align="right">{properties.evNetwork}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell align="right">{properties.status}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Date Opened</TableCell>
            <TableCell align="right">{properties.openDate}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Plug Types</TableCell>
            <TableCell align="right">
              {properties.plugTypes.join(", ")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}
