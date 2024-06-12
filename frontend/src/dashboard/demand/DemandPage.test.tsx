import ReactDOM from "react-dom";
import DemandPage from "./DemandPage";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const mapContainer = document.createElement("div");
  mapContainer.id = "map";
  document.body.appendChild(mapContainer);

  ReactDOM.render(<DemandPage />, div);
});
