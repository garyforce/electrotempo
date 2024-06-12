import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";

import L from "leaflet";
import "leaflet-easybutton";
import * as GeoSearch from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/leaflet.markercluster-src.js";
import "leaflet.pattern/dist/leaflet.pattern-src.js";
import "leaflet/dist/leaflet.css";
import "../leaflet_extensions/leaflet.getOverlays.js";

import Color from "colorjs.io";

import { isEmptyObject } from "../utils/object.js";

import createLegend from "./Legend.jsx";

import { usePermissions } from "./PermissionContext";
import {
  BlockGroupPopupContent,
  ChargingStationPopupContent,
  SitePopupContent,
  SubstationPopupContent,
} from "./PopupContent.jsx";

import markerBlueSvg from "../images/marker_blue.svg";
import markerGreenSvg from "../images/marker_green.svg";
import markerRedSvg from "../images/marker_red.svg";
import markerYellowSvg from "../images/marker_yellow.svg";
import { addOverlayToMap } from "./Overlay";

const EXCLUSIVE_EV_NETWORKS = [
  "Tesla",
  "Tesla Destination",
  "RIVIAN_ADVENTURE",
];

function centerOn(map, center, zoom) {
  map.setView(center, zoom);
}

function createPovertyLegend() {
  let povertyLegend = L.control({ position: "bottomright" });

  povertyLegend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    let labels = [];
    labels.push("<h4>Families Below<br/>Poverty Line</h4>");
    labels.push("<h5>Percentage</h5>");
    labels.push("<table>");
    labels.push(
      '<tr><td><i class="poverty-legend-key-1"></i></td><td>Less than 25%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="poverty-legend-key-2"></i></td><td>25% to 50%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="poverty-legend-key-3"></i></td><td>50% to 75%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="poverty-legend-key-4"></i></td><td>75% to 100%</td></tr>'
    );
    labels.push("</table>");
    div.innerHTML = labels.join("");
    return div;
  };

  return povertyLegend;
}

function createNonWhiteLegend() {
  let nonWhiteLegend = L.control({ position: "bottomright" });

  nonWhiteLegend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    let labels = [];
    labels.push("<h4>Non-whites</h4>");
    labels.push("<h5>Percentage</h5>");
    labels.push("<table>");
    labels.push(
      '<tr><td><i class="nonwhite-legend-key-1"></i></td><td>Less than 25%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="nonwhite-legend-key-2"></i></td><td>25% to 50%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="nonwhite-legend-key-3"></i></td><td>50% to 75%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="nonwhite-legend-key-4"></i></td><td>75% to 100%</td></tr>'
    );
    labels.push("</table>");
    div.innerHTML = labels.join("");
    return div;
  };

  return nonWhiteLegend;
}

function createMultifamilyHousingLegend() {
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    let labels = [];
    labels.push("<h4>Families Living in<br/>Multifamily Housing</h4>");
    labels.push("<h5>Percentage</h5>");
    labels.push("<table>");
    labels.push(
      '<tr><td><i class="multifamily-legend-key-1"></i></td><td>Less than 25%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="multifamily-legend-key-2"></i></td><td>25% to 50%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="multifamily-legend-key-3"></i></td><td>50% to 75%</td></tr>'
    );
    labels.push(
      '<tr><td><i class="multifamily-legend-key-4"></i></td><td>75% to 100%</td></tr>'
    );
    labels.push("</table>");
    div.innerHTML = labels.join("");
    return div;
  };

  return legend;
}

function createSitesLegend() {
  let sitesLegend = L.control({ position: "bottomright" });
  sitesLegend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend sites-legend");
    div.innerHTML = ReactDOMServer.renderToString(
      <>
        <h4>Site Scores</h4>
        <Box
          sx={{
            display: "grid",
            alignContent: "space-between",
            justifyContent: "center",
            gridTemplateColumns: "18px auto",
            gap: "10px",
            width: "100%",
            height: "100px",
          }}
        >
          <Box
            sx={{
              gridRow: "1 / 6",
              background:
                "linear-gradient(0deg, rgba(255,0,0,0.8) 0%, rgba(188,101,0,0.8) 25%, rgba(142,117,0,0.8) 50%, rgba(96,124,0,0.8) 75%, rgba(0,128,0,0.8)  100%);",
            }}
          ></Box>
          <Typography
            sx={{
              position: "relative",
              top: "-5px",
              gridColumn: 2,
              gridRow: 1,
            }}
          >
            Higher Score
          </Typography>
          <Typography
            sx={{
              position: "relative",
              bottom: "-5px",
              gridColumn: 2,
              gridRow: 5,
            }}
          >
            Lower Score
          </Typography>
        </Box>
      </>
    );
    return div;
  };
  return sitesLegend;
}

function createChargingStationLegend() {
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend charging-station-legend");
    let labels = [];
    labels.push("<h4>Charging Stations</h4>");
    labels.push("<table>");
    labels.push(
      `<tr><td><img src="${markerBlueSvg}" width="24" height="40" style="margin-right: 1em"></td><td>Public</td></tr>`
    );
    labels.push(
      `<tr><td><img src="${markerRedSvg}" width="24" height="40" style="margin-right: 1em"></td><td>Private</td></tr>`
    );
    labels.push(
      `<tr><td><img src="${markerGreenSvg}" width="24" height="40" style="margin-right: 1em"></td><td>Exclusive</td></tr>`
    );
    labels.push("</table>");
    div.innerHTML = labels.join("");
    return div;
  };
  return legend;
}

