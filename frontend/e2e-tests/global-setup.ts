import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.env.TEST_HOME || "localhost:3000");
  // Application redirects to Auth0. You do not need to await waitForNavigation().
  await page.getByLabel("Email address").click();
  await page.getByLabel("Email address").fill(process.env.TEST_USERNAME || "");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill(process.env.TEST_PASSWORD || "");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForNavigation();
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: "storageState.json" });
  await browser.close();
}

export default globalSetup;
