import {
  createCliConfig,
  Env,
  CliConfigObject,
  isEnvTrue,
  PackageJson,
} from '@useoptic/cli-shared';
const pkg = require('../package.json') as PackageJson;

const cliConfig = createCliConfig(pkg, process.env);

export default {
  ...cliConfig,

  errors: {
    sentry: cliConfig.env.production &&
      isEnvTrue(process.env.OPTIC__CLI_SCRIPTS__SENTRY__ENABLED) && {
        dsn:
          'https://1f73af94a02f45918fbdd9c2a24d1ff4@o446328.ingest.sentry.io/5540361',
        environment: cliConfig.envName,
        release: cliConfig.version,
        serverName: cliConfig.name,
      },
  },
};
