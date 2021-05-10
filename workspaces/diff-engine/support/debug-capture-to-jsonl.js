const fs = require('fs');
const Pick = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray');
const JsonStringer = require('stream-json/Stringer');
const JsonlStringer = require('stream-json/jsonl/Stringer');
const { chain } = require('stream-chain');
const { fork } = require('stream-fork');

async function run(debugCaptureFilePath, outputPath) {
  if (!debugCaptureFilePath || !fs.existsSync(debugCaptureFilePath)) {
    throw new Error('debug capture file must exist to generate streams');
  }
  // if (!outputPath || !fs.existsSync(outputPath)) {
  //   throw new Error('destination must exist to generate streams');
  // }

  const debugCapture = fs.createReadStream(debugCaptureFilePath);

  const events = chain([
    Pick.withParser({ filter: 'events' }),
    new JsonStringer(),
  ]);

  const interactions = chain([
    Pick.withParser({ filter: 'session.samples' }),
    streamArray(),
    ({ key, value }) => value,
    new JsonlStringer(),
  ]);

  events.pipe(process.stdout);
  debugCapture.pipe(fork([events]));
}

const args = process.argv.slice(2);
run(args[0], args);
