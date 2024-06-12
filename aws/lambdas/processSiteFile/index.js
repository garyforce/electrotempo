const XLSX = require("xlsx");
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();
const electrotempoAuth = require("electrotempo-auth");
const database = process.env.DATABASE;
const schema = process.env.SCHEMA;
const DB_SECRET_NAME = process.env.DB_CREDENTIALS_SECRET_NAME;
const BUCKET = process.env.S3_BUCKET;
const JWT_PERMISSIONS_CLAIM = process.env.JWT_PERMISSIONS_CLAIM;

const ServerlessClient = require("serverless-postgres");
const format = require("pg-format");
const client = new ServerlessClient({});
let dbCredentials; // set in init

async function getSecret(secretName) {
  // Create a Secrets Manager client
  var secretsManager = new AWS.SecretsManager();

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

// Main Lambda entry point
exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const fileName = body.fileName;
  const siteCollectionName = body.siteCollectionName;
  const userId = electrotempoAuth.getUserIdFromToken(
    event.headers["Authorization"]
  );
  console.log(
    `Received request to process file ${fileName} into Site Collection '${siteCollectionName}' by user ${userId}`
  );

  let hasPermissions = true;
  hasPermissions &= electrotempoAuth.tokenHasPermission(
    event.headers["Authorization"],
    JWT_PERMISSIONS_CLAIM,
    "write:site_collections"
  );
  hasPermissions &= electrotempoAuth.tokenHasPermission(
    event.headers["Authorization"],
    JWT_PERMISSIONS_CLAIM,
    "write:sites"
  );
  if (!hasPermissions) {
    console.log("user has insufficient permissions on token");
    return {
      isBase64Encoded: false,
      statusCode: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        statusCode: 403,
        message: "Insufficient scope",
      }),
    };
  }

  if (siteCollectionName.length === 0) {
    return {
      isBase64Encoded: false,
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        statusCode: 400,
        message: "body.siteCollectionName is required",
      }),
    };
  }

  // request is valid, we can initialize now
  await init();

  const params = { Bucket: BUCKET, Key: fileName };
  const response = await s3.getObject(params).promise();
  console.log("Downloaded file");
  const file = response.Body;

  let sitesData;
  try {
    const workbook = XLSX.read(file.buffer);
    sitesData = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
  } catch (error) {
    console.error(error, error.stack);
    return {
      isBase64Encoded: false,
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        statusCode: 400,
        message: "Unable to parse uploaded file.",
      }),
    };
  }
  console.log(`File was parsed. Found ${sitesData.length} sites.`);

  sitesData = sitesData.map((obj) => standardizeSiteProperties(obj));
  const validation = validateSitesData(sitesData);
  if (!validation.success) {
    console.log(`File failed data validation: ${validation.message}`);
    return {
      isBase64Encoded: false,
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        statusCode: 400,
        message: validation.message,
      }),
    };
  }
  console.log("File passed data validation");

  /* create extra field */
  const defaultKeys = ["name", "lat", "lng", "score"];
  sitesData.forEach((site) => {
    const extra = {};
    for (const [key, value] of Object.entries(site)) {
      if (!defaultKeys.includes(key)) {
        extra[key] = value;
      }
    }
    site.extra = extra;
  });

  try {
    await client.query("BEGIN");

    const userOrgIdResults = await client.query(
      `SELECT organization_id
        FROM et_auth."v_user" u 
        JOIN et_auth.v_user_organization uo ON uo.user_id = u.id 
        WHERE u.auth0_id = $1;`,
      [userId]
    );
    const userOrgId = userOrgIdResults.rows[0].organization_id;
    console.log("Retrieved user organizationId from database");

    const siteCollectionQuery = `INSERT INTO ${schema}.site_collection (name, source, organization_id, inserted_by)
            VALUES ($1, $2, $3, $4)
            RETURNING id;`;
    const siteCollectionValues = [
      siteCollectionName,
      `S3://${BUCKET}/${fileName}`,
      userOrgId,
      userId,
    ];
    const siteCollectionResults = await client.query(
      siteCollectionQuery,
      siteCollectionValues
    );
    const newSiteCollectionId = siteCollectionResults.rows[0].id;
    console.log(
      `Added new site collection to database with id=${newSiteCollectionId}`
    );

    const query = `INSERT INTO ${schema}.site (name, geom, score, extra, site_collection_id, inserted_by) VALUES %L`;
    const values = sitesData.map((site) => {
      return [
        site.name,
        `POINT(${site.lng} ${site.lat})`,
        site.score,
        site.extra,
        newSiteCollectionId,
        userId,
      ];
    });
    await client.query(format(query, values), []);
    console.log(
      `Added new sites to database with site_collection_id=${newSiteCollectionId}`
    );

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

  return {
    isBase64Encoded: false,
    statusCode: 201,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

/**
 * Returns a new object from the old one with the properties lowercased.
 */
function objectKeysToLowerCase(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])
  );
}

/**
 * Assigns site.lat and site.lng if similar properties are present on the object.
 * It will also convert all property names to lowercase.
 * @param {object} site the site to standardize
 * @returns a new site object with site.lat and site.lng
 */
function standardizeSiteProperties(site) {
  site = objectKeysToLowerCase(site);
  site.lng = site.lng || site.long || site.longitude;
  site.lat = site.lat || site.latitude;
  return site;
}

function validateSitesData(sitesData) {
  // make sure we have data
  if (sitesData.length === 0) {
    return {
      success: false,
      message: `There are no data rows in the provided file`,
    };
  }

  for (let i = 0; i < sitesData.length; i++) {
    const site = sitesData[i];
    const hasName = site.name && site.name.toString().length > 0;
    if (!hasName) {
      return {
        success: false,
        message: `Error on row ${i + 1}: every site must have a name`,
      };
    }
    const isValidLat = site.lat >= -90 && site.lat <= 90;
    if (!isValidLat) {
      return {
        success: false,
        message: `Error on row ${
          i + 1
        }: lat must be between -90 and 90, inclusive`,
      };
    }
    const isValidLng = site.lng >= -180 && site.lng <= 180;
    if (!isValidLng) {
      return {
        success: false,
        message: `Error on row ${
          i + 1
        }: lng must be between -180 and 180, inclusive`,
      };
    }
    const scoreIsNumber = typeof site.score === "number";
    if (!scoreIsNumber) {
      return {
        success: false,
        message: `Error on row ${i + 1}: score must be a number`,
      };
    }
  }
  return {
    success: true,
  };
}
