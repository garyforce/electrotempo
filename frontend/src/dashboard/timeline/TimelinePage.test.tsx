import { Auth0Provider } from "@auth0/auth0-react";
import ReactDOM from "react-dom";
import TimelinePage from "./TimelinePage";

jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: (props: any) => "<div>{props.children}</div>",
}));

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Auth0Provider
      domain={""}
      clientId={""}
      redirectUri={window.location.origin}
    >
      <TimelinePage
        setCustomUpdate={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </Auth0Provider>,
    div
  );
});
