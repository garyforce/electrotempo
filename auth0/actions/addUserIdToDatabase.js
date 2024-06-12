const axios = require("axios").default;

/* Application Constants. Must be changed per-environment */
const audience = "https://api-dev.electrotempo.net/auth";
const userEndpoint = "https://api-dev.electrotempo.net/auth/user";
const auth0TenantUrl = "https://electrotempo-dev.us.auth0.com";

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostUserRegistration = async (event) => {
  const token = await getAuth0Token(
    event.secrets.clientId,
    event.secrets.clientSecret
  );
  console.log("Successfuly retrieved API token.");

  const body = {
    auth0UserId: event.user.user_id,
    email: event.user.email,
    signupSource: event.user.app_metadata?.signupSource,
    selectedEvInsitesLocation:
      event.user.app_metadata?.selectedEvInsitesLocation,
  };

  await axios.post(userEndpoint, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(`Successfully added user ${event.user.user_id}`);
};

const getAuth0Token = async (clientId, clientSecret) => {
  const response = await axios.post(`${auth0TenantUrl}/oauth/token`, {
    client_id: clientId,
    client_secret: clientSecret,
    audience: audience,
    grant_type: "client_credentials",
  });
  return response.data["access_token"];
};
