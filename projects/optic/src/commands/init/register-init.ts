import { Command } from 'commander';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { getInit } from './init';
import { OpticCliConfig } from '../../config';
import { supportedCIs } from './constants';

const description = 'Initializes Optic. See `optic init --help`';

const helpText = `
Initializes Optic. The command searches for valid OpenAPI specification files in your project, generates a unique ID per file and stores the result in an optic.yml configuration file.
These IDs are meant to be stable, but you can change them before committing the configuration file.

Use the \`--ci <ci>\` or \`--ci-only <ci>\` options to automatically setup your CI to use Optic cloud. Supported values: ${supportedCIs.join(
  ', '
)}.
`;

export const registerInit = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('init')
    .description(description)
    .addHelpText('after', helpText)
    .option('--ci <ci>', 'also setup a CI action')
    .option('--ci-only <ciOnly>', 'only setup a CI action')
    .action(wrapActionHandlerWithSentry(getInit(config)));
};
