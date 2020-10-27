const Path = require('path');
const package = require('../package.json');
const Fs = require('fs');
const Toml = require('@iarna/toml');

const crate = Toml.parse(
  Fs.readFileSync(Path.join(__dirname, '..', 'Cargo.toml'))
);

module.exports = {
  version: package.version,
  binaryName: crate.package.name,
  localBuildPath: Path.join(__dirname, '..', '..', '..', 'target', 'debug'),
  prebuilt: {
    installPath: Path.join(__dirname, '..', 'bin'),
    baseUrl: 'http://localhost:9090/optic-packages/dists/optic_diff',
  },

  supportedPlatforms: [
    {
      type: 'Windows_NT',
      arch: 'x64',
      platform: 'win64',
    },
    {
      type: 'Linux',
      arch: 'x64',
      platform: 'linux',
    },
    {
      type: 'Darwin',
      arch: 'x64',
      platform: 'macos',
    },
  ],
};
