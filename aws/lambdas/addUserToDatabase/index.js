const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;

const database = process.env.DATABASE;
const schema = process.env.SCHEMA;
const DB_SECRET_NAME = process.env.DB_CREDENTIALS_SECRET_NAME;

async function getSecret(secretName, region) {
  // Create a Secrets Manager client
  var secretsManager = new AWS.SecretsManager({
    region: region,
  });

  return new Promise((resolve, reject) => {
    secretsManager.getSecretValue(
      { SecretId: secretName },
      function (err, data) {
        if (err) {
          reject(err);
        } else {
          // Decrypts secret using the associated KMS CMK.
          // Depending on whether the secret is a string or binary, one of these fields will be populated.
          if ("SecretString" in data) {
            resolve(JSON.parse(data.SecretString));
          } else {
            let buff = new Buffer(data.SecretBinary, "base64");
            resolve(buff.toString("ascii"));
          }
        }
      }
    );
  });
}

const ServerlessClient = require("serverless-postgres");
const client = new ServerlessClient({});
let dbCredentials; // set in init

const init = async () => {
  dbCredentials = await getSecret(DB_SECRET_NAME);
  const dbConfig = {
    host: dbCredentials.host,
    port: dbCredentials.port,
    user: dbCredentials.username,
    password: dbCredentials.password,
    database: database,
    max: 20,
    idleTimeoutMillis: 30000,
  };
  client.setConfig(dbConfig);
  await client.connect();
  console.log("Connected to database");
};

/**
 * Validate an email matches anystring@anystring.anystring. Not RFC2822
 * compliant, only catches silly mistakes.
 * @param {string} email an email to test for validity
 * @returns a boolean if the email matches anystring@anystring.anystring
 */
function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

const validateRequest = (event) => {
  let errors = [];

  if (!event.body) {
    errors.push("body is required");
    // short circuit return here because we can't parse an empty body
    return errors;
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error(error, error.stack);
    errors.push("unable to parse request body");
    // short circuit return here because we can't parse invalid JSON
    return errors;
  }

  const auth0UserId = body.auth0UserId;
  if (auth0UserId === undefined) {
    errors.push("body.auth0UserId is required");
  }
  if (auth0UserId === "") {
    errors.push("body.auth0UserId must not be an empty string");
  }

  const email = body.email;
  if (email === undefined) {
    errors.push("body.email is required");
  } else {
    if (email === "") {
      errors.push("body.email must not be an empty string");
    }
    if (!validateEmail(email)) {
      errors.push(`${email} is not a valid email`);
    }
  }

  return errors;
};

exports.handler = async (event) => {
  const errors = validateRequest(event);
  if (errors.length != 0) {
    console.error(
      "Encountered errors while validating request parameters",
      errors
    );
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: errors,
      }),
    };
  }
  console.log("Request parameters validated successfully");

  // request is valid, we can initialize now
  await init();

  const body = JSON.parse(event.body);
  const auth0UserId = decodeURIComponent(body.auth0UserId);
  const email = decodeURIComponent(body.email);
  // if signupSource is undefined, set to null
  const signupSource =
    body.signupSource === undefined
      ? null
      : decodeURIComponent(body.signupSource);

  console.log(
    `Received request to add user ${auth0UserId} with email ${email} to database`
  );

  try {
    await client.query("BEGIN");

    let userQuery = `insert into ${schema}."user" (auth0_id, email, created_by, signup_source)
            values ($1, $2, $3, $4)
            RETURNING id`;
    const userResults = await client.query(userQuery, [
      auth0UserId,
      email,
      "Auth0 Trigger",
      signupSource,
    ]);
    const newUserId = userResults.rows[0].id;
    console.log(`Created new user with id ${newUserId}`);

    let orgQuery = `insert into ${schema}."organization" (name, created_by)
        values ($1, $2)
        RETURNING id`;
    const orgResults = await client.query(orgQuery, [
      `org-${auth0UserId}`,
      "Auth0 Trigger",
    ]);
    const newOrgId = orgResults.rows[0].id;
    console.log(`Created new organization with id ${newOrgId}`);

    let userOrgQuery = `insert into ${schema}."user_organization" (user_id, organization_id, created_by)
        values ($1, $2, $3)
        RETURNING id`;
    const userOrgResults = await client.query(userOrgQuery, [
      newUserId,
      newOrgId,
      "Auth0 Trigger",
    ]);
    const newUserOrgId = userOrgResults.rows[0].id;
    console.log(
      `Created new user-organization mapping with id ${newUserOrgId}`
    );

    if (body.selectedEvInsitesLocation !== undefined) {
      const selectedEvInsitesLocation = decodeURIComponent(
        body.selectedEvInsitesLocation
      );
      // There's no current logical linkage between et_prod.location and the
      // permissions that are associated with them, so the have to be hardcoded
      // while I don't have the bandwidth to re-engineer how location permissions
      // work.
      let roleId;
      if (selectedEvInsitesLocation.toUpperCase() === "HOUSTON") {
        roleId = 1;
      } else if (selectedEvInsitesLocation.toUpperCase() === "AUSTIN") {
        roleId = 46;
      } else {
        throw new Error(
          `The ID for location ${selectedEvInsitesLocation} is unknown.`
        );
      }

      let userRoleQuery = `INSERT INTO et_auth.user_role(user_id,role_id,created_by) VALUES($1,$2,$3) RETURNING id;`;
      const userRoleResults = await client.query(userRoleQuery, [
        newUserId,
        roleId,
        "Auth0 Trigger",
      ]);
      const newUserRoleId = userRoleResults.rows[0].id;
      console.log(
        `Added role ${roleId} to user ${newUserId} on user_role entry ${newUserRoleId}`
      );
    }

    await client.query("COMMIT");
    console.log("Query executed successfully");
    await client.clean();
    console.log("Cleaned up database connection");
  } catch (err) {
    console.error(err, err.stack);
    await client.query("ROLLBACK");
    return {
      statusCode: 502,
      body: JSON.stringify({
        message: "The application encountered an error.",
      }),
    };
  }

  const response = {
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
    },
    statusCode: 204,
    isBase64Encoded: false,
  };

  console.log("Returning response: " + JSON.stringify(response));

  return response;
};
