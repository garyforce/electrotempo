import { SERVICE_TYPE_TERMINAL } from "../lambda";
import { handleTerminalWebhook } from "./terminal/terminal-webhook.service";

type WebhookRequestPayload = {
  service: string;
  environment: string;
  inputParams: any;
};

export const directPayloadToService = async (
  requestPayload: WebhookRequestPayload,
  responsePayload: any
) => {
  const { service, environment, inputParams } = requestPayload;

  const currentEnv = getEnv();
  if (environment !== currentEnv) {
    console.warn(`Ignoring events for other environments: ${environment}`);
    return;
  }

  switch (service) {
    case SERVICE_TYPE_TERMINAL:
      await handleTerminalWebhook(inputParams, responsePayload);
      break;
    default:
      throw new Error(`Unknown service: ${service}`);
  }
};

export const getEnv = (): string => {
  const OFFICIAL_STAGES = ["development", "staging", "production"];

  const environment = process.env.ENV ?? "local";

  if (!OFFICIAL_STAGES.includes(environment)) {
    const developer = process.env.DEVELOPER;
    return developer ? `${environment}:${developer}` : environment;
  }

  return environment;
};
