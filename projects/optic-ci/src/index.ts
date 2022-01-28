import { makeCiCli } from '@useoptic/api-checks';
import { readConfig } from './config';
import { buildCheckerFromConfig } from './checker';

(async () => {
  const config = await readConfig();
  const checker = buildCheckerFromConfig(config.checks);

  const cli = makeCiCli(
    'optic-ci', // TODO deprecate this
    checker,
    {
      opticToken: config.token,
      gitProvider: config.gitProvider,
      ciProvider: 'github',
    }
  );

  cli.parse(process.argv);
})();
