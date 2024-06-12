import fetch from "cross-fetch";
import { fromEnv } from "@aws-sdk/credential-providers";
import {
  InvocationType,
  InvokeCommand,
  InvokeCommandInput,
  LambdaClient,
} from "@aws-sdk/client-lambda";
import { getEnv } from "./services/webhooks.service";

export const SERVICE_TYPE_TERMINAL = "TERMINAL";

export type ServiceType = "TERMINAL";

export const invokeTerminalCalculator = async (
  authorizationHeader: string,
  payload: object
): Promise<boolean> => {
  if (!process.env.TERMINAL_CALCULATOR_ENDPOINT) {
    const errorMessage = "Missing environment variable TERMINAL_CALCULATOR_ENDPOINT";
    console.warn(errorMessage);

    if (process.env.DB_HOST !== 'localhost') {
      throw new Error(errorMessage);
    }
    return false;
  }

  await invokeLambdaEndpoint(
    SERVICE_TYPE_TERMINAL,
    process.env.TERMINAL_CALCULATOR_ENDPOINT,
    authorizationHeader,
    payload
  );

  return true;
};

const lambdaClient = new LambdaClient({
  credentials: fromEnv(),
});

type LambdaPayload = {
  service: ServiceType;
  environment: string;
  inputParams: any;
};

export const invokeLambdaEndpoint = async (
  serviceType: ServiceType,
  endpointUrl: string,
  authorizationHeader: string,
  payload: object,
): Promise<any> => {
  const lambdaPayload: LambdaPayload = {
    service: serviceType,
    environment: getEnv(),
    inputParams: payload,
  };

  return await fetch(endpointUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lambdaPayload),
  });
};

const invokeLambda = async (
  functionName: string,
  serviceType: ServiceType,
  payload: object,
  invocationType: InvocationType = "RequestResponse"
): Promise<boolean> => {
  const lambdaPayload: LambdaPayload = {
    service: serviceType,
    environment: getEnv(),
    inputParams: payload,
  };

  const input: InvokeCommandInput = {
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: JSON.stringify(lambdaPayload),
  };

  const command = new InvokeCommand(input);
  const response = await lambdaClient.send(command);

  if (response.StatusCode !== 202 || !response.Payload) {
    console.error(
      `Error invoking lambda function ${functionName}: ${JSON.stringify(
        response
      )}`
    );
    throw new Error(`Error invoking lambda function ${functionName}`);
  }

  return true;
};

const invokeAsyncLambda = async (
  functionName: string,
  serviceType: ServiceType,
  payload: object
): Promise<boolean> => {
  return await invokeLambda(functionName, serviceType, payload, "Event");
};
