import { Command } from 'commander';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { ParseResult, getFileFromFsOrGit } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import { UserError } from '@useoptic/openapi-utilities';
import { isYaml, writeYaml } from '@useoptic/openapi-io';

const description = `dereference an OpenAPI specification`;

const usage = () => `
  optic dereference <file_path>
  optic dereference <file_path> > dereference.yml
`;
const helpText = `
Example usage:
  $ optic dereference openapi-spec.yml > dereference.yml
  `;

export const registerDereference = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('dereference')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description(description)
    .argument('[file_path]', 'openapi file to dereference')
    .action(wrapActionHandlerWithSentry(deferenceAction(config)));
};

const getDereferencedSpec = async (
  file1: string,
  config: OpticCliConfig
): Promise<ParseResult> => {
  try {
    // TODO update function to try download from spec-id cloud
    return getFileFromFsOrGit(file1, config, false);
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};

const deferenceAction =
  (config: OpticCliConfig) => async (filePath: string | undefined) => {
    let parsedFile: ParseResult;
    if (filePath) {
      parsedFile = await getDereferencedSpec(filePath, config);

      if (isYaml(filePath)) {
        console.log(writeYaml(parsedFile.jsonLike));
      } else {
        console.log(JSON.stringify(parsedFile.jsonLike, null, 2));
      }
    } else {
      console.error('No specification found');
      process.exitCode = 1;
      return;
    }
  };