function updateBasemapLegend(map, legends, prevView, currentView) {
  if (legends[prevView]) {
    map.removeControl(legends[prevView]);
  }
  legends[currentView].addTo(map);
}

function updateChargingStations(
  chargingStationLayerGroup,
  chargingStations,
  permissions,
  customMapUpdater
) {
  if (!chargingStations) return;
  if (chargingStations?.features.length === 0) {
    return;
  }

  if (customMapUpdater) {
    chargingStationLayerGroup.clearLayers();
  }
  let blueMarkerIcon = L.icon({
    iconUrl: markerBlueSvg,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -32],
  });
  let redMarkerIcon = L.icon({
    iconUrl: markerRedSvg,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -32],
  });
  let greenMarkerIcon = L.icon({
    iconUrl: markerGreenSvg,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -32],
  });
  chargingStations?.features.forEach((chargingStation) => {
    let icon;
    if (chargingStation.properties.access === "private") {
      icon = redMarkerIcon;
    } else if (
      EXCLUSIVE_EV_NETWORKS.includes(chargingStation.properties.evNetwork)
    ) {
      icon = greenMarkerIcon;
    } else {
      icon = blueMarkerIcon;
    }
    const newMarker = L.marker(chargingStation.geometry.coordinates.reverse(), {
      icon,
    });
    if (permissions.includes("read:charging_station_popups")) {
      newMarker.on("click", function (event) {
        newMarker.unbindPopup();
        newMarker.bindPopup(
          ReactDOMServer.renderToString(
            <ChargingStationPopupContent feature={chargingStation} />
          )
        );
        newMarker.openPopup();
      });
    }
    newMarker.addTo(chargingStationLayerGroup);
  });
}

function updateSubstations(substationLayerGroup, substations, permissions) {
  if (substations?.features === undefined) return;
  var geojsonMarkerOptions = {
    radius: 2.5,
    fillColor: "#05CC73",
    color: "#000",
    weight: 0,
    opacity: 1,
    fillOpacity: 0.8,
    pane: "substations",
  };

  substations.features.forEach((substation) => {
    const newFeature = L.geoJSON(substation, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
      },
    });
    if (permissions.includes("read:substation_popups")) {
      newFeature.on("click", function (event) {
        newFeature.bindPopup(
          ReactDOMServer.renderToString(getSubstationPopupContent(substation))
        );
        newFeature.openPopup();
      });
    }
    newFeature.addTo(substationLayerGroup);
  });
}

function updateOverlays(map, layerControl, overlays) {
  if (overlays === undefined) return;
  overlays.forEach((overlay) => {
    addOverlayToMap(map, layerControl, overlay);
  });
}

function updateSites(
  map,
  sitesLayerGroup,
  sites,
  selectedSites,
  setSelectedSites,
  permissions
) {
  sites = { ...sites };

  if (sites.features === undefined) return;

  sitesLayerGroup.clearLayers();

  const color = new Color("red");
  const greenRed = color.range("green", {
    space: "lch",
    outputSpace: "srgb",
  });

  function createAndBindPopup(layer, site) {
    const contentString = ReactDOMServer.renderToString(
      <SitePopupContent feature={site} />
    );
    const popup = L.popup().setContent(contentString);
    layer.bindPopup(popup);
  }

  // calculate score and find extreme scores
  let maxScore = -Infinity;
  let minScore = Infinity;

  sites.features.forEach((site) => {
    const propertyScore = site.properties.totalScore;
    if (propertyScore > maxScore) {
      maxScore = propertyScore;
    }
    if (propertyScore < minScore) {
      minScore = propertyScore;
    }
  });

  sites.features.forEach((site) => {
    const propertyScore = site.properties.totalScore;
    const normalizedScore = (propertyScore - minScore) / (maxScore - minScore);

    // one site will have a NaN score and the color gradient doesn't make sense.
    // Default to "good" when there's only one site.
    const color =
      sites.features.length > 1
        ? greenRed(normalizedScore).toString({ format: "hex" })
        : greenRed(1); //
    const siteStyle = {
      fillColor: color,
      color: color,
      opacity: 1,
      fillOpacity: 0.8,
      pane: "sites",
    };
    const newFeature = L.geoJSON(site, {
      style: {
        ...siteStyle,
        weight: 2,
      },
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          ...siteStyle,
          radius: 4,
          weight: 0,
        });
      },
    });
    newFeature.id = site.id;
    newFeature.on("click", function (event) {
      setSelectedSites([newFeature.id]);
      createAndBindPopup(newFeature, site);
      newFeature.openPopup();
    });
    newFeature.addTo(sitesLayerGroup);
  });

  if (selectedSites?.length > 0) {
    // there is no way to get a single layer by custom ID. We must iterate
    // over all of them and manually check
    sitesLayerGroup.eachLayer(function (layer) {
      if (layer.id === selectedSites[0]) {
        // manually find the property with the associated id from the selection model...
        const selectedSite = sites.features.find(
          (feature) => feature.id === layer.id
        );
        createAndBindPopup(layer, selectedSite);
        layer.openPopup();
        map.addLayer(sitesLayerGroup); // forces the layer to be visible if it's not active. Has no effect if layer is already added
        map.fitBounds(layer.getBounds());
      }
    });
  }
}

