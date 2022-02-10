import { makeCiCli } from '@useoptic/api-checks/build/ci-cli/make-cli';
import { newSnykApiCheckService } from './service';

const apiCheckService = newSnykApiCheckService();
const cli = makeCiCli('sweater-comb', apiCheckService);

cli.parse(process.argv);
