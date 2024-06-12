import React, { createContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const scope: string =
  process.env.REACT_APP_AUTH_PERMISSION_SCOPE || "permissions";

type PermissionContextType = string[];

const PermissionContext = createContext([] as PermissionContextType);

type PermissionContextProviderProps = {
  children: JSX.Element;
};

/**
 * Context provider for PermissionContext.
 *
 * Makes a call to the `/auth/user-permissions` endpoint to fetch permissions.
 */
const PermissionContextProvider = ({
  children,
}: PermissionContextProviderProps) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchMyData = async () => {
      const token: any = await getAccessTokenSilently();
      const tokenParts = token.split(".");
      const claims = JSON.parse(atob(tokenParts[1]));
      const tokenPermissions = claims[scope];
      if (tokenPermissions) {
        setPermissions(tokenPermissions);
      } else {
        console.error("Error fetching permissions.");
      }
    };

    if (isAuthenticated) {
      fetchMyData();
    }
    // disabling eslint on next line because we intentionally only want to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
};

const usePermissions = () => React.useContext(PermissionContext);

export { PermissionContextProvider, usePermissions };
