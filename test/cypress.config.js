import { defineConfig } from "cypress";
import cypressLogToOutput from 'cypress-log-to-output';
import fs from 'fs-extra';
import path from 'path';

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    experimentalRunAllSpecs: true,
    defaultCommandTimeout: 10000, /* is OK for very slow computers */
    baseUrl: 'http://localhost:5173/random/path/', /* include trailing slash */
    video: false,
    setupNodeEvents(on, config) {
      // uncomment next line only temporarily to see app's console.log in cypress test output (https://www.npmjs.com/package/cypress-log-to-output)
      // cypressLogToOutput.install(on);

      on('task', {
        clearFolder(folder) {
          fs.emptyDirSync(folder);
          return null;
        }
      });

      on('task', {
        findYoungestFileWithExtension({ folder, extension, timeout = 5000, interval = 200 }) {
          const endTime = Date.now() + timeout;

          function checkForFile() {
            const files = fs.readdirSync(folder)
              .filter(f => f.toLowerCase().endsWith(extension.toLowerCase()));

            if (files.length) {
              // sort newest first
              const newest = files
                .map(name => ({
                  name,
                  time: fs.statSync(path.join(folder, name)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time)[0];

              return newest.name;
            }

            // retry until timeout
            if (Date.now() < endTime) {
              return new Promise(resolve =>
                setTimeout(() => resolve(checkForFile()), interval)
              );
            }

            return null; // nothing found even after retrying
          }

          return checkForFile();
        }
      });

      return config;
    },
  },
});
