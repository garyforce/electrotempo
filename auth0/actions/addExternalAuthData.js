const axios = require("axios").default;

/* Application Constants. Must be changed per-environment */
const audience = "https://api-dev.electrotempo.net/auth";
// userPermissionsEndpoint is also the permission's claim scope, which is required by Auth0
const userAuthDataEndpoint =
  "https://api-dev.electrotempo.net/auth/user-auth-data";
const auth0TenantUrl = "https://electrotempo-dev.us.auth0.com";

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const token = await getAuth0Token(
    api,
    event.secrets.clientId,
    event.secrets.clientSecret
  );

  const uri = encodeURI(
    `${userAuthDataEndpoint}?auth0UserId=${event.user.user_id}`
  );

  const response = await axios.get(uri, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  api.accessToken.setCustomClaim(
    `${audience}/user-permissions`,
    response.data.permissions
  );
  api.accessToken.setCustomClaim(
    `${audience}/org_id`,
    response.data.org_id
  );
};

const getAuth0Token = async (api, clientId, clientSecret) => {
  const cachedToken = api.cache.get("token")?.value;
  if (cachedToken && !isJwtExpired(cachedToken)) {
    console.log("Using cached token.");
    return cachedToken;
  }
  console.log("No valid cached token found. Requesting new token.");
  const response = await axios.post(`${auth0TenantUrl}/oauth/token`, {
    client_id: clientId,
    client_secret: clientSecret,
    audience: audience,
    grant_type: "client_credentials",
  });
  const token = response.data["access_token"];
  api.cache.set("token", token);
  console.log("Set new cached token.");
  return token;
};

function isJwtExpired(jwt) {
  const tokenParts = jwt.split(".");
  const payload = JSON.parse(
    Buffer.from(tokenParts[1], "base64").toString("utf-8")
  );

  if (!payload.exp) {
    return false;
  }

  const expirationDate = new Date(payload.exp * 1000);
  const currentDate = new Date();

  return currentDate.getTime() > expirationDate.getTime();
}
