import {
  DiffWorkerRust,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker-rust';
import dotenv from 'dotenv';
import path from 'path';

const envPath =
  process.env.OPTIC_DEBUG_ENV_FILE || path.join(__dirname, '..', '.env');

dotenv.config({
  path: envPath,
});
import { getSentryWrapper } from './sentry';

const sentry = getSentryWrapper();
sentry.init();

async function run(config: IDiffProjectionEmitterConfig) {
  await new DiffWorkerRust(config).run();
}

const [, , configJsonString] = process.argv;
const config: IDiffProjectionEmitterConfig = JSON.parse(configJsonString);
console.log({ config });
run(config).catch((e) => {
  console.error(e);
});
