// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// Load the AWS SDK
const AWS = require("aws-sdk");
const electrotempoAuth = require("electrotempo-auth");

const region = process.env.AWS_REGION;

const database = process.env.DATABASE;
const schema = process.env.SCHEMA;
const DB_SECRET_NAME = process.env.DB_CREDENTIALS_SECRET_NAME;

async function getSecret(secretName) {
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

  const {
    name,
    description,
    modelType,
    modelYear,
    modelSource,
    replicates,
    location,
    numVehicles,
    awsUuid,
    hasNodesFile,
  } = body;

  const integerRegex = /^\d+$/;

  // name checking
  if (name === undefined) {
    errors.push("body.name is required");
  }
  if (name === "") {
    errors.push("body.name must not be an empty string");
  }

  // traffic model type checking
  if (modelType === undefined) {
    errors.push("body.modelType is required");
  }
  if (!["dynust", "4step", "Mobiliti"].includes(modelType)) {
    errors.push(
      'body.modelType must be one of "4step", "dynust", or "Mobiliti"'
    );
  }

  // validate modelYear
  if (!modelYear) {
    errors.push("body.modelYear is required");
  }
  if (!integerRegex.test(modelYear)) {
    errors.push("body.modelYear must be an integer");
  }
  if (modelYear < 2010 || modelYear > 2050) {
    errors.push("body.modelYear must be between 2010 and 2050, inclusive");
  }

  // validate modelSource
  if (modelSource === undefined) {
    errors.push("body.modelSource is required");
  }
  if (!["Mobiliti", "MPO", "Statewide"].includes(modelSource)) {
    errors.push(
      'body.modelSource must be one of "Mobiliti", "MPO", or "Statewide"'
    );
  }

  // validate replicates
  if (replicates === undefined) {
    errors.push("body.replicates is required");
  }
  const minReplicates = 1;
  const maxReplicates = 50;
  if (!integerRegex.test(replicates)) {
    errors.push("body.replicates must be an integer");
  }
  const numReplicates = parseInt(replicates);
  if (numReplicates < minReplicates || numReplicates > maxReplicates) {
    errors.push(
      `body.replicates must be at least ${minReplicates} and at most ${maxReplicates}`
    );
  }

  // validate location
  if (location === undefined) {
    errors.push("body.location is required");
  }
  if (!integerRegex.test(location)) {
    errors.push("body.location must be an integer");
  }

  // validate numVehicles
  if (numVehicles === undefined) {
    errors.push("body.numVehicles is required");
  }
  const minNumVehicles = 1;
  if (!integerRegex.test(numVehicles)) {
    errors.push("body.numVehicles must be an integer");
  }
  const numVehiclesInt = parseInt(numVehicles);
  if (numVehiclesInt < minNumVehicles) {
    errors.push(`body.numVehicles must be at least ${minNumVehicles}`);
  }

  // validate awsUuid
  if (awsUuid === undefined) {
    errors.push("body.awsUuid is required");
  }
  if (awsUuid === "") {
    errors.push("body.awsUuid must not be an empty string");
  }
  // validate hasNodesFile
  if (hasNodesFile === undefined) {
    errors.push("body.hasNodesFile is required");
  }
  if (typeof hasNodesFile !== "boolean") {
    errors.push("body.hasNodesFile must be a boolean");
  }

  return errors;
};

exports.handler = async (event) => {
  const errors = validateRequest(event);
  if (errors.length != 0) {
    console.error("Encountered errors while validating request:", errors);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
      },
      statusCode: 400,
      isBase64Encoded: false,
      body: JSON.stringify({
        message: errors,
      }),
    };
  }
  console.log("Request parameters validated successfully");

  // request is valid, we can initialize now
  await init();

  const {
    name,
    description,
    modelType,
    modelYear,
    modelSource,
    replicates,
    location,
    numVehicles,
    awsUuid,
    hasNodesFile,
  } = JSON.parse(event.body);
  const userId = electrotempoAuth.getUserIdFromToken(
    event.headers["Authorization"]
  );
  console.log(
    `Function call parameters: ${JSON.stringify({
      name,
      description,
      modelType,
      modelYear,
      modelSource,
      replicates,
      location,
      numVehicles,
      awsUuid,
      hasNodesFile,
      userId,
    })}`
  );

  // check if description was provided
  const hasDescription = description !== undefined && description !== "";

  try {
    let query = `INSERT INTO ${schema}.traffic_model (name, model_type, replicates, aws_uuid, status, created, updated, created_by, active, has_nodes_file)
                VALUES ($1, $2, $3, $4, 'Submitted', NOW(), NULL, $5, true, $6);`;
    const values = [name, modelType, replicates, awsUuid, userId, hasNodesFile];
    let query2 = `INSERT INTO et_prod.traffic_model (name, description, model_year, location_id, num_vehicles, model_type, model_source, inserted_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
    const values2 = [
      name,
      hasDescription ? description : null,
      modelYear,
      location,
      numVehicles,
      modelType,
      modelSource,
      userId,
    ];
    await client.query(query, values);
    console.log("Query 1 executed successfully");
    await client.query(query2, values2);
    console.log("Query 2 executed successfully");
    await client.clean();
    console.log("Cleaned up database connection");
  } catch (err) {
    console.error(err, err.stack);
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
    statusCode: 201,
    body: JSON.stringify({
      status: 201,
      message: "success",
    }),
    isBase64Encoded: false,
  };
  return response;
};
