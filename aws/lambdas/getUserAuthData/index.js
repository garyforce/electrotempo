const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;

const database = process.env.DATABASE;
const schema = process.env.SCHEMA;
const DB_SECRET_NAME = process.env.DB_CREDENTIALS_SECRET_NAME;

async function getSecret(secretName, region) {
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

exports.handler = async (event) => {
    await init();
    
    const userId = event.queryStringParameters?.auth0UserId;
    
    console.log(`Received request for permissions of user ${userId}`);

    if (userId === undefined) {
        const response = {
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
            },
            statusCode: 400,
            isBase64Encoded: false,
            body: JSON.stringify({
                message: 'Querystring parameter auth0UserId is required'
            })
        };
        console.log('Returning response: ' + JSON.stringify(response));
        return response;
    }
    // user ID might have special components like | that have been encoded
    const decodedUserId = decodeURIComponent(userId);
    
    let permissionsResults;
    let organizationResults;
    try {
        let permissionsQuery = `select p."permission"
            from ${schema}."v_user" as u
            join ${schema}."v_user_role" ur on ur.user_id = u.id 
            join ${schema}."v_role" r on r.id = ur.role_id 
            join ${schema}."v_role_permission" rp on rp.role_id = r.id 
            join ${schema}."v_permission" p on p.id = rp.permission_id
            where u.auth0_id = $1;`;
        permissionsResults = await client.query(permissionsQuery, [decodedUserId]);
        console.log(`Permission query results: ${JSON.stringify(permissionsResults)}`);
        let organizationQuery = `select organization_id from ${schema}.v_user_organization vuo
            join ${schema}.v_user vu on vu.id = vuo.user_id
            where vu.auth0_id = $1;`;
        organizationResults = await client.query(organizationQuery, [decodedUserId]);
        await client.clean();
        console.log("Cleaned up database connection");
    }
    catch (err) {
        console.error('Database: ' + err);
        return {
            statusCode: 502
        }
    }

    const returnObj = {
        results: permissionsResults.rows.length,
        permissions: permissionsResults.rows.map(row => row.permission),
        org_id: organizationResults.rows.length > 0 ? organizationResults.rows[0].organization_id : null
    }

    const response = {
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        statusCode: 200,
        isBase64Encoded: false,
        body: JSON.stringify(returnObj)
    };
    
    console.log('Returning response: ' + JSON.stringify(response));
    
    return response;
}