import { Command } from 'commander';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import { OpticCliConfig, VCS } from '../../config';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import * as Git from '../../utils/git-utils';
import chalk from 'chalk';

const validTagRegexp = /[a-zA-Z0-9:-_]/;

const usage = () => `
  optic spec push <path_to_spec.yml>
  optic spec push <path_to_spec.yml> --tag [tags] --web`;

const helpText = `
Example usage:
  Push a spec version to optic
  $ optic spec push <path_to_spec.yml>

  Push a spec version to optic and include the tags "production" and "cbb82ba"
  $ optic spec push <path_to_spec.yml> --tag production,cbb82ba
`;

export const registerSpecPush = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('push', { hidden: true })
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Push a spec version')
    .argument('[spec_path]', 'path to file to push')
    .option(
      '--tag <tag>',
      'Adds additional tags to the spec version. If the spec is unchanged from git, the git tag will automatically be included. Tags must be alphanumeric or the - _ : characters'
    )
    .option('--web', 'open to the push spec in Optic Cloud', false)
    .action(wrapActionHandlerWithSentry(getSpecPushAction(config)));
};

type SpecPushActionOptions = {
  tag?: string;
  web: false;
};

const getSpecPushAction =
  (config: OpticCliConfig) =>
  async (spec_path: string | undefined, options: SpecPushActionOptions) => {
    if (!config.isAuthenticated) {
      logger.error(
        'Must be logged in to push specs. Log in with `optic login`'
      );
      process.exitCode = 1;
      return;
    }

    const tagsToAdd: string[] = [];
    if (options.tag) {
      const tags = options.tag.split(',');
      const invalidTags = tags.filter((tag) => !validTagRegexp.test(tag));
      if (invalidTags.length > 0) {
        logger.error(
          `The following tags were invalid: ${invalidTags.join(
            ', '
          )}. Tags must only include alphanumeric characters, dashes (-, _) or colons (:)`
        );
        process.exitCode = 1;
        return;
      }
      tagsToAdd.push(...tags);
    }

    if (config.vcs?.type === VCS.Git) {
      if (config.vcs.status === 'clean') {
        const sha = `git:${config.vcs.sha}`;
        const branch = `git:${await Git.getCurrentBranchName()}`;
        tagsToAdd.push(sha, branch);
        logger.info(
          `Automatically adding the git sha ${sha} and branch ${branch} as tags `
        );
      } else {
        logger.info(
          'Not automatically including any git tags because the current working directory has uncommited changes.'
        );
      }
    }

    if (tagsToAdd.length === 0) {
      logger.error(
        `Must include at least 1 tag in order to run optic spec push`
      );
      process.exitCode = 1;
      return;
    }

    let parseResult: ParseResult;
    try {
      parseResult = await getFileFromFsOrGit(spec_path, config, false);
    } catch (e) {
      logger.error(
        `File ${spec_path} is not a valid OpenAPI file. Optic currently supports OpenAPI 3 and 3.1`
      );
      logger.error(e);
      process.exitCode = 1;
      return;
    }

    if (parseResult.isEmptySpec) {
      logger.error(
        `File ${spec_path} could not be found in the current working directory`
      );
      process.exitCode = 1;
      return;
    }
    const opticUrl: string = parseResult.jsonLike[OPTIC_URL_KEY];

    if (typeof opticUrl !== 'string') {
      logger.error(
        `File ${spec_path} does not have an optic url. Files must be added to Optic and have an x-optic-url key before specs can be pushed up to Optic.`
      );
      logger.error(`${chalk.yellow('Hint: ')} Run optic api add ${spec_path}`);
      process.exitCode = 1;
      return;
    }

    const api = { id: '', url: 'todo get optic id from url' };
    logger.info('');
    logger.info(
      `Uploading spec for api ${api.url} with tags ${tagsToAdd.join(', ')}`
    );
    // TODO make API call

    logger.info(
      `Succesfully uploaded spec to Optic. View the spec here ${'TODODODODOO'}`
    );
    // TODO log out spec url and maybe open if --web
  };
