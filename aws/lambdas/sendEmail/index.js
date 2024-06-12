const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.AWS_REGION });

function validateRequest(event) {
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

    const { subject, recipients, ccRecipients, bccRecipients, sender, bodyText } = body;

    if (!recipients) {
        errors.push('recipients is required');
    }
    if (!Array.isArray(recipients)) {
        errors.push('recipients must be an array');
    } else {
        if (recipients.length < 1) {
            errors.push('recipients must have 1 or more emails');
        }
    }

    if (ccRecipients) {
        if (!Array.isArray(ccRecipients)) {
            errors.push('ccRecipients must be an array');
        }
    }

    if (bccRecipients) {
        if (!Array.isArray(bccRecipients)) {
            errors.push('bccRecipients must be an array');
        }
    }

    if (!sender) {
        errors.push('sender is required');
    }

    return errors;
}

exports.handler = async (event, context) => {
    const errors = validateRequest(event);
    if (errors.length != 0) {
        console.error('Encountered errors while validating request:', errors);
        return {
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
            },
            statusCode: 400,
            isBase64Encoded: false,
            body: JSON.stringify({
                message: errors
            })
        };
    }
    console.log('Request parameters validated successfully');

    const body = JSON.parse(event.body);
    const recipients = body.recipients;
    const ccRecipients = body.ccRecipients;
    const bccRecipients = body.bccRecipients;
    const sender = body.sender;
    const subject = body.subject;
    const bodyText = body.bodyText;

    const params = {
        Destination: {
            ToAddresses: recipients,
            CcAddresses: ccRecipients,
            BccAddresses: bccRecipients
        },
        Message: {
            Body: {
                Text: { Data: bodyText },
            },
            Subject: { Data: subject },
        },
        Source: sender,
    };

    try {
        await ses.sendEmail(params).promise();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: 'Successfully sent email'
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 502,
            body: 'Failed to send email'
        }
    }
}