import {
  DiffWorkerRust,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker-rust';
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
