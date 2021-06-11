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
    'Skipping install of optic-engine-native pre-built binaries through OPTIC_SKIP_PREBUILT_INSTALLS'
  );
  process.exit(0);
}
console.log('Downloading and installing binaries for optic-engine-native.');

const { install } = require('../lib');
install()
  .then(({ archiveName }) => {
    console.log(`Installed binaries for optic-engine-native: ${archiveName}`);
  })
  .catch((err) => {
    console.error('Could not install optic-engine-native.\n', err);
    process.exit(1);
  });
