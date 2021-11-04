const { makeCiCli } = require('@useoptic/api-checks/build/ci-cli/make-cli');
const { newSnykApiCheckService } = require('@useoptic/example-snyk-api-checks/build/service')


const apiCheckService = newSnykApiCheckService();
const cli = makeCiCli(
    'sweater-comb',
    apiCheckService
);
cli.parse(process.argv);
