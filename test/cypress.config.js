import { defineConfig } from "cypress";
import cypressLogToOutput from 'cypress-log-to-output';

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    experimentalRunAllSpecs: true,
    defaultCommandTimeout: 10000, /* is OK for very slow computers */
    baseUrl: 'http://localhost:5173/random/path/', /* include trailing slash */
    video: false,
    setupNodeEvents(on, config) {
      // uncomment next line only temporarily to see app's console.log in cypress test output (https://www.npmjs.com/package/cypress-log-to-output)
      cypressLogToOutput.install(on);
      return config;
    },
  },
});