/**
 * Returns the color associated with the given gradesRef.current and value, using the
 * first found grade where `value` is >= `lower` and < `upper`.
 *
 * If value is undefined, it defaults to 0.
 *
 * If no grade matches the given value, the color red is returned. This is
 * an attention grabbing color, and should be considered an error.
 * @param {array} gradesRef.current The array of grade objects
 * @param {number} value The value to find a color of
 * @returns a string representing the hex color for the given gradesRef.current and value
 */
export function getColor(colorGrade, value = 0) {
  // for loop because can't break Array.forEach
  for (let i = 0; i < colorGrade.length; i++) {
    let grade = colorGrade[i];
    if (value >= grade.lower && value < grade.upper) {
      return grade.color;
    }
    // at the last grade, upper is inclusive
    if (i === colorGrade.length - 1) {
      if (value === grade.upper) {
        return grade.color;
      }
    }
  }
  // error case: return first/presumably lowest color
  return colorGrade[0].color;
}

function updateDemand(
  demandLayerGroup,
  grades,
  useDemandDensity,
  blockGroups,
  demand,
  existingChargerCoverage,
  revenue,
  demographics,
  currentView,
  permissions
) {
  // reset polygons and layergroup
  demandLayerGroup.clearLayers();
  // prevent null dereference || prevent drawing without data
  if (blockGroups?.features === undefined || isEmptyObject(demand)) return;
  blockGroups.features.forEach((blockGroup) => {
    // blockGroup.properties.area is in sq. m, multiply by 3.86102e-7 to make sq. km
    let polylineOptions = {
      color: useDemandDensity
        ? getColor(
            grades["demandDensity"],
            demand[blockGroup.properties.geoid] /
              (blockGroup.properties.area * 3.86102e-7)
          )
        : getColor(grades["demand"], demand[blockGroup.properties.geoid]),
      fillOpacity: 0.8,
      weight: 0.5,
    };
    let newPolygon = L.geoJSON(blockGroup, polylineOptions);
    if (permissions.includes("read:block_group_popups")) {
      newPolygon.on("click", function (event) {
        newPolygon.bindPopup(
          ReactDOMServer.renderToString(
            getBlockGroupPopupContent(
              blockGroup,
              demand,
              existingChargerCoverage,
              currentView
            )
          )
        );
        newPolygon.openPopup();
      });
    }
    newPolygon.addTo(demandLayerGroup);
  });
}

function updateRevenuePotential(
  revenuePotentialLayerGroup,
  grades,
  blockGroups,
  revenue,
  demand,
  existingChargerCoverage,
  demographics,
  currentView,
  permissions
) {
  // reset polygons and layergroup
  revenuePotentialLayerGroup.clearLayers();
  // prevent null dereference || prevent drawing without data
  if (blockGroups?.features === undefined || isEmptyObject(revenue)) return;
  blockGroups.features.forEach((blockGroup) => {
    let polylineOptions = {
      color: getColor(grades["revenue"], revenue[blockGroup.properties.geoid]),
      fillOpacity: 0.8,
      weight: 0.2,
    };
    let newPolygon = L.geoJSON(blockGroup, polylineOptions);
    if (permissions.includes("read:block_group_popups")) {
      newPolygon.on("click", function (event) {
        newPolygon.bindPopup(
          ReactDOMServer.renderToString(
            getBlockGroupPopupContent(
              blockGroup,
              demand,
              existingChargerCoverage,
              currentView
            )
          )
        );
        newPolygon.openPopup();
      });
    }
    newPolygon.addTo(revenuePotentialLayerGroup);
  });
}

function updateExistingChargerCoverage(
  existingChargerCoverageLayerGroup,
  grades,
  blockGroups,
  existingChargerCoverage,
  demand,
  revenue,
  demographics,
  currentView,
  permissions
) {
  // reset polygons and layergroup
  existingChargerCoverageLayerGroup.clearLayers();
  // prevent null dereference || prevent drawing without data
  if (
    blockGroups?.features === undefined ||
    isEmptyObject(existingChargerCoverage)
  )
    return;
  blockGroups.features.forEach((blockGroup) => {
    let polylineOptions = {
      color: getColor(
        grades["coverage"],
        existingChargerCoverage[blockGroup.properties.geoid]
      ),
      fillOpacity: 0.8,
      weight: 0.5,
    };
    let newPolygon = L.geoJSON(blockGroup, polylineOptions);
    if (permissions.includes("read:block_group_popups")) {
      newPolygon.on("click", function (event) {
        newPolygon.bindPopup(
          ReactDOMServer.renderToString(
            getBlockGroupPopupContent(
              blockGroup,
              demand,
              existingChargerCoverage,
              currentView
            )
          )
        );
        newPolygon.openPopup();
      });
    }
    newPolygon.addTo(existingChargerCoverageLayerGroup);
  });
}

