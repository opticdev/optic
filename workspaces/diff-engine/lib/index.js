const Execa = require('execa');
const { PassThrough } = require('stream');
const Fs = require('fs');
const Path = require('path');
const Toml = require('@iarna/toml');
const OS = require('os');
const Rimraf = require('rimraf');
const Bent = require('bent');
const Tar = require('tar');

const Config = require('./config');

const fetchBinary = Bent(Config.prebuilt.baseUrl, 'GET', 200, 404);

function spawn({ specPath }) {
  const input = new PassThrough();
  const output = new PassThrough();
  const error = new PassThrough();

  const binaryName = Config.binaryName;
  const supportedPlatform = getSupportedPlatform();

  const binPaths = [];
  if (supportedPlatform) {
    let prebuiltBinPath = getPrebuiltPath(supportedPlatform);

    if (Fs.existsSync(prebuiltBinPath)) {
      binPaths.push(prebuiltBinPath);
    }
  }

  let debugBinPath = Path.join(
    Config.localBuildPath,
    `${binaryName}${supportedPlatform ? supportedPlatform.suffix : ''}`
  );
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
  return Config.supportedPlatforms.find(
    ({ arch, type }) => arch === OS.arch() && type === OS.type()
  );
}

function getPrebuiltPath(platform) {
  const binaryName = Config.binaryName;
  return Path.join(
    Config.prebuilt.installPath,
    `${binaryName}-v${Config.version}-${platform.name}`,
    `${binaryName}${platform.suffix}`
  );
}

async function install(options) {
  let platform = getSupportedPlatform();
  if (!platform)
    new Error(
      `Unsupported platform. Cannot install pre-built ${
        Config.binaryName
      } for os.type=${OS.type()} os.arch=${OS.arch()}`
    );

  const installDir = Config.prebuilt.installPath;
  if (!Fs.existsSync(installDir)) {
    Fs.mkdirSync(installDir, { recursive: true });
  }

  const prebuiltPath = getPrebuiltPath(platform);
  const binaryDir = Path.dirname(prebuiltPath);

  if (Fs.existsSync(binaryDir)) {
    Rimraf.sync(binaryDir);
  }

  const archiveName = Path.basename(binaryDir);

  const downloadStream = await fetchBinary(
    `/v${Config.version}/${archiveName}.tar.gz`
  );
  if (downloadStream.statusCode === 404) {
    throw new Error(
      `Pre-built binary ${Config.binaryName}-${platform.name}@${Config.version} was not published`
    );
  }

  Fs.mkdirSync(binaryDir, { recursive: true });

  await downloadStream.pipe(Tar.extract({ strip: 1, cwd: binaryDir }));

  return {
    archiveName,
  };
}

function uninstall(options) {
  let platform = getSupportedPlatform();
  if (!platform) return;

  const prebuiltPath = getPrebuiltPath(platform);
  const binaryDir = Path.dirname(prebuiltPath);

  if (Fs.existsSync(binaryDir)) {
    Rimraf.sync(binaryDir);
  }
}

exports.spawn = spawn;
exports.install = install;
exports.uninstall = uninstall;
