const Execa = require('execa');
const { PassThrough } = require('stream');
const Fs = require('fs');
const Path = require('path');
const Toml = require('@iarna/toml');
const OS = require('os');

const Config = require('./config');

function spawn({ specPath }) {
  const input = new PassThrough();
  const output = new PassThrough();
  const error = new PassThrough();

  const binaryName = Config.binaryName;
  const supportedPlatform = getSupportedPlatform();

  const binPaths = [];
  if (supportedPlatform) {
    let prebuiltBinPath = Path.join(
      Config.prebuilt.installPath,
      `${binaryName}-v${Config.version}-${supportedPlatform}`,
      binaryName
    );

    if (Fs.existsSync(prebuiltBinPath)) {
      binPaths.push(prebuiltBinPath);
    }
  }

  let debugBinPath = Path.join(Config.localBuildPath, binaryName);
  if (Fs.existsSync(debugBinPath)) {
    // @TODO: use reported version of the binary (run optic_diff -V (or --version)) to do
    // some rough determination whether the build is outdated or not. Not perfect, but
    // possibly protective of the worst offending.
    binPaths.push(debugBinPath);
  }

  if (binPaths.length < 1) {
    // @TODO: consider more useful error message here, depending on platorm being supported, versions missing, etc.
    throw new Error(
      'Diff-engine binary could not be found (downloaded or local). Consider installing a pre-built version or building locally.'
    );
  }

  const binPath = binPaths[0];

  const diffProcess = Execa(binPath, [specPath], {
    input,
    stdio: 'pipe',
  });

  if (!diffProcess.stdout || !diffProcess.stderr)
    throw new Error('diff process should have stdout and stderr streams');

  diffProcess.stdout.pipe(output);
  diffProcess.stderr.pipe(error);

  return { input, output, error };
}

function getSupportedPlatform() {
  const supported = Config.supportedPlatforms.find(
    ({ arch, type }) => arch === OS.arch() && type === OS.type()
  );
  return supported ? supported.platform : undefined;
}

exports.spawn = spawn;

spawn({ specPath: 'test' });
