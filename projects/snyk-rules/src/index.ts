// TODO RA-V2 - deprecate entire package
import { makeCiCli } from '@useoptic/api-checks/build/ci-cli/make-cli';
import { newSnykApiCheckService } from './service';
import { runCommand } from './workflows/commands';
import { updateCommand } from '@useoptic/openapi-cli';

const apiCheckService = newSnykApiCheckService();
(async () => {
  const cli = await makeCiCli(apiCheckService);

  cli.addCommand(runCommand());
  cli.addCommand(updateCommand());

  cli.parse(process.argv);
})();
