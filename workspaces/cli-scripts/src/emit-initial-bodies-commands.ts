import {
  IInitialBodiesProjectionEmitterConfig,
  InitialBodiesWorker,
} from '@useoptic/cli-shared/build/diffs/initial-bodies-worker';

async function run(config: IInitialBodiesProjectionEmitterConfig) {
  await new InitialBodiesWorker(config).run();
}

const [, , configJsonString] = process.argv;
const config: IInitialBodiesProjectionEmitterConfig = JSON.parse(
  configJsonString
);
console.log({ config });
run(config).catch((e) => {
  console.error(e);
});
