import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Button } from "@mui/material";
import Dashboard from "./dashboard/Dashboard";
import Signup from "components/Signup";
import { Auth0Provider, withAuthenticationRequired } from "@auth0/auth0-react";
import { createBrowserHistory } from "history";
import { PermissionContextProvider } from "./dashboard/PermissionContext";
import { ThemeProvider } from "@mui/material/styles";
import electrotempoTheme from "dashboard/themes.tsx";
import { TourProvider } from "@reactour/tour";
import { Provider } from "react-redux";
import { store } from "./redux/store";

export const history = createBrowserHistory();

const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
};

const onRedirectCallback = (appState) => {
  // Use the router's history module to replace the url
  history.replace(appState?.returnTo || window.location.pathname);
};

const Auth0ProviderWithRedirectCallback = ({ children, ...props }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState) => {
    navigate((appState && appState.returnTo) || window.location.pathname);
  };
  return (
    <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </Auth0Provider>
  );
};

function TourNextButton(props) {
  const text = props.currentStep === props.stepsLength - 1 ? "Done" : "Next";

  function handleClick() {
    if (props.currentStep === props.stepsLength - 1) {
      props.setIsOpen(false);
    } else {
      props.setCurrentStep(props.currentStep + 1);
    }
  }

  return (
    <Button variant={"contained"} onClick={handleClick}>
      {text}
    </Button>
  );
}

function TourPrevButton(props) {
  function handleClick() {
    props.setCurrentStep(props.currentStep - 1);
  }

  return (
    <Button
      variant={"contained"}
      disabled={props.currentStep === 0}
      onClick={handleClick}
    >
      Back
    </Button>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Auth0ProviderWithRedirectCallback
        domain={process.env.REACT_APP_AUTH0_DOMAIN}
        clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
        redirectUri={window.location.origin}
        onRedirectCallback={onRedirectCallback}
        audience={process.env.REACT_APP_AUTH0_AUDIENCE}
      >
        <PermissionContextProvider>
          <Provider store={store}>
            <ThemeProvider theme={electrotempoTheme}>
              <TourProvider
                styles={{
                  badge: (base) => ({ ...base, background: "#05c2cc" }),
                  close: (base) => ({ ...base, color: "#aaa" }),
                  dot: (base, { current }) => ({
                    ...base,
                    background: current ? "#05c2cc" : "#ccc",
                  }),
                  popover: (base) => ({ ...base, sizes: { width: 500 } }),
                }}
                nextButton={TourNextButton}
                prevButton={TourPrevButton}
                disableInteraction
                scrollSmooth
                inViewThreshold={100}
              >
                <Routes>
                  <Route path="*" element={<Navigate to="/" replace />}></Route>
                  <Route
                    path="/"
                    element={<ProtectedRoute component={Dashboard} />}
                  ></Route>
                  <Route path="seco-signup" element={<Signup />}></Route>
                </Routes>
              </TourProvider>
            </ThemeProvider>
          </Provider>
        </PermissionContextProvider>
      </Auth0ProviderWithRedirectCallback>
    </BrowserRouter>
  );
}

export default App;