function updatePovertyDemographics(
  map,
  povertyLayerGroup,
  blockGroups,
  demographics,
  demand,
  existingChargerCoverage,
  revenue,
  currentView,
  permissions
) {
  if (blockGroups === undefined || demographics === undefined) return;
  if (
    Object.keys(blockGroups).length === 0 ||
    Object.keys(demographics).length === 0
  )
    return;
  const metricId = 2; // hardcoded until I can think of a way to genercize this
  // reset polygons and layergroup
  povertyLayerGroup.clearLayers();

  // prevent null dereference || prevent drawing without data
  if (blockGroups.features === undefined || isEmptyObject(demographics)) return;
  blockGroups.features.forEach((blockGroup) => {
    let patternOffset = 0;
    let density;
    // nullish coalescer so some block groups don't report super-dense
    let fractionOfFamilesBelowPovertyLine =
      demographics?.[blockGroup.properties.geoid]?.[metricId] ?? 0;
    if (fractionOfFamilesBelowPovertyLine < 0.25) {
      density = 32;
    } else if (fractionOfFamilesBelowPovertyLine < 0.5) {
      density = 16;
    } else if (fractionOfFamilesBelowPovertyLine < 0.75) {
      density = 8;
    } else {
      density = 4;
    }
    let innerCircle = new L.PatternCircle({
      x: density / 2 + patternOffset,
      y: density / 2 + patternOffset,
      radius: 1.5,
      stroke: false,
      fill: true,
      color: "blue",
      fillOpacity: 1,
    });
    // width, height are the size of each inner shape's tile
    let pattern = new L.Pattern({ width: density, height: density });

    pattern.addShape(innerCircle);
    pattern.addTo(map);
    let polylineOptions = {
      color: "#000000",
      fillPattern: pattern,
      fillOpacity: 0.8,
      weight: 0.2,
      pane: "demographics",
    };
    let newPolygon = new L.geoJSON(blockGroup, polylineOptions);
    if (permissions.includes("read:block_group_popups")) {
      newPolygon.on("click", function (event) {
        newPolygon.bindPopup(
          ReactDOMServer.renderToString(
            getBlockGroupPopupContent(
              blockGroup,
              demand,
              existingChargerCoverage,
              currentView
            )
          )
        );
        newPolygon.openPopup();
      });
    }
    newPolygon.addTo(povertyLayerGroup);
  });
}

function updateNonWhiteDemographics(
  map,
  nonWhiteLayerGroup,
  blockGroups,
  demographics,
  demand,
  existingChargerCoverage,
  revenue,
  currentView,
  permissions
) {
  if (blockGroups === undefined || demographics === undefined) return;
  if (
    Object.keys(blockGroups).length === 0 ||
    Object.keys(demographics).length === 0
  )
    return;
  const metricId = 3; // hardcoded until I can think of a way to genercize this
  // reset polygons and layergroup
  nonWhiteLayerGroup.clearLayers();

  // prevent null dereference || prevent drawing without data
  if (blockGroups.features === undefined || isEmptyObject(demographics)) return;
  blockGroups.features.forEach((blockGroup) => {
    let patternOffset = 1;
    let density;
    // nullish coalescer so some block groups don't report super-dense
    let fractionNonWhite =
      demographics?.[blockGroup.properties.geoid]?.[metricId] ?? 0;
    if (fractionNonWhite < 0.25) {
      density = 32;
    } else if (fractionNonWhite < 0.5) {
      density = 16;
    } else if (fractionNonWhite < 0.75) {
      density = 8;
    } else {
      density = 4;
    }
    let innerCircle = new L.PatternCircle({
      x: density / 2 + patternOffset,
      y: density / 2 + patternOffset,
      radius: 1.5,
      stroke: false,
      fill: true,
      color: "green",
      fillOpacity: 1,
    });
    // width, height are the size of each inner shape's tile
    let pattern = new L.Pattern({ width: density, height: density });

    pattern.addShape(innerCircle);
    pattern.addTo(map);
    let polylineOptions = {
      color: "#000000",
      fillPattern: pattern,
      fillOpacity: 0.8,
      weight: 0.2,
      pane: "demographics",
    };
    let newPolygon = new L.geoJSON(blockGroup, polylineOptions);
    if (permissions.includes("read:block_group_popups")) {
      newPolygon.on("click", function (event) {
        newPolygon.bindPopup(
          ReactDOMServer.renderToString(
            getBlockGroupPopupContent(
              blockGroup,
              demand,
              existingChargerCoverage,
              currentView
            )
          )
        );
        newPolygon.openPopup();
      });
    }
    newPolygon.addTo(nonWhiteLayerGroup);
  });
}

