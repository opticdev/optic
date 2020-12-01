import { CliDaemon } from './daemon';
import fs from 'fs-extra';
import { userDebugLogger } from '@useoptic/cli-shared';
import { getSentryWrapper } from './sentry';

const sentry = getSentryWrapper();
sentry.init();

console.log('starting daemon', process.argv, process.env.DEBUG);
console.log(process.cwd(), __dirname, __filename);

const [, , lockFilePath, sentinelFilePath, cloudApiBaseUrl] = process.argv;
if (!lockFilePath) {
  throw new Error(`missing lockFilePath`);
}
if (!sentinelFilePath) {
  throw new Error(`missing sentinelFilePath`);
}
if (!cloudApiBaseUrl) {
  throw new Error(`missing cloudApiBaseUrl`);
}
userDebugLogger(`daemon lock file ${lockFilePath}`);
const daemon = new CliDaemon({ lockFilePath, cloudApiBaseUrl });
daemon
  .start()
  .then(async (result) => {
    userDebugLogger(`daemon started on port ${result.port}`);
    await fs.writeJson(sentinelFilePath, result);
  })
  .catch((e) => {
    console.error(e);
    throw e;
  });
