const Tap = require('tap');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { DiffEngineError } = require('../../lib');

Tap.test('diff-engine.spawn', async (test) => {
  await test.test('can diff a stream of interactions', async (t) => {
    const interactions = fs.createReadStream(
      path.join(
        __dirname,
        '..',
        'fixtures',
        'ergast-captures',
        'ergast-simulated-traffic.jsonl'
      )
    );

    const DiffEngine = require('../../lib');

    const diff = DiffEngine.spawn({
      specPath: path.join(
        __dirname,
        '..',
        'fixtures',
        'ergast-example-spec.json'
      ),
    });

    interactions.pipe(diff.input);
    let outputLines = bufferLines(diff.output);
    let errorLines = bufferLines(diff.error);

    let diffs = (await outputLines).map((line) => JSON.parse(line));
    diffs.sort(([, tagsA, fingerprintA], [, tagsB, fingerprintB]) =>
      (fingerprintA + tagsA.join(',')).localeCompare(
        fingerprintB + tagsB.join(',')
      )
    );

    t.matchSnapshot(diffs, 'generated diffs');
  });

  await test.test(
    'will reject result with errors for diff-engine process faults',
    async (t) => {
      const interactions = fs.createReadStream(
        path.join(
          __dirname,
          '..',
          'fixtures',
          'ergast-captures',
          'ergast-simulated-traffic.jsonl'
        )
      );

      const DiffEngine = require('../../lib');

      const diff = DiffEngine.spawn({
        specPath: path.join(__dirname, 'spawn.js'), // not a spec file
      });

      interactions.pipe(diff.input);
      let outputLines = bufferLines(diff.output);
      let errorLines = bufferLines(diff.error);

      let engineError;
      try {
        await diff.result;
      } catch (err) {
        engineError = err;
      }

      t.type(engineError, DiffEngineError);
    }
  );
});

async function bufferLines(stream) {
  const results = [];
  const lines = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    results.push(line);
  }

  return results;
}
