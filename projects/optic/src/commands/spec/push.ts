import { Command } from 'commander';
import open from 'open';
import { sanitizeGitTag } from '@useoptic/openapi-utilities';

import { OpticCliConfig, VCS } from '../../config';
import {
  loadSpec,
  ParseResult,
  specHasUncommittedChanges,
} from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import * as Git from '../../utils/git-utils';
import chalk from 'chalk';
import { uploadSpec } from '../../utils/cloud-specs';
import { getApiFromOpticUrl, getSpecUrl } from '../../utils/cloud-urls';
import { errorHandler } from '../../error-handler';
import { getTagsFromOptions, getUniqueTags } from '../../utils/tags';

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
    .command('push')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Push a spec version')
    .argument('[spec_path]', 'path to file to push')
    .option(
      '--tag <tag>',
      'Adds additional tags to the spec version. In git repositories with a clean working directory, a git tag will automatically be included. Tags must be alphanumeric or the - _ : characters'
    )
    .option('--web', 'open to the push spec in Optic Cloud', false)
    .action(errorHandler(getSpecPushAction(config)));
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

    let parseResult: ParseResult;
    try {
      parseResult = await loadSpec(spec_path, config, {
        strict: false,
        denormalize: true,
      });
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
    let tagsToAdd: string[] = getTagsFromOptions(options.tag);

    if (config.vcs?.type === VCS.Git) {
      if (
        !specHasUncommittedChanges(parseResult.sourcemap, config.vcs.diffSet)
      ) {
        const sha = config.vcs.sha;
        tagsToAdd.push(`git:${sha}`);

        const branch = await Git.getCurrentBranchName();

        if (branch !== 'HEAD') {
          tagsToAdd.push(sanitizeGitTag(`gitbranch:${branch}`));
          logger.info(
            `Automatically adding the git sha 'git:${sha}' and branch 'gitbranch:${branch}' as tags`
          );
        } else {
          logger.info(`Automatically adding the git sha 'git:${sha}' as a tag`);
        }
      } else {
        logger.info(
          'Not automatically including any git tags because the current working directory has uncommited changes.'
        );
      }
    }

    tagsToAdd = getUniqueTags(tagsToAdd);

    const opticUrl: string = parseResult.jsonLike[OPTIC_URL_KEY];
    const specDetails = getApiFromOpticUrl(opticUrl);

    if (typeof opticUrl !== 'string') {
      logger.error(
        `File ${spec_path} does not have an optic url. Files must be added to Optic and have an x-optic-url key before specs can be pushed up to Optic.`
      );
      logger.error(`${chalk.yellow('Hint: ')} Run optic api add ${spec_path}`);
      process.exitCode = 1;
      return;
    } else if (!specDetails) {
      logger.error(
        `File ${spec_path} does not a valid. Files must be added to Optic and have an x-optic-url key that points to an uploaded spec before specs can be pushed up to Optic.`
      );
      logger.error(`${chalk.yellow('Hint: ')} Run optic api add ${spec_path}`);
      process.exitCode = 1;
      return;
    }

    logger.info('');
    logger.info(
      `Uploading spec for api at ${opticUrl} ${
        tagsToAdd.length > 0 ? `with tags ${tagsToAdd.join(', ')}` : ''
      }`
    );
    const specId = await uploadSpec(specDetails.apiId, {
      spec: parseResult,
      client: config.client,
      tags: tagsToAdd,
      orgId: specDetails.orgId,
    });
    const url = getSpecUrl(
      config.client.getWebBase(),
      specDetails.orgId,
      specDetails.apiId,
      specId
    );

    logger.info(
      `Succesfully uploaded spec to Optic. View the spec here ${url}`
    );

    if (options.web) {
      await open(url, { wait: false });
    }
  };
