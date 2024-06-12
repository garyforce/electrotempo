// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// Load the AWS SDK
var AWS = require('aws-sdk');

const s3 = new AWS.S3();
const BUCKET = process.env.S3_BUCKET;

exports.handler = async (event) => {
    console.log(event);
    const body = JSON.parse(event.body);
    const params = {
        Bucket: BUCKET,
        Key: body.filename,
        MultipartUpload: {
            Parts: body.parts
        },
        UploadId: body.uploadId
    }

    const data = await s3.completeMultipartUpload(params).promise();

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(data)
    };
};
