const dotenv = require('dotenv');
const path = require('path');
if (process.env.OPTIC_DEBUG_ENV_FILE) {
  console.log(`using overridden env ${process.env.OPTIC_DEBUG_ENV_FILE}`);
}
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
console.log('Downloading and installing binaries for diff-engine.');

const { install } = require('../lib');
install()
  .then(({ archiveName }) => {
    console.log(`Installed binaries for diff-engine: ${archiveName}`);
  })
  .catch((err) => {
    console.error('Could not install diff-engine.\n', err);
    process.exit(1);
  });
