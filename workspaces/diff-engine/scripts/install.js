const { install, dryRun } = require('../lib');
const dotenv = require('dotenv');
const path = require('path');

const envPath =
  process.env.OPTIC_DEBUG_ENV_FILE || path.join(__dirname, '..', '.env');

dotenv.config({
  path: envPath,
});

if (process.env.OPTIC_SKIP_PREBUILT_INSTALLS === 'true') {
  console.log(
    'Skipping install of diff-engine pre-built binaries through OPTIC_SKIP_PREBUILT_INSTALLS'
  );
  process.exit(0);
}

if (process.env.OPTIC_RUST_DIFF_ENGINE !== 'true') {
  process.exit(0);
}

install()
  .then(({ archiveName }) => {
    console.log(`Installed binaries for diff-engine: ${archiveName}`);
    console.log('Verifying binary can actualy run...');
    return dryRun();
  })
  .catch((err) => {
    console.error('Could not install diff-engine:', err);
    process.exit(1);
  });
