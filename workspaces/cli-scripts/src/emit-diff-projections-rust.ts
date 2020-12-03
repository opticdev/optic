import {
  DiffWorkerRust,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker-rust';
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
  Errors.trackWithSentry(Config.errors.sentry);
  console.log('Remote error tracking with Sentry enabled');
}

async function run(config: IDiffProjectionEmitterConfig) {
  const worker = new DiffWorkerRust(config);

  try {
    for await (let progress of worker.run()) {
      if (process && process.send) {
        process.send({
          type: 'progress',
          data: progress,
        });
      } else {
        console.log(progress);
      }
    }
  } catch (err) {
    if (process && process.send) {
      process.send({
        type: 'error',
        data: { message: err.message },
      });
    }

    throw err;
  }
}

const [, , configJsonString] = process.argv;
const config: IDiffProjectionEmitterConfig = JSON.parse(configJsonString);
console.log({ config });
run(config).catch((e) => {
  console.error(e);
  throw e;
});
