import ReactDOM from "react-dom";
import DemandDensityControl from "./DemandDensityControl";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<DemandDensityControl checked={true} />, div);
  ReactDOM.render(<DemandDensityControl checked={false} />, div);
});
