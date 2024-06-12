const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

// Constants
const BUCKET = process.env.S3_BUCKET;
const URL_EXPIRATION_SECONDS = 3600;

// Main Lambda entry point
exports.handler = async (event, context) => {
  const requestId = context.awsRequestId;

  const zipFilename = `${requestId}/input_files.zip`;
  const zipFileParts = event.queryStringParameters.numFileParts;
  const zipUploadId = await initiateMultipartUpload(event, zipFilename);
  const zipUploadUrls = await generatePresignedUrlsParts(
    zipUploadId,
    zipFileParts,
    zipFilename
  );

  const simulationParametersFilename = `${requestId}/simulation_parameters.json`;
  const simulationParametersFileParts = 1;
  const simulationParametersUploadId = await initiateMultipartUpload(
    event,
    simulationParametersFilename
  );
  const simulationParametersUploadUrls = await generatePresignedUrlsParts(
    simulationParametersUploadId,
    simulationParametersFileParts,
    simulationParametersFilename
  );

  let body = {
    uuid: requestId,
    zipUpload: {
      filename: zipFilename,
      uploadId: zipUploadId,
      urls: zipUploadUrls,
    },
    simulationParametersUpload: {
      filename: simulationParametersFilename,
      uploadId: simulationParametersUploadId,
      urls: simulationParametersUploadUrls,
    },
  };

  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
};

const initiateMultipartUpload = async function (event, filename) {
  const params = {
    Bucket: BUCKET,
    Key: filename,
  };

  const res = await s3.createMultipartUpload(params).promise();
  return res.UploadId;
};

async function generatePresignedUrlsParts(uploadId, parts, filename) {
  const baseParams = {
    Bucket: BUCKET,
    Key: filename,
    Expires: URL_EXPIRATION_SECONDS,
    UploadId: uploadId,
  };

  const promises = [];

  for (let part = 0; part < parts; part++) {
    promises.push(
      s3.getSignedUrlPromise("uploadPart", {
        ...baseParams,
        PartNumber: part + 1,
      })
    );
  }

  return await Promise.all(promises);
}
