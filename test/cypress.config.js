import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    experimentalRunAllSpecs: true,
    defaultCommandTimeout: 10000, /* is OK for very slow computers */
    baseUrl: 'http://localhost:5173/random/path/', /* include trailing slash */
    video: false
  },
});