function updateMultifamilyHousingDemographics(
  map,
  multifamilyHousingLayerGroup,
  blockGroups,
  demographics,
  demand,
  existingChargerCoverage,
  revenue,
  currentView,
  permissions
) {
  if (blockGroups === undefined || demographics === undefined) return;
  if (
    Object.keys(blockGroups).length === 0 ||
    Object.keys(demographics).length === 0
  )
    return;
  const metricId = 4; // hardcoded until I can think of a way to genercize this
  // reset polygons and layergroup
  multifamilyHousingLayerGroup.clearLayers();

  // prevent null dereference || prevent drawing without data
  if (blockGroups.features === undefined || isEmptyObject(demographics)) return;
  blockGroups.features.forEach((blockGroup) => {
    let patternOffset = 1;
    let density;
    // nullish coalescer so some block groups don't report super-dense
    let fractionOfFamiliesInMultifamilyHousing =
      demographics?.[blockGroup.properties.geoid]?.[metricId];
    if (fractionOfFamiliesInMultifamilyHousing === undefined) {
      density = 0;
    } else if (fractionOfFamiliesInMultifamilyHousing < 0.25) {
      density = 4;
    } else if (fractionOfFamiliesInMultifamilyHousing < 0.5) {
      density = 8;
    } else if (fractionOfFamiliesInMultifamilyHousing < 0.75) {
      density = 16;
    } else {
      density = 32;
    }
    let innerCircle = new L.PatternCircle({
      x: density / 2 + patternOffset,
      y: density / 2,
      radius: 1.5,
      stroke: false,
      fill: true,
      color: "red",
      fillOpacity: 1,
    });
    // width, height are the size of each inner shape's tile
    let pattern = new L.Pattern({ width: density, height: density });

    pattern.addShape(innerCircle);
    pattern.addTo(map);
    let polylineOptions = {
      color: "#000000",
      fillPattern: pattern,
      fillOpacity: 0.8,
      weight: 0.2,
      pane: "demographics",
    };
    let newPolygon = new L.geoJSON(blockGroup, polylineOptions);
    if (permissions.includes("read:block_group_popups")) {
      newPolygon.on("click", function (event) {
        newPolygon.bindPopup(
          ReactDOMServer.renderToString(
            getBlockGroupPopupContent(
              blockGroup,
              demand,
              existingChargerCoverage,
              currentView
            )
          )
        );
        newPolygon.openPopup();
      });
    }
    newPolygon.addTo(multifamilyHousingLayerGroup);
  });
}

function getBlockGroupPopupContent(
  blockGroup,
  demand,
  existingChargerCoverage,
  currentView
) {
  const geoid = blockGroup.properties.geoid;
  const area = blockGroup.properties.area;
  const demandkWh = demand ? demand[blockGroup.properties.geoid] ?? 0 : 0; // if demand undefined, set 0
  const existingChargerCoveragekWh = existingChargerCoverage
    ? existingChargerCoverage[blockGroup.properties.geoid] ?? 0
    : 0; // if props.existingChargerCoverage undefined, set 0
  return (
    <BlockGroupPopupContent
      geoid={geoid}
      area={area}
      demand={demandkWh}
      existingChargerCoverage={existingChargerCoveragekWh}
      currentView={currentView}
    />
  );
}

function getSubstationPopupContent(substation) {
  return (
    <SubstationPopupContent
      name={substation.properties.name}
      status={substation.properties.status}
      lines={substation.properties.num_lines}
      maxVoltage={substation.properties.max_voltage}
      minVoltage={substation.properties.min_voltage}
      maxInfer={substation.properties.max_infer}
      minInfer={substation.properties.min_infer}
    />
  );
}

