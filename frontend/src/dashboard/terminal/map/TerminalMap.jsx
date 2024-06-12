import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import L from "leaflet";
import "leaflet-easybutton";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/leaflet.markercluster-src.js";
import "leaflet.pattern/dist/leaflet.pattern-src.js";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import Colors from "utils/colors.js";
import "../../../leaflet_extensions/leaflet.getOverlays.js";
import createLegend from "dashboard/Legend.jsx";

function centerOn(map, center, zoom) {
  map.setView(center, zoom);
}

const getColor = (data) => {
  if (data > 30000) {
    return Colors[6];
  }
  if (data > 20000) {
    return Colors[7];
  }
  if (data > 10000) {
    return Colors[8];
  }
  if (data > 5000) {
    return Colors[9];
  }
  return Colors[10];
};

const getColorFromFleet = (data) => {
  if (data > 30) {
    return Colors[6];
  }
  if (data > 20) {
    return Colors[7];
  }
  if (data > 10) {
    return Colors[8];
  }
  if (data > 5) {
    return Colors[9];
  }
  return Colors[10];
};

const colorGrade = [
  {
    lower: -Infinity,
    upper: 5000,
    color: Colors[10],
    label: "Less than 5K",
  },
  {
    lower: 5000,
    upper: 10000,
    color: Colors[9],
    label: "5K to 10K",
  },
  {
    lower: 10000,
    upper: 20000,
    color: Colors[8],
    label: "10K to 20K",
  },
  {
    lower: 20000,
    upper: 30000,
    color: Colors[7],
    label: "20K to 30K",
  },
  {
    lower: 30000,
    upper: Infinity,
    color: Colors[6],
    label: "Greater than 30K",
  },
];
const colorFleetGrade = [
  {
    lower: -Infinity,
    upper: 5,
    color: Colors[10],
    label: "Less than 5",
  },
  {
    lower: 5,
    upper: 10,
    color: Colors[9],
    label: "5 to 10",
  },
  {
    lower: 10,
    upper: 20,
    color: Colors[8],
    label: "10 to 20",
  },
  {
    lower: 20,
    upper: 30,
    color: Colors[7],
    label: "20 to 30",
  },
  {
    lower: 30,
    upper: Infinity,
    color: Colors[6],
    label: "Greater than 30",
  },
];
// naming it just `Map` overwrites the JS `Map` object
const TerminalMap = ({
  sites,
  changeView,
  loading,
  isTutorial,
  mapData = [],
}) => {
  const mapRef = useRef();
  const locationRef = useRef(); // terrible state hacking cuz of Leaflet
  const mapCenter = useMemo(() => {
    let maxLat = -Infinity,
      minLat = Infinity,
      maxLon = -Infinity,
      minLon = Infinity;
    if (sites.length > 0) {
      sites.forEach((site) => {
        site.lat && (maxLat = Math.max(site.lat, maxLat));
        site.lat && (minLat = Math.min(site.lat, minLat));
        site.lon && (maxLon = Math.max(site.lon, maxLon));
        site.lon && (minLon = Math.min(site.lon, minLon));
      });
      return {
        lat: (maxLat + minLat) / 2,
        lon: (maxLon + minLon) / 2,
        zoom: isTutorial
          ? 3
          : Math.min(
              10 - Math.round(Math.abs(maxLon - minLon)),
              10 - Math.round(Math.abs(maxLat - minLat)),
              9
            ),
      };
    }
    return {
      lat: 37.0902,
      lon: -95.7129,
      zoom: isTutorial ? 3 : 5,
    };
  }, [sites, isTutorial]);
  const location = useMemo(() => {
    return {
      center: mapCenter,
      zoom: mapCenter.zoom,
    };
  }, [mapCenter]);

  let highwayFlowLegend =
    mapData.length > 0
      ? createLegend(
          "Total Fleet Size",
          "# of Vehicles",
          colorFleetGrade,
          "coverage-legend"
        )
      : createLegend(
          "Highway Flow Coverage",
          "# of Vehicles or Traffic",
          colorGrade,
          "coverage-legend"
        );
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
    if (location?.center && location?.zoom) {
      mapRef.current.setView(location.center, location.zoom);
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
    highwayFlowLegend.addTo(mapRef.current);

    if (sites) {
      sites?.map((item, i) => {
        const index = Math.floor(Math.random() * 5);
        const marker = L.circleMarker([item?.lat, item?.lon], {
          radius: 10,
          fillColor:
            mapData.length > 0
              ? getColorFromFleet(mapData[i])
              : getColor(item.highway_flow),
          color: "black",
          weight: 1,
          fillOpacity: 1,
          siteId: item?.id,
        }).addTo(mapRef.current);

        // Add a click event to each marker
        marker.on("click", () => {
          changeView(item);
        });

        marker.on("mouseover", function () {
          marker.unbindPopup();
          marker.bindPopup("Site: " + item?.name);
          marker.openPopup();
        });

        marker.on("mouseout", function () {
          marker.closePopup();
        });
      });
    }
  }, []);

  useEffect(() => {
    locationRef.current = location;
    if (!locationRef.current) {
      centerOn(mapRef.current, [0, 0], 2);
      return;
    }
    centerOn(
      mapRef.current,
      locationRef.current.center,
      locationRef.current.zoom
    );
  }, [location]);

  return (
    <Box sx={{ flex: 1, position: "relative" }}>
      <Backdrop
        sx={{
          color: "#FFFFFF",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: "absolute",
        }}
        open={loading || false}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div id="map" />
    </Box>
  );
};

export default TerminalMap;
