// const execa = require('execa')
const fs = require('fs');
const path = require('path');

const interactions = fs.createReadStream(
  path.join(__dirname, '..', 'fixtures', 'todos-interaction.json_stream')
);

const DiffEngine = require('../../lib');

const diff = DiffEngine.spawn({
  specPath: path.join(__dirname, '..', '..', 'input-events.json'),
});

interactions.pipe(diff.input);
diff.output.pipe(process.stdout);
diff.error.pipe(process.stderr);

diff.result.then(
  (res) => {
    console.log('finished diff');

    // console.log(res.exitCode);
  },
  (err) => {
    console.log('something went wrong');
    console.error(err);
  }
);
