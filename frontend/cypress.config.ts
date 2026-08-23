import { defineConfig } from "cypress";
import cypressMochawesomeReporter from "cypress-mochawesome-reporter/plugin.js";
// Chuẩn ESM

export default defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    charts: true,
    reportPageTitle: "TechVie Frontend Cypress E2E Report",
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    // Cảnh báo bảo mật Cypress (v15+)
    allowCypressEnv: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    // Tránh trượt đi khi tương tác với ô input, nút bấm, checkbox
    scrollBehavior: false,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    async setupNodeEvents(on, config) {
      cypressMochawesomeReporter(on);
      const codeCoverageTask = (await import("@cypress/code-coverage/task")).default;
      codeCoverageTask(on, config);
      return config;
    },
  },
});
