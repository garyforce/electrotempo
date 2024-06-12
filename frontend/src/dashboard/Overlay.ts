import { Feature, FeatureCollection } from "geojson";
import L, { GeoJSONOptions, LayerGroup, Control, Map } from "leaflet";

type ExtendedLayersControl = Control.Layers & {
  getOverlays: Function;
  _layers: LayersControlInternalLayer[];
};

type LayersControlInternalLayer = {
  name: string;
  layer: LayerGroup;
};

export type Overlay = {
  name: string;
  legend: Control;
  geoJSON: Feature | FeatureCollection;
  options: GeoJSONOptions;
};

export function createLayerGroup(overlay: Overlay): LayerGroup {
  const layerGroup = L.layerGroup();
  const geoJSON = L.geoJSON(overlay.geoJSON, overlay.options);
  geoJSON.addTo(layerGroup);
  return layerGroup;
}

export function removeExistingOverlay(
  layerControl: Control.Layers,
  overlay: Overlay
) {
  const previousLayer = (layerControl as ExtendedLayersControl)._layers.find(
    (layer) => (layer as LayersControlInternalLayer).name === overlay.name
  );
  if (previousLayer !== undefined) {
    previousLayer.layer.clearLayers();
    layerControl.removeLayer(previousLayer.layer);
  }
}

export function addOverlayToMap(
  map: Map,
  layerControl: Control.Layers,
  overlay: Overlay
) {
  removeExistingOverlay(layerControl, overlay);
  const layerGroup = createLayerGroup(overlay);
  if (overlay.legend !== undefined) {
    map.on("overlayadd", (eventLayer) => {
      if (eventLayer.name === overlay.name) {
        overlay.legend.addTo(map);
      }
    });
    map.on("overlayremove", (eventLayer) => {
      if (eventLayer.name === overlay.name) {
        map.removeControl(overlay.legend);
      }
    });
  }
  layerControl.addOverlay(layerGroup, overlay.name);
}
