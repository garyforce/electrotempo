import { useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-easybutton";
import "leaflet.pattern/dist/leaflet.pattern-src.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/leaflet.markercluster-src.js";
import "../../../../leaflet_extensions/leaflet.getOverlays.js";
import "leaflet-geosearch/dist/geosearch.css";

function centerOn(map, center, zoom) {
  map.setView(center, zoom);
}

// naming it just `Map` overwrites the JS `Map` object
export default function FleetMap(props) {
  const mapRef = useRef();
  const locationRef = useRef(); // terrible state hacking cuz of Leaflet

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

    // Created circular markers
    L.circleMarker([33.749, -84.3879], {
      radius: 30,
      fillColor: "#05c2cc",
      color: "#05c2cc",
      fillOpacity: 1,
    })
      .addTo(mapRef.current)
      .bindPopup(
        "<div style='font-weight: bold;'><p> <span style='color: #05c2cc;'> $4.5M </span> cost savings from EV's</p> <p> <span style='color: #05c2cc;'> 245 000 </span> tons/year CO2 <br/> savings from EV's </p></div>"
      );

    L.circleMarker([33.6582728, -84.6647209], {
      radius: 20,
      fillColor: "#10b6cb",
      color: "#10b6cb",
      fillOpacity: 1,
    })
      .addTo(mapRef.current)
      .bindPopup(
        "<div style='font-weight: bold;'><p> <span style='color: #05c2cc;'> $3.0M </span> cost savings from EV's</p> <p> <span style='color: #05c2cc;'> 375 000 </span> tons/year CO2 <br/> savings from EV's </p></div>"
      );

    L.circleMarker([33.8113042, -84.6045774], {
      radius: 15,
      fillColor: "#0988a1",
      color: "#0988a1",
      fillOpacity: 1,
    })
      .addTo(mapRef.current)
      .bindPopup(
        "<div style='font-weight: bold;'><p> <span style='color: #05c2cc;'> $1.5M </span> cost savings from EV's</p> <p> <span style='color: #05c2cc;'> 150 000 </span> tons/year CO2 <br/> savings from EV's </p></div>"
      );

    L.circleMarker([33.9433306, -84.4352164], {
      radius: 10,
      fillColor: "#0c039c",
      color: "#0c039c",
      fillOpacity: 1,
    })
      .addTo(mapRef.current)
      .bindPopup(
        "<div style='font-weight: bold;'><p> <span style='color: #05c2cc;'> $1.0M </span> cost savings from EV's</p> <p> <span style='color: #05c2cc;'> 125 000 </span> tons/year CO2 <br/> savings from EV's </p></div>"
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    locationRef.current = props?.location;
    if (!locationRef.current) {
      centerOn(mapRef.current, [0, 0], 2);
      return;
    }
    centerOn(
      mapRef.current,
      locationRef.current.center,
      locationRef.current.zoom
    );
  }, [props.location]);

  return (
    <Box sx={{ flex: 1, position: "relative" }}>
      <Backdrop
        sx={{
          color: "#FFFFFF",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: "absolute",
        }}
        open={props?.loading || false}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div id="map" />
    </Box>
  );
}
