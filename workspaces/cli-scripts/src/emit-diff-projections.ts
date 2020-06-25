import {
  DiffWorker,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker';

async function run(config: IDiffProjectionEmitterConfig) {
  await new DiffWorker(config).run();
}

const [, , configJsonString] = process.argv;
const config: IDiffProjectionEmitterConfig = JSON.parse(configJsonString);
console.log({ config });
run(config).catch((e) => {
  console.error(e);
});
