import { Command } from 'commander';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { init } from './init';

const initWithSentry = wrapActionHandlerWithSentry(init);

const description = `Initializes Optic. The command searches for valid OpenAPI specification files in your project, generates a unique ID per file and stores the result in an optic.yml configuration file.
These IDs are meant to be stable, but you can change them before committing the configuration file.`;

export const registerInit = (cli: Command) => {
  cli.command('init').description(description).action(initWithSentry);
};
