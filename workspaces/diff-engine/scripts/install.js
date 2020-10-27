const { install } = require('../lib');

if (process.env.OPTIC_RUST_DIFF_ENGINE !== 'true') {
  process.exit(0);
}

install()
  .then(({ archiveName }) => {
    console.log(`Installed binaries for diff-engine: ${archiveName}`);
  })
  .catch((err) => {
    console.error('Could not install diff-engine:', err);
    process.exit(1);
  });
