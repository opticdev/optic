import { makeCiCli } from '@useoptic/api-checks/build/ci-cli/make-cli';
import { newSnykApiCheckService } from './service';
import { runCommand } from './workflows/commands';
import { updateCommand } from '@useoptic/openapi-cli';

const apiCheckService = newSnykApiCheckService();
const cli = makeCiCli('sweater-comb', apiCheckService);

cli.addCommand(runCommand());
cli.addCommand(updateCommand());

cli.parse(process.argv);
