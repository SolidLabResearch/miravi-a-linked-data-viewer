import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    defaultCommandTimeout: 10000, /* is OK for very slow computers */
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    video: false
  },
});
