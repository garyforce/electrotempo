const AWS = require('aws-sdk');
const electrotempoAuth = require('electrotempo-auth');

const region = process.env.AWS_REGION;

const database = process.env.DATABASE;
const schema = process.env.SCHEMA;
const DB_SECRET_NAME = process.env.DB_CREDENTIALS_SECRET_NAME;

async function getSecret(secretName) {
    // Create a Secrets Manager client
    var secretsManager = new AWS.SecretsManager({
        region: region
    });

    return new Promise((resolve, reject) => {
        secretsManager.getSecretValue({ SecretId: secretName }, function (err, data) {
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

const validateRequest = (event) => {
    let errors = [];
    if (!event.body) {
        errors.push('body is required');
        // short circuit return here because we can't parse an empty body
        return errors;
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        console.error(error, error.stack);
        errors.push('unable to parse request body');
        // short circuit return here because we can't parse invalid JSON
        return errors;
    }

    const status = body.status;
    const awsUuid = event.queryStringParameters?.awsUuid;

    if (awsUuid === undefined) {
        errors.push('querystring parameter awsUuid is required');
    }
    if (awsUuid === '') {
        errors.push('querystring parameter awsUuid must not be empty');
    }
    if (status === undefined) {
        errors.push('body.status is required');
    }
    if (status === '') {
        errors.push('body.status must not be empty')
    }
    return errors;
}

exports.handler = async (event) => {
    const errors = validateRequest(event);
    if (errors.length != 0) {
        console.error('Encountered errors while validating request parameters', errors);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: errors
            })
        };
    }
    console.log('Request parameters validated successfully');

    // request is valid, we can initialize now
    await init();

    const body = JSON.parse(event.body);
    const status = body.status;
    const awsUuid = event.queryStringParameters?.awsUuid;
    const userId = electrotempoAuth.getUserIdFromToken(event.headers['Authorization']);

    console.log(`Function call parameters: ${JSON.stringify({ awsUuid, status, userId })}`);

    try {
        client.setConfig({
            user: dbCredentials.username,
            password: dbCredentials.password
        });
        await client.connect();
        console.log("Connected to database");
        const query = `UPDATE ${schema}.traffic_model
                    SET status = $1, updated = NOW(), updated_by = $2
                    WHERE aws_uuid = $3;`;
        const values = [status, userId, awsUuid];
        await client.query(query, values);
        console.log("Queried database");
        await client.clean();
        console.log("Cleaned up database connection");
    }
    catch (err) {
        console.error(err, err.stack);
        return {
            statusCode: 502,
            body: JSON.stringify({
                message: 'internal server error'
            })
        }
    }

    const response = {
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        statusCode: 200
    };
    return response;
};
