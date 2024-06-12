import { Auth0Provider } from "@auth0/auth0-react";
import ReactDOM from "react-dom";
import CoveragePage from "./CoveragePage";

jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: (props: any) => "<div>{props.children}</div>",
}));

it("renders without crashing", () => {
  const div = document.createElement("div");
  const mapContainer = document.createElement("div");
  mapContainer.id = "map";
  document.body.appendChild(mapContainer);

  ReactDOM.render(
    <Auth0Provider
      domain={""}
      clientId={""}
      redirectUri={window.location.origin}
    >
      <CoveragePage />
    </Auth0Provider>,
    div
  );
});
