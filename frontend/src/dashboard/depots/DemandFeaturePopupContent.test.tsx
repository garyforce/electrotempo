import { Auth0Provider } from "@auth0/auth0-react";
import ReactDOM from "react-dom";
import {
  DemandFeaturePopupContent,
  getDemandFeatureType,
} from "./DemandFeaturePopupContent";
import { Feature } from "geojson";

jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: (props: any) => "<div>{props.children}</div>",
}));

it("renders without crashing", () => {
  const div = document.createElement("div");
  const mapContainer = document.createElement("div");
  mapContainer.id = "map";
  document.body.appendChild(mapContainer);

  const feature: Feature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      id: 1,
    },
  };

  const year = 2020;
  const scenarioId = "1";
  const state = "NY";

  ReactDOM.render(
    <Auth0Provider
      domain={""}
      clientId={""}
      redirectUri={window.location.origin}
    >
      <DemandFeaturePopupContent
        scenarioId={scenarioId}
        feature={feature}
        year={year}
        state={state}
      />
    </Auth0Provider>,
    div
  );
});

it("correctly identifies depot features", () => {
  const feature: Feature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      id: 1,
    },
  };

  const featureType = getDemandFeatureType(feature);
  expect(featureType).toEqual("Depot");
});

it("correctly identifies feeder line features", () => {
  const feature: Feature = {
    type: "Feature",
    geometry: {
      type: "MultiLineString",
      coordinates: [
        [
          [0, 0],
          [1, 1],
        ],
      ],
    },
    properties: {
      id: 1,
    },
  };

  const featureType = getDemandFeatureType(feature);
  expect(featureType).toEqual("Feeder Line");
});
