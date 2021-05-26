const fs = require('fs');
const Pick = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray');
const JsonStringer = require('stream-json/Stringer');
const JsonlStringer = require('stream-json/jsonl/Stringer');
const { chain } = require('stream-chain');
const { fork } = require('stream-fork');
const meow = require('meow');
const Path = require('path');

const cli = meow(
  `
Usage
  $ debug-capture-to-jsonl

Description
  Extract streams of data from debug / example captures in a format the 
  

Options
  --file, -f      read the example capture from a file (defaults to stdin)
  --output, -o    directory where results are written with default stream names. Required
                  for multiple streams, single streams default to stdout.
  --events        specification events log (JSON) directly to stdout
  --interactions  interactions tagged by an interaction pointer (JSONL) directly to stdout
  
  Interactions filtering
  --statuscode <code> filter interactions for only responses with a certain status code
`,
  {
    flags: {
      file: {
        type: 'string',
        alias: 'f',
      },
      events: {
        type: 'boolean',
      },
      interactions: {
        type: 'boolean',
      },

      // interaction filters
      statusCode: {
        type: 'string',
        alias: 'statuscode',
      },

      output: {
        type: 'string',
        alias: 'o',
        isRequired: (flags) => flags.events && flags.interactions,
      },
    },
  }
);

run(cli.flags).catch((err) => {
  throw err;
});

async function run(flags) {
  let inputFilePath = flags.file;
  if (inputFilePath && !fs.existsSync(inputFilePath)) {
    throw new Error('when provided, capture file path must exist');
  }

  const debugCapture = inputFilePath
    ? fs.createReadStream(inputFilePath)
    : process.stdin;

  if (!inputFilePath) {
    console.error('accepting debug capture over stdin');
  }

  let processors = [];

  if (flags.events) {
    processors.push({ stream: events(), fileName: 'specification.json' });
  }
  if (flags.interactions) {
    processors.push({
      stream: interactions({
        statusCode: flags.statusCode && parseInt(flags.statusCode),
      }),
      fileName: 'interactions.jsonl',
    });
  }

  let outputDir = flags.output;
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  if (processors.length == 0) {
    cli.showHelp();
    return;
  } else {
    let streams = processors
      .map(({ stream, fileName }) => {
        if (processors.length < 2 && !outputDir) {
          return { stream, destination: process.stdout };
        }
        let outputPath = Path.join(outputDir, fileName);
        let destination = fs.createWriteStream(outputPath);

        return { stream, destination };
      })
      .map(({ stream, destination }) => {
        stream.pipe(destination);
        return stream;
      });

    debugCapture.pipe(fork(streams));
  }
}

function events() {
  return chain([Pick.withParser({ filter: 'events' }), new JsonStringer()]);
}

function interactions(options = {}) {
  return chain([
    Pick.withParser({ filter: 'session.samples' }),
    streamArray(),
    ({ key, value }) => [value],
    (interaction) => {
      if (
        !options.statusCode ||
        options.statusCode === interaction.response.statusCode
      ) {
        return [interaction];
      } else {
        return;
      }
    },
    (interaction) => [[interaction, [`id-${interaction.uuid}`]]],
    new JsonlStringer(),
  ]);
}
