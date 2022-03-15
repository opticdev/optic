import { makeCiCli } from '@useoptic/api-checks/build/ci-cli/make-cli';
import { newSnykApiCheckService } from './service';
import { runCommand } from './workflows/commands';

const apiCheckService = newSnykApiCheckService();
const cli = makeCiCli('sweater-comb', apiCheckService);

cli.addCommand(runCommand());

cli.parse(process.argv);
