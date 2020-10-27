const { install } = require('../lib');

install()
  .then(({ archiveName }) => {
    console.log(`Installed binaries for diff-engine: ${archiveName}`);
  })
  .catch((err) => {
    console.error('Could not install diff-engine:', err);
    process.exit(1);
  });
