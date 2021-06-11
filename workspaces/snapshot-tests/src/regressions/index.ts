import * as fs from 'fs-extra';
import * as Path from 'path';
import {
  LocalCliCapturesService,
  LocalCliSpectacle,
} from '@useoptic/spectacle-shared';
import * as opticEngine from '@useoptic/optic-engine-wasm';

async function main(input: {
  interactionsCount: string;
  outputBaseDirectory: string;
  baseDirectory: string;
}) {
  const apiId = '1';
  const captureId = 'ccc';
  const apiBaseUrl = 'http://localhost:34444';
  const baseUrl = `${apiBaseUrl}/api/specs/${apiId}`;
  const spectacle = new LocalCliSpectacle(baseUrl, opticEngine);
  const capturesService = new LocalCliCapturesService({ spectacle, baseUrl });

  const diffId = 'ddd';
  console.log('diffing');
  const diff = await capturesService.startDiff(diffId, captureId);
  const diffService = await diff.onComplete;
  const [
    listDiffsResult,
    learnShapeDiffAffordancesResult,
    listUnrecognizedUrlsResult,
  ] = await Promise.all([
    diffService.listDiffs(),
    diffService.learnShapeDiffAffordances(),
    diffService.listUnrecognizedUrls(),
  ]);

  const outputDir = input.outputBaseDirectory;
  await fs.ensureDir(outputDir);
  await fs.emptyDir(outputDir);
  await Promise.all([
    fs.writeJson(
      Path.join(outputDir, 'listDiffsResult.json'),
      listDiffsResult,
      { spaces: 2 }
    ),
    fs.writeJson(
      Path.join(outputDir, 'learnShapeDiffAffordancesResult.json'),
      learnShapeDiffAffordancesResult,
      { spaces: 2 }
    ),
    fs.writeJson(
      Path.join(outputDir, 'listUnrecognizedUrlsResult.json'),
      listUnrecognizedUrlsResult,
      { spaces: 2 }
    ),
  ]);
}

const [
  ,
  ,
  outputBaseDirectory,
  baseDirectory,
  interactionsCount,
] = process.argv;
main({ baseDirectory, outputBaseDirectory, interactionsCount })
  .then(() => {
    console.log('Done!');
  })
  .catch((e) => {
    console.error(e);
  });
