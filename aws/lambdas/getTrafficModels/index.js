var AWS = require('aws-sdk'),
    region = process.env.AWS_REGION;

const database = process.env.DATABASE;
const schema = process.env.SCHEMA;
const DB_SECRET_NAME = process.env.DB_CREDENTIALS_SECRET_NAME;
async function getSecret(secretName) {
    // Create a Secrets Manager client
    var secretsManager = new AWS.SecretsManager({
        region: region
    });

    return new Promise((resolve, reject) => {
        secretsManager.getSecretValue({ SecretId: secretName }, function(err, data) {
            if (err) {
                reject(err);
            }
            else {
                // Decrypts secret using the associated KMS CMK.
                // Depending on whether the secret is a string or binary, one of these fields will be populated.
                if ('SecretString' in data) {
                    resolve(JSON.parse(data.SecretString));
                }
                else {
                    let buff = new Buffer(data.SecretBinary, 'base64');
                    resolve(buff.toString('ascii'));
                }
            }
        });
    });
}

const ServerlessClient = require('serverless-postgres');
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
        idleTimeoutMillis: 30000
    }
    client.setConfig(dbConfig);
    await client.connect();
    console.log("Connected to database");
};

exports.handler = async (event) => {
    await init();

    let dbResults;
    try {
        let query = `SELECT id, name, model_type, replicates, aws_uuid, status, created, updated, has_nodes_file
                    FROM ${schema}.traffic_model
                    WHERE active = true;`;
        dbResults = await client.query(query);
        console.log("Queried database");
        await client.clean();
        console.log("Cleaned up database connection");
    }
    catch (err) {
        console.error('Database: ' + err);
        return {
            statusCode: 502
        }
    }

    const response = {
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        statusCode: 200,
        body: JSON.stringify(dbResults.rows)
    };
    return response;
};
