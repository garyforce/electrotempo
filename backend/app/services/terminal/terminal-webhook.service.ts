import { updateScenarioStatus } from "./terminal.service";

export const handleTerminalWebhook = async (inputParams: any, results: any) => {
  const { scenarioId } = inputParams;
  if (!scenarioId) {
    throw new Error(`Missing scenarioId from webhook: ${inputParams}`);
  }

  if (results.errorMessage) {
    if (/Task timed out/.test(results.errorMessage)) {
      console.log(`Optimization for scenario (id=${scenarioId}) timed out`);
      return await updateScenarioStatus(scenarioId, "TIMEOUT");
    } else {
      console.log(`Optimization for scenario (id=${scenarioId}) failed`);
      return await updateScenarioStatus(scenarioId, "FAILED");
    }
  }

  // TODO: Handle success and insert data into the database
  // this part is current done by the terminal-calculator-complete Lambda function
  // return await updateScenarioStatus(scenarioId, "SUCCESS", true);
};
