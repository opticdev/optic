import Semver from 'semver';

const packageJson = require('../package.json');

export interface CliConfig {
  package: {
    name: string;
    version: string;
  };
  updateNotifier: {
    distTag: string;
  };
}

export function readConfig(packageManifestOption?: {
  name: string;
  version: string;
}): CliConfig {
  let packageManifest = packageManifestOption || {
    name: packageJson.name as string,
    version: packageJson.version as string,
  };

  return {
    package: packageManifest,
    updateNotifier: {
      distTag:
        Semver.parse(packageManifest.version)!.prerelease.length > 0
          ? 'prerelease'
          : 'latest',
    },
  };
}
