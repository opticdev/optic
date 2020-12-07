const Execa = require('execa');
const { PassThrough } = require('stream');
const Fs = require('fs');
const Path = require('path');
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

  // get a clean result promise, so we stay in control of the exact API we're exposing
  const result = diffProcess.then(
    (childResult) => {},
    (childResult) => {
      throw new DiffEngineError(childResult);
    }
  );
  return { input, output, error, result };
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
  if (!platform) {
    let issueTitle = `Support for platform (os.type=${OS.type()} os.arch=${OS.arch()})`;
    let issueLabels = 'feature request';
    let issueUrl = encodeURI(
      `https://github.com/opticdev/optic/issues/new?title=${issueTitle}&labels=${issueLabels}`
    );
    throw new Error(
      `Unsupported platform. Cannot install pre-built ${
        Config.binaryName
      } for os.type=${OS.type()} os.arch=${OS.arch()}. You can request support by opening a Github Issue at ${issueUrl}`
    );
  }

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

  const extracting = new Promise((resolve, reject) => {
    const extract = Tar.extract({ strip: 1, cwd: binaryDir });
    extract.once('finish', onFinish);
    extract.once('error', onError);

    downloadStream.pipe(extract);

    function onFinish() {
      cleanup();
      resolve();
    }
    function onError(err) {
      cleanup();
      reject(err);
    }
    function cleanup() {
      extract.removeListener('finish', onFinish);
      extract.removeListener('error', onError);
    }
  });

  await extracting;
  try {
    await Execa(prebuiltPath, ['--version']);
  } catch (err) {
    throw new Error(
      `Downloaded and installed binary could not be run.\n${err.stderr}`
    );
  }

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

class DiffEngineError extends Error {
  constructor(childResult) {
    const {
      exitCode,
      failed,
      timedOut,
      signal,
      signalDescription,
      killed,
      isCanceled,
    } = childResult;

    let failureMode;
    if (failed) {
      failureMode = `process failed with exit code ${exitCode}.`;
    } else if (timedOut) {
      failureMode = `process became unresponsive and timed out`;
    } else if (killed) {
      failureMode = `process was killed by signal ${signal} (${signalDescription})`;
    } else {
      failureMode = `failed for an unknown reason`;
    }
    super(`Diff engine ${failureMode}`);
    this.exitCode = exitCode;
    this.signal = signal;
    this.signalDescription = signalDescription;
    this.failed = failed;
    this.timedOut = timedOut;
    this.isCanceled = isCanceled;
    this.killed = killed;
  }
}

exports.spawn = spawn;
exports.install = install;
exports.uninstall = uninstall;
exports.DiffEngineError = DiffEngineError;
