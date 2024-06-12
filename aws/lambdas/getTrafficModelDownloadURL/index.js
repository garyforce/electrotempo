const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

// Constants
const BUCKET = process.env.S3_BUCKET;
const URL_EXPIRATION_SECONDS = 3600;

// Main Lambda entry point
exports.handler = async (event, context) => {
  let awsUuid = event.queryStringParameters?.awsUuid;
  const downloadType = event.queryStringParameters?.downloadType;

  let key;
  if (downloadType === "nodal_demand") {
    key = `${awsUuid}/simulation_results/combinedDemand.csv.gz`;
  } else if (downloadType === "block_group_demand") {
    key = `${awsUuid}/simulation_results/block_group_demand.csv.gz`;
  } else {
    return {
      isBase64Encoded: false,
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: `downloadType must be either 'nodal_demand' or 'block_group_demand'`,
    };
  }

  const url = await s3.getSignedUrlPromise("getObject", {
    Bucket: BUCKET,
    Key: key,
    Expires: URL_EXPIRATION_SECONDS,
  });
  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ url: url }),
  };
};
