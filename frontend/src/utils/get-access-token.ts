import { useAuth0 } from "@auth0/auth0-react";

const parseJwt = (token: string) =>
  token && JSON.parse(atob(token.split(".")[1]));

export const useAccessToken = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  if (!isAuthenticated) {
    throw new Error("User is not authenticated");
  }

  const appUrl = process.env.REACT_APP_HOME_URL;
  const environment = appUrl?.includes("localhost")
    ? "localhost"
    : appUrl?.includes("development")
    ? "development"
    : appUrl?.includes("staging")
    ? "staging"
    : "production";

  const fetchAccessTokenFromCache = async () => {
    const encryptedEnvironment = btoa(environment);
    const apiToken = localStorage.getItem(
      `${user?.sub}-${encryptedEnvironment}-accesstoken`
    );

    if (apiToken && environment === "localhost") {
      const parsedToken = parseJwt(apiToken);
      if (parsedToken?.exp > Date.now() / 1000) {
        return apiToken;
      }
    }

    const newToken = await getAccessTokenSilently();
    localStorage.setItem(
      `${user?.sub}-${encryptedEnvironment}-accesstoken`,
      newToken
    );
    return newToken;
  };

  if (environment !== "localhost") {
    return { getToken: getAccessTokenSilently };
  } else {
    return { getToken: fetchAccessTokenFromCache };
  }
};
