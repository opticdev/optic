const Path = require('path');
const package = require('../package.json');
const Fs = require('fs');
const Toml = require('@iarna/toml');

const crate = Toml.parse(
  Fs.readFileSync(Path.join(__dirname, '..', 'cli', 'Cargo.toml'))
);

module.exports = {
  version: package.version,
  binaryName: crate.package.name,
  localBuildPath: Path.join(__dirname, '..', '..', '..', 'target', 'debug'),
  prebuilt: {
    installPath: Path.join(__dirname, '..', 'binaries'),
    baseUrl:
      process.env.OPTIC__PREBUILT_BINARIES__BASE_URL ||
      'https://optic-packages.s3.amazonaws.com/dists/optic_diff',
  },

  supportedPlatforms: [
    {
      type: 'Windows_NT',
      arch: 'x64',
      name: 'win64',
      suffix: '.exe',
    },
    {
      type: 'Linux',
      arch: 'x64',
      name: 'linux',
      suffix: '',
    },
    {
      type: 'Darwin',
      arch: 'x64',
      name: 'macos',
      suffix: '',
    },
    {
      type: 'Darwin',
      arch: 'arm64',
      name: 'macos-aarch64',
      suffix: '',
    },
  ],
};
