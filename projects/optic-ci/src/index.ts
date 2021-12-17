import { makeCiCli } from '@useoptic/api-checks/build/ci-cli/make-cli';

const apiCheckService = newSnykApiCheckService();
const cli = makeCiCli('optic-ci', apiCheckService);

cli.parse(process.argv);
