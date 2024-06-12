const fetch = require("cross-fetch");
const logger = require("winston");
const utils = require("../utils.js");
const locationService = require("../services/location.service");

module.exports = (app) => {
  app.post("/seco-users", postSecoUser);
};

async function postSecoUser(request, response) {
  const { email, password, location } = request.body;

  let allLocations;
  try {
    allLocations = await locationService.getAll();
  } catch (error) {
    logger.error(error);
    response
      .status(500)
      .send({
        message:
          "An error occurred. If this persists, please contact ElectroTempo support.",
      });
    return;
  }
  const matchingLocations = allLocations.filter((dbLocation) =>
    utils.caseInsensitiveEquals(dbLocation.name, location)
  );
  if (matchingLocations.length < 1) {
    const message = `Location ${location} not found.`;
    logger.error(message);
    response.status(400).send({ message: message });
    return;
  }

  const endpoint = `${process.env.AUTH0_TENANT}oauth/token`;
  const auth0Response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_MANAGEMENT_API_AUDIENCE,
      grant_type: "client_credentials",
    }),
  });
  if (!auth0Response.ok) {
    logger.error(
      `Couldn't retrieve management API token. Response:\n${await auth0Response.text()}`
    );
    response.status(500).send("Error adding new user");
    return;
  }
  const auth0Data = await auth0Response.json();
  const apiToken = auth0Data["access_token"];
  const addUserResponse = await fetch(
    `${process.env.AUTH0_MANAGEMENT_API_AUDIENCE}users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connection: "Username-Password-Authentication",
        email: email,
        password: password,
        app_metadata: {
          signupSource: "SECO Signup",
          selectedEvInsitesLocation: location,
        },
      }),
    }
  );
  const addUserData = await addUserResponse.json();
  if (!addUserResponse.ok) {
    logger.error(`Couldn't add new user ${email}: ${addUserData.message}`);
    const statusCode = 400;
    response.status(statusCode).send(
      JSON.stringify({
        statusCode: statusCode,
        message: addUserData.message,
      })
    );
    return;
  }
  logger.info(`Successfully added user with email ${email}`);

  const statusCode = 200;
  response.status(statusCode).send({
    statusCode: statusCode,
    message: "Successfully added user.",
  });
  return;
}
