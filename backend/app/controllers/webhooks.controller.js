const fetch = require("node-fetch");
const service = require("../services/webhooks.service");

async function handleSNSNotifications(req, res, next) {
  try {
    if (
      req.header("user-agent") !== "Amazon Simple Notification Service Agent"
    ) {
      return res.status(403).send("Unauthorized");
    }

    const payload = JSON.parse(req.body);
    console.log(
      `Received SNS Notification: ${JSON.stringify({
        headers: req.headers,
        body: payload,
      })}`
    );

    if (req.header("x-amz-sns-message-type") === "SubscriptionConfirmation") {
      const url = payload.SubscribeURL;
      const response = await fetch(url);
      if (response.ok) {
        console.log("Accepted SNS confirmation from AWS");
      } else {
        console.error("Error on confirming SNS subscription from AWS");
      }
    } else if (req.header("x-amz-sns-message-type") === "Notification") {
      const { requestPayload, responsePayload } = JSON.parse(payload.Message);
      service.directPayloadToService(requestPayload, responsePayload);
    } else {
      throw new Error(`Invalid message type ${payload.Type}`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Oops! Something went wrong...");
  }
  return res.send("OK");
}

module.exports = {
  handleSNSNotifications,
};
