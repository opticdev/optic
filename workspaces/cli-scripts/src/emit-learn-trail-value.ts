import {
  ITrailValuesEmitterWorker,
  LearnTrailValueWorker,
} from '@useoptic/cli-shared/build/diffs/trail-values-worker';

async function run(config: ITrailValuesEmitterWorker) {
  await new LearnTrailValueWorker(config).run();
}

const [, , configJsonString] = process.argv;
const config: ITrailValuesEmitterWorker = JSON.parse(configJsonString);
console.log({ config });
run(config).catch((e) => {
  console.error(e);
});
