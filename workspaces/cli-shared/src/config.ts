import semver from 'semver';
import { PackageJson } from 'type-fest';

export { PackageJson };

export interface CliConfigObject {
  name: string;
  version: string;
  channel: string;
  prerelease: boolean;

  envName: Env;
  env: {
    development: boolean;
    production: boolean;
  };
}

export enum Env {
  Development = 'development',
  Staging = 'staging',
  Testing = 'testing',
  Production = 'production',
}

export function create(
  pkg: PackageJson,
  env: { [key: string]: string | undefined }
): CliConfigObject {
  const name = pkg.name;
  if (!name) {
    throw new Error(
      'Could not create cli config object: package.json must have a name'
    );
  }
  const version = semver.valid(pkg.version);
  if (!version) {
    throw new Error(
      `Could not create cli config object for ${name}: version in package.json not valid semver`
    );
  }
  const prereleaseComponents = semver.prerelease(version);
  const prereleaseTag =
    prereleaseComponents &&
    prereleaseComponents.find(
      (component: string | number) => typeof component === 'string'
    );

  const isPrerelease = !!prereleaseComponents;
  const channel = isPrerelease ? prereleaseTag || 'prerelease' : 'latest';

  const envName = isEnvTrue(env.OPTIC_DEVELOPMENT)
    ? Env.Development
    : Env.Production;

  return {
    name,
    version,
    channel,
    prerelease: isPrerelease,

    envName,
    env: {
      development: envName === Env.Development,
      production: envName === Env.Production,
    },
  };
}

export function isEnvTrue(val: string | undefined) {
  return val === 'yes' || val === 'true';
}

export function isEnvFalse(val: string | undefined) {
  return val === 'no' || val === 'false';
}