// naming it just `Map` overwrites the JS `Map` object
export default function MapComponent(props) {
  const permissions = usePermissions();
  const [customMapUpdater, setCustomMapUpdater] = useState(0);

  const mapRef = useRef();
  const locationRef = useRef(); // terrible state hacking cuz of Leaflet
  const baseMapsRef = useRef();
  const layerControlRef = useRef();
  const legendsRef = useRef();
  const demandLayerGroupRef = useRef(L.layerGroup());
  const povertyLayerGroupRef = useRef(L.layerGroup());
  const nonWhiteLayerGroupRef = useRef(L.layerGroup());
  const multifamilyHousingLayerGroupRef = useRef(L.layerGroup());
  const existingChargerCoverageLayerGroupRef = useRef();
  const revenuePotentialLayerGroupRef = useRef(L.layerGroup());
  const chargingStationLayerGroupRef = useRef(
    L.markerClusterGroup({ disableClusteringAtZoom: 13 })
  );
  const substationLayerGroupRef = useRef(L.layerGroup());
  const sitesLayerGroupRef = useRef(L.layerGroup());
  const currentViewRef = useRef();
  const overlaysRef = useRef({});
  const gradesRef = useRef({
    demand: [
      {
        lower: -Infinity,
        upper: 1,
        color: "#FFF1E8",
        label: "Less than 1",
      },
      {
        lower: 1,
        upper: 10,
        color: "#FFC69B",
        label: "1 to 10",
      },
      {
        lower: 10,
        upper: 100,
        color: "#FF9F4D",
        label: "10 to 100",
      },
      {
        lower: 100,
        upper: 1000,
        color: "#FF7C23",
        label: "100 to 1000",
      },
      {
        lower: 1000,
        upper: 10000,
        color: "#A14800",
        label: "1000 to 10000",
      },
      {
        lower: 10000,
        upper: Infinity,
        color: "#421B00",
        label: "Greater than 10000",
      },
    ],
    demandDensity: [
      {
        lower: -Infinity,
        upper: 1,
        color: "#FFF1E8",
        label: "Less than 1",
      },
      {
        lower: 1,
        upper: 10,
        color: "#FFC69B",
        label: "1 to 10",
      },
      {
        lower: 10,
        upper: 100,
        color: "#FF9F4D",
        label: "10 to 100",
      },
      {
        lower: 100,
        upper: 1000,
        color: "#FF7C23",
        label: "100 to 1000",
      },
      {
        lower: 1000,
        upper: 10000,
        color: "#A14800",
        label: "1000 to 10000",
      },
      {
        lower: 10000,
        upper: Infinity,
        color: "#421B00",
        label: "Greater than 10000",
      },
    ],
    coverage: [
      {
        lower: -Infinity,
        upper: 0.25,
        color: "#FFF2FE",
        label: "Less than 25%",
      },
      {
        lower: 0.25,
        upper: 0.5,
        color: "#FFA3F1",
        label: "25% to 50%",
      },
      {
        lower: 0.5,
        upper: 0.75,
        color: "#FD63DC",
        label: "50% to 75%",
      },
      {
        lower: 0.75,
        upper: 1,
        color: "#AD369D",
        label: "75% to 100%",
      },
      {
        lower: 1,
        upper: Infinity,
        color: "#5C1657",
        label: "Greater than 100%",
      },
    ],
    revenue: [
      {
        lower: -Infinity,
        upper: 10,
        color: "#FFFFE8",
        label: "Less than $10",
      },
      {
        lower: 10,
        upper: 100,
        color: "#FFF69B",
        label: "$10 to $100",
      },
      {
        lower: 100,
        upper: 1000,
        color: "#FFE04D",
        label: "$100 to $1000",
      },
      {
        lower: 1000,
        upper: 10000,
        color: "#FDBE02",
        label: "$1000 to $10000",
      },
      {
        lower: 10000,
        upper: Infinity,
        color: "#806100",
        label: "Greater than $10000",
      },
    ],
  });

  function recenter() {
    // this is within the functional component because it needs access to
    // locationRef. Calling it from within the useEffect where the recenter
    // button is initialized means the props aren't available then.
    centerOn(
      mapRef.current,
      locationRef.current.center,
      locationRef.current.zoom
    );
  }

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = L.map("map", {
      preferCanvas: false, // leaflet.pattern does not support `true`
      layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
    });

    currentViewRef.current = props.currentView;

    /* Initialize Map Search */
    const search = new GeoSearch.GeoSearchControl({
      provider: new GeoSearch.OpenStreetMapProvider(),
      style: "button",
      marker: {
        icon: L.icon({
          iconUrl: markerYellowSvg,
          iconSize: [24, 40],
          iconAnchor: [12, 40],
          popupAnchor: [0, -32],
        }),
      },
    });
    mapRef.current.addControl(search);

    // map view must eventually be set. If props.location is not set at
    // this point, the expectation is that it will be set when location gets
    // updated
    if (props?.location?.center && props?.location?.zoom) {
      mapRef.current.setView(props.location.center, props.location.zoom);
    }
    // dumb styling on recenter icon to center it in the box
    // eslint-disable-next-line
    L.easyButton(
      ReactDOMServer.renderToString(
        // We're inside Leaflet library interfaces and things can go wrong when
        // trying to follow the best practices of anchor-is-vald. Ignoring.
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a href="#" className="recenter-button">
          <MyLocationIcon fontSize="small" sx={{ paddingTop: "5px" }} />
        </a>
      ),
      () => {
        recenter();
      }
    ).addTo(mapRef.current);
    demandLayerGroupRef.current = L.layerGroup();
    existingChargerCoverageLayerGroupRef.current = L.layerGroup();

    // demographics pane is specified by each GeoJSON layer of demographics.
    // adding it to the layer group does not its children to the pane
    mapRef.current.createPane("demographics");
    mapRef.current.getPane("demographics").style.zIndex = 550; // on top of polygons, below markers and popups

    baseMapsRef.current = {
      demand: demandLayerGroupRef.current,
      demandDensity: demandLayerGroupRef.current,
      coverage: existingChargerCoverageLayerGroupRef.current,
      sites: existingChargerCoverageLayerGroupRef.current,
      revenue: revenuePotentialLayerGroupRef.current,
    };
    baseMapsRef.current[props.currentView].addTo(mapRef.current);
    layerControlRef.current = L.control
      .layers({}, overlaysRef.current, {
        autoZIndex: false,
        position: "bottomleft",
      })
      .addTo(mapRef.current);

    /* legendsRef.current and layer controls */

    let povertyLegend = createPovertyLegend();
    let nonWhiteLegend = createNonWhiteLegend();
    let multifamilyHousingLegend = createMultifamilyHousingLegend();
    let demandLegend = createLegend(
      "Charging Demand",
      "kWh",
      gradesRef.current["demand"],
      "demand-legend"
    );
    let demandDensityLegend = createLegend(
      "Charging Demand Density",
      "kWh per sq. mi.",
      gradesRef.current["demandDensity"],
      "demand-legend"
    ); // same class name as demand-legend for consistency with tour interaction
    let existingChargerCoverageLegend = createLegend(
      "Existing Charger Coverage",
      "Percentage",
      gradesRef.current["coverage"],
      "coverage-legend"
    );
    let revenueLegend = createLegend(
      "Daily Electricity Cost",
      `${new Date().getFullYear()} US Dollars`,
      gradesRef.current["revenue"],
      "revenue-legend"
    );
    let sitesLegend = createSitesLegend();
    let chargingStationLegend = createChargingStationLegend();

    legendsRef.current = {
      demand: demandLegend,
      coverage: existingChargerCoverageLegend,
      demandDensity: demandDensityLegend,
      poverty: povertyLegend,
      nonWhite: nonWhiteLegend,
      multifamily: multifamilyHousingLegend,
      revenue: revenueLegend,
      sites: sitesLegend,
      "charging-station": chargingStationLegend,
    };
    legendsRef.current[props.currentView].addTo(mapRef.current);

    // sites also will have the coverage legend
    if (props.currentView === "sites") {
      legendsRef.current["coverage"].addTo(mapRef.current);
    }

    mapRef.current.on("overlayadd", (eventLayer) => {
      if (eventLayer.name === "Percentage of families below poverty line") {
        povertyLegend.addTo(mapRef.current);
      }
      if (eventLayer.name === "Percentage of non-whites") {
        nonWhiteLegend.addTo(mapRef.current);
      }
      if (eventLayer.name === "Percentage of families in multifamily housing") {
        multifamilyHousingLegend.addTo(mapRef.current);
      }
      if (eventLayer.name === "Sites") {
        sitesLegend.addTo(mapRef.current);
      }
      if (eventLayer.name === "Charging Stations") {
        chargingStationLegend.addTo(mapRef.current);
      }
    });

    mapRef.current.on("overlayremove", (eventLayer) => {
      // remove control only if neither demo layers is active
      if (eventLayer.name === "Percentage of families below poverty line") {
        mapRef.current.removeControl(povertyLegend);
      } else if (eventLayer.name === "Percentage of non-whites") {
        mapRef.current.removeControl(nonWhiteLegend);
      } else if (eventLayer.name === "Sites") {
        mapRef.current.removeControl(sitesLegend);
      } else if (eventLayer.name === "Charging Stations") {
        mapRef.current.removeControl(chargingStationLegend);
      } else if (
        eventLayer.name === "Percentage of families in multifamily housing"
      ) {
        mapRef.current.removeControl(multifamilyHousingLegend);
      }
    });
    // force data update
    updateOverlays(mapRef.current, layerControlRef.current, props.overlays);
    updateSubstations(
      substationLayerGroupRef.current,
      props.substations,
      permissions
    );
    setCustomMapUpdater(customMapUpdater + 1);
    updateChargingStations(
      chargingStationLayerGroupRef.current,
      props.chargingStations,
      permissions,
      customMapUpdater
    );
    updateSites(
      mapRef.current,
      sitesLayerGroupRef.current,
      props.sites,
      props.selectedSites,
      props.setSelectedsites,
      permissions
    );
    updateDemand(
      demandLayerGroupRef.current,
      gradesRef.current,
      props.useDemandDensity,
      props.blockGroups,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.demographics,
      props.currentView,
      permissions
    );
    updateExistingChargerCoverage(
      existingChargerCoverageLayerGroupRef.current,
      gradesRef.current,
      props.blockGroups,
      props.existingChargerCoverage,
      props.demand,
      props.revenue,
      props.demographics,
      props.currentView,
      permissions
    );
    updateRevenuePotential(
      revenuePotentialLayerGroupRef.current,
      gradesRef.current,
      props.blockGroups,
      props.revenue,
      props.demand,
      props.existingChargerCoverage,
      props.demographics,
      props.currentView,
      permissions
    );
    updatePovertyDemographics(
      mapRef.current,
      povertyLayerGroupRef.current,
      props.blockGroups,
      props.demographics,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.currentView,
      permissions
    );
    updateNonWhiteDemographics(
      mapRef.current,
      nonWhiteLayerGroupRef.current,
      props.blockGroups,
      props.demographics,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.currentView,
      permissions
    );
    updateMultifamilyHousingDemographics(
      mapRef.current,
      multifamilyHousingLayerGroupRef.current,
      props.blockGroups,
      props.demographics,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.currentView,
      permissions
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function addSubstationsOverlay() {
      layerControlRef.current.removeLayer(substationLayerGroupRef.current);
      if (permissions.includes("read:substations")) {
        mapRef.current.createPane("substations");
        mapRef.current.getPane("substations").style.zIndex = 551; // on top of polygons and demographics, below markers and popups
        layerControlRef.current.addOverlay(
          substationLayerGroupRef.current,
          "Substations"
        );
      }
    }

    function addChargingStationsOverlay() {
      layerControlRef.current.removeLayer(chargingStationLayerGroupRef.current);
      if (permissions.includes("read:charging_stations")) {
        mapRef.current.createPane("charging_stations");
        mapRef.current.getPane("charging_stations").style.zIndex = 551; // on top of polygons and demographics, below markers and popups
        layerControlRef.current.addOverlay(
          chargingStationLayerGroupRef.current,
          "Charging Stations"
        );
      }
    }

    function addSitesOverlay() {
      layerControlRef.current.removeLayer(sitesLayerGroupRef.current);
      if (permissions.includes("read:sites")) {
        mapRef.current.createPane("sites");
        mapRef.current.getPane("sites").style.zIndex = 551; // on top of polygons and demographics, below markers and popups
        layerControlRef.current.addOverlay(sitesLayerGroupRef.current, "Sites");
      }
    }

    function addDemographicsOverlay() {
      layerControlRef.current.removeLayer(povertyLayerGroupRef.current);
      if (permissions.includes("read:poverty_demographics")) {
        layerControlRef.current.addOverlay(
          povertyLayerGroupRef.current,
          "Percentage of families below poverty line"
        );
      }

      layerControlRef.current.removeLayer(nonWhiteLayerGroupRef.current);
      if (permissions.includes("read:nonwhite_demographics")) {
        layerControlRef.current.addOverlay(
          nonWhiteLayerGroupRef.current,
          "Percentage of non-whites"
        );
      }

      layerControlRef.current.removeLayer(
        multifamilyHousingLayerGroupRef.current
      );
      if (permissions.includes("read:multifamily_housing_demographics")) {
        layerControlRef.current.addOverlay(
          multifamilyHousingLayerGroupRef.current,
          "Percentage of families in multifamily housing"
        );
      }
    }

    switch (props.currentView) {
      case "demand":
      case "demandDensity":
      case "coverage":
        addSubstationsOverlay();
        addChargingStationsOverlay();
        addDemographicsOverlay();
        break;
      case "sites":
        addDemographicsOverlay();
        addSitesOverlay();
        addChargingStationsOverlay();
        break;
      default:
        break;
    }
  }, [permissions, props.currentView, props.isTxPPC]);

  useEffect(() => {
    locationRef.current = props.location;
    if (!locationRef.current) {
      centerOn(mapRef.current, [0, 0], 2);
      return;
    }
    centerOn(
      mapRef.current,
      locationRef.current.center,
      locationRef.current.zoom
    );
    // Remove the multifamilyHousing filter and layer for TxPPC
    if (props.isTxPPC) {
      mapRef.current.removeControl(createMultifamilyHousingLegend());
      mapRef.current.removeLayer(multifamilyHousingLayerGroupRef.current);
      layerControlRef.current.removeLayer(
        multifamilyHousingLayerGroupRef.current
      );
    }
  }, [props.isTxPPC, props.location]);

  useEffect(() => {
    // remove last view layer and legend
    mapRef.current.removeLayer(baseMapsRef.current[currentViewRef.current]);
    updateBasemapLegend(
      mapRef.current,
      legendsRef.current,
      currentViewRef.current,
      props.currentView
    );
    // update current displayed view
    currentViewRef.current = props.currentView;
    baseMapsRef.current[props.currentView].addTo(mapRef.current);

    if (props.currentView === "sites") {
      mapRef.current.addLayer(sitesLayerGroupRef.current); // forces the layer to be visible if it's not active. Has no effect if layer is already added
    }
    if (props.currentView === "coverage") {
      mapRef.current.addLayer(chargingStationLayerGroupRef.current);
    }
  }, [props.currentView]);

  useEffect(() => {
    updateOverlays(mapRef.current, layerControlRef.current, props.overlays);
  }, [props.overlays]);

  useEffect(() => {
    setCustomMapUpdater(customMapUpdater + 1);
    updateChargingStations(
      chargingStationLayerGroupRef.current,
      props.chargingStations,
      permissions,
      customMapUpdater
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chargingStations, permissions]);

  useEffect(() => {
    updateSubstations(
      substationLayerGroupRef.current,
      props.substations,
      permissions
    );
  }, [props.substations, permissions]);

  useEffect(() => {
    updateSites(
      mapRef.current,
      sitesLayerGroupRef.current,
      props.sites,
      props.selectedSites,
      props.setSelectedSites,
      permissions
    );
  }, [props.sites, props.selectedSites, props.setSelectedSites, permissions]);

  useEffect(() => {
    /* The data needs to be shown on popups for every individual polygon
     * on all the layers, so we have to update them ALL. No, it's not
     * optimal, but it's a bigger technological hurdle than expected to not
     * redraw the polygons and yet show different data across them.
     * Note to future developer: the answer probably involves leaflet's
     * Layer.setStyle() */
    updateDemand(
      demandLayerGroupRef.current,
      gradesRef.current,
      props.useDemandDensity,
      props.blockGroups,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.demographics,
      props.currentView,
      permissions
    );
    updateExistingChargerCoverage(
      existingChargerCoverageLayerGroupRef.current,
      gradesRef.current,
      props.blockGroups,
      props.existingChargerCoverage,
      props.demand,
      props.revenue,
      props.demographics,
      props.currentView,
      permissions
    );
    updateRevenuePotential(
      revenuePotentialLayerGroupRef.current,
      gradesRef.current,
      props.blockGroups,
      props.revenue,
      props.demand,
      props.existingChargerCoverage,
      props.demographics,
      props.currentView,
      permissions
    );
    updatePovertyDemographics(
      mapRef.current,
      povertyLayerGroupRef.current,
      props.blockGroups,
      props.demographics,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.currentView,
      permissions
    );
    updateNonWhiteDemographics(
      mapRef.current,
      nonWhiteLayerGroupRef.current,
      props.blockGroups,
      props.demographics,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.currentView,
      permissions
    );
    updateMultifamilyHousingDemographics(
      mapRef.current,
      multifamilyHousingLayerGroupRef.current,
      props.blockGroups,
      props.demographics,
      props.demand,
      props.existingChargerCoverage,
      props.revenue,
      props.currentView,
      permissions
    );
    updateBasemapLegend(
      mapRef.current,
      legendsRef.current,
      currentViewRef.current,
      props.currentView
    );
  }, [
    props.blockGroups,
    props.demographics,
    props.demand,
    props.existingChargerCoverage,
    props.revenue,
    props.currentView,
    props.useDemandDensity,
    permissions,
  ]);

  return (
    <Box sx={{ flex: 1, position: "relative" }}>
      <Backdrop
        sx={{
          color: "#FFFFFF",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: "absolute",
        }}
        open={props.loading || false}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div id="map" />
    </Box>
  );
}
