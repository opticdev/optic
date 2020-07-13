import fs from 'fs-extra';
import path from 'path';
import { IHttpInteraction } from '@useoptic/domain-types';
import oboe from 'oboe';
import { CaptureSaver } from './capture-saver';

async function main(inputFilePath: string, outputBaseDirectory: string) {
  console.log({ inputFilePath });
  const input = fs.createReadStream(inputFilePath);
  const events: any[] = [];
  const captureId = 'ccc';
  const captureBaseDirectory = path.join(
    outputBaseDirectory,
    '.optic',
    'captures'
  );
  const captureSaver = new CaptureSaver({
    captureBaseDirectory,
    captureId,
  });
  await captureSaver.init();
  await new Promise((resolve, reject) => {
    oboe(input)
      .on('node', {
        // @ts-ignore
        'events.*': function (event: any) {
          console.count('event');
          //console.log({ event });
          events.push(event);
        },
        'session.samples.*': function (sample: IHttpInteraction) {
          console.count('sample');
          //console.log({ sample });
          captureSaver.save(sample);
        },
      })
      .on('done', function () {
        console.log('done');
        resolve();
      })
      .on('fail', function (e) {
        console.error(e);
        reject(e);
      });
  });

  const files = [
    {
      location: path.join(outputBaseDirectory, 'optic.yml'),
      contents: `name: ${JSON.stringify(path.basename(inputFilePath))}`,
    },
    {
      location: path.join(
        outputBaseDirectory,
        '.optic',
        'api',
        'specification.json'
      ),
      contents: JSON.stringify(events),
    },
    {
      location: path.join(
        outputBaseDirectory,
        '.optic',
        'captures',
        captureId,
        'optic-capture-state.json'
      ),
      contents: JSON.stringify({
        captureId,
        status: 'completed',
        metadata: {
          startedAt: new Date().toISOString(),
          taskConfig: null,
          lastInteraction: null,
        },
      }),
    },
  ];

  await Promise.all(
    files.map(async (x) => {
      const { location, contents } = x;
      await fs.ensureDir(path.dirname(location));
      return fs.writeFile(location, contents);
    })
  );
}

const [, , inputFilePath, outputBaseDirectory] = process.argv;
main(inputFilePath, outputBaseDirectory);
