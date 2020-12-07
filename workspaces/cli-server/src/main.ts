import { CliDaemon } from './daemon';
import fs from 'fs-extra';
import { userDebugLogger } from '@useoptic/cli-shared';
import dotenv from 'dotenv';
import path from 'path';
import Config from './config';
import * as Errors from './errors';

const envPath =
  process.env.OPTIC_DEBUG_ENV_FILE || path.join(__dirname, '..', '.env');

dotenv.config({
  path: envPath,
});

if (Config.errors.sentry) {
  console.log('Sentry is enabled');
  Errors.trackWithSentry(Config.errors.sentry);
  console.log('Remote error tracking with Sentry enabled');
} else {
  console.log('Sentry is disabled');
}

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
