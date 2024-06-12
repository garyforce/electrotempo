import { useControl } from "react-map-gl";

import type { ControlPosition } from "react-map-gl";

class HomeButtonControl {
  props: HomeButtonProps;
  _container: HTMLDivElement;

  constructor(props: HomeButtonProps) {
    this.props = props;
    this._container = document.createElement("div");
  }

  onAdd(map: any) {
    this._container.className =
      "mapboxgl-ctrl mapboxgl-ctrl-group recenter-button";
    this._container.innerHTML = `<button>
      <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" style="font-size: 20px;"><title>Reset map</title><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
      </button>`;
    this._container.addEventListener("contextmenu", (e) => e.preventDefault());
    this._container.addEventListener("click", this.props.onClick);

    return this._container;
  }
  onRemove() {
    this._container.parentNode!.removeChild(this._container);
  }
  getDefaultPosition() {
    return "top-left";
  }
}

export type HomeButtonProps = {
  /** Placement of the control relative to the map. */
  position?: ControlPosition;
  /** Function to call when control is clicked */
  onClick: (event: Event) => void;
};

function HomeButton(props: HomeButtonProps) {
  useControl(() => new HomeButtonControl(props), {
    position: props.position,
  });

  return null;
}

export default HomeButton;
