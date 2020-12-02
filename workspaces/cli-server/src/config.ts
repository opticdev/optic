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
      isEnvTrue(process.env.OPTIC__CLI_SERVER__SENTRY__ENABLED) && {
        dsn: process.env.OPTIC__CLI_SERVER__SENTRY__DSN,
        environment: cliConfig.envName,
        release: cliConfig.version,
        serverName: cliConfig.name,
      },
  },
};
