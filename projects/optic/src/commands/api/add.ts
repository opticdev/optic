import { Command } from 'commander';
import prompts from 'prompts';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import { OpticCliConfig, VCS } from '../../config';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_STANDARD_KEY, OPTIC_URL_KEY } from '../../constants';
import chalk from 'chalk';
import {
  getPathCandidatesForSha,
  getShasCandidatesForPath,
} from './get-file-candidates';
import { writeJson, writeYml } from './write-to-file';

function short(sha: string) {
  return sha.slice(0, 8);
}

const usage = () => `
  optic api add
  optic api add <path_to_spec.yml>
  optic api add <path_to_spec.yml> --history-depth 0
  optic api add <path_to_spec.yml> --standard <standard_id> --web`;

const helpText = `
Example usage:
  Add a single api to optic
  $ optic api add <path_to_spec.yml>

  Add a single api to optic and crawl through the history \`depth\` steps. history-depth=0 will crawl the entire history
  $ optic api add <path_to_spec.yml> --history-depth <depth>

  Discover all apis in the current repo
  $ optic api add

  Add all apis and attach standard - configure your API standard in Optic cloud
  $ optic api add --standard <standard_id>
  `;

export const registerApiAdd = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('add')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Add APIs to Optic')
    .argument('[spec_path]', 'path to file to compare')
    .option(
      '--history-depth <history-depth>',
      'Sets the depth of how far to crawl through to add historic API data. Set history-depth=0 if you want to crawl the entire history',
      '1'
    )
    .option(
      '--standard <standard>',
      'Set a standard to run on API diffs. You can always add this later by setting the `[x-optic-standard]` key on your OpenAPI spec'
    )
    .option('--web', 'open to the added API in Optic Cloud', false)
    .action(wrapActionHandlerWithSentry(getApiAddAction(config)));
};

type ApiAddActionOptions = {
  historyDepth: string;
  standard?: string;
  web?: boolean;
};

const getApiAddAction =
  (config: OpticCliConfig) =>
  async (path_to_spec: string | undefined, options: ApiAddActionOptions) => {
    if (isNaN(Number(options.historyDepth))) {
      logger.error(
        '--history-depth is not a number. history-depth must be a number'
      );
      process.exitCode = 1;
      return;
    } else if (!path_to_spec && options.historyDepth !== '1') {
      logger.error(
        'Invalid argument combination: Cannot set a history-depth !== 1 when no spec path is provided'
      );
      process.exitCode = 1;
      return;
    } else if (!config.isAuthenticated) {
      logger.error('Must be logged in to add APIs. Log in with `optic login`');
      process.exitCode = 1;
      return;
    } else if (!config.vcs || config.vcs?.type !== VCS.Git) {
      logger.error('Must have git in path and be in a git repo to add apis');
      process.exitCode = 1;
      return;
    }

    let org: { id: string; name: string };

    // TODO replace this with an API call
    const organizations: { id: string; name: string }[] = await [
      { id: 'a', name: 'org1' },
      // { id: 'b', name: 'org2' },
    ];
    if (organizations.length > 1) {
      const response = await prompts({
        type: 'select',
        name: 'orgId',
        message: 'Select the organization you want to add APIs to',
        choices: organizations.map((org) => ({
          title: org.name,
          value: org.id,
        })),
      });
      org = organizations.find((o) => o.id === response.orgId)!;
    } else if (organizations.length === 0) {
      logger.error(
        'Authenticated token was not associated with any organizations. Generate a new token at https://app.useoptic.com'
      );
      process.exitCode = 1;
      return;
    } else {
      org = organizations[0];
    }
    logger.info('');

    let standard = options.standard;
    if (!standard) {
      // TODO fetch existing standard
      const existingStandards: { id: string; name: string; slug: string }[] = [
        { id: '', name: '', slug: 'a' },
      ];

      const rulesetResponse = await prompts([
        {
          type: 'confirm',
          message:
            'Would you like to attach a standard to any added APIs? Note that you can always add a standard later',
          name: 'add',
          initial: true,
        },
        {
          type: (prev) =>
            prev && existingStandards.length > 0 ? 'select' : null,
          message:
            "Would you like to use an existing standard or create a new standard using Optic's built in rulesets",
          name: 'useExisting',
          choices: [
            {
              title: 'Use an existing standard',
              value: 'existing',
            },
            {
              title: "Create a new standard using Optic's built in rulesets",
              value: 'new',
            },
          ],
        },
        {
          type: (prev) => (prev === 'existing' ? 'select' : null),
          name: 'standard',
          message: 'Select an existing standard to add to these APIs',
          choices: existingStandards.map((r) => ({
            title: r.slug,
            value: r.slug,
          })),
        },
      ]);

      if (rulesetResponse.standard) {
        standard = rulesetResponse.standard;
      } else if (rulesetResponse.add && rulesetResponse.useExisting === 'new') {
        const createRulesetResponse = await prompts({
          type: 'multiselect',
          name: 'rulesets',
          min: 1,
          hint: '- Space to select. Return to submit',
          message: 'Select the rulesets you want to add to your standard',
          choices: [
            { title: 'Breaking changes', value: 'breaking-changes' },
            { title: 'Enforce naming conventions', value: 'naming' },
            { title: 'Require examples in schemas', value: 'examples' },
          ],
        });

        if (
          createRulesetResponse.rulesets &&
          createRulesetResponse.rulesets.length > 0
        ) {
          // TODO create ruleset API with sensible defaults
          const rulesetUrl = 'todo';
          logger.info(
            `A new standard has been created. You can view and edit this standard at ${rulesetUrl}`
          );
        }
      }
    } else {
      // TODO make API call to check that ruleset exists
      const rulesetExists = 'asd';
      if (!rulesetExists) {
        logger.warn(
          chalk.yellow(
            `Warning: It looks like the standard ${standard} does not exist.`
          )
        );
      }
    }

    logger.info('');
    logger.info(
      `Adding APIs to organization ${org.name}${
        standard ? ` with standard ${standard}` : ''
      }`
    );

    const candidates = path_to_spec
      ? await getShasCandidatesForPath(path_to_spec, options.historyDepth)
      : await getPathCandidatesForSha(config.vcs.sha);

    for await (const [path, shas] of candidates) {
      const [firstSha] = shas;

      let parseResult: ParseResult;
      try {
        parseResult = await getFileFromFsOrGit(`${firstSha}:${path}`, config);
      } catch (e) {
        if (path === path_to_spec) {
          logger.info(
            `File ${path_to_spec} is not a valid OpenAPI file. Optic currently supports OpenAPI 3 and 3.1`
          );
          logger.info(e);
        } else {
          logger.debug(`Disregarding candidate ${path}`);
          logger.debug(e);
        }
        continue;
      }
      if (parseResult.isEmptySpec) {
        logger.info(`File ${path} does not exist in sha ${short(firstSha)}`);
        continue;
      }

      const existingOpticUrl = parseResult.jsonLike[OPTIC_URL_KEY];
      const api: { id: string; url: string } = existingOpticUrl
        ? { id: '', url: 'todo get optic id from url' }
        : { id: '', url: 'todo make API call' };

      logger.info(`Found OpenAPI Spec at ${path}`);
      for await (const sha of shas) {
        let parseResult: ParseResult;
        try {
          parseResult = await getFileFromFsOrGit(`${sha}:${path}`, config);
        } catch (e) {
          logger.debug(
            `${short(sha)}:${path} is not a valid OpenAPI file, stopping here`,
            e
          );
          break;
        }
        if (parseResult.isEmptySpec) {
          logger.debug(
            `File ${path} does not exist in sha ${short(sha)}, stopping here`
          );
          break;
        }
        logger.info(`Uploading spec ${short(sha)}:${path}`);

        // TODO Upload spec here
      }

      // Write to file only if optic-url is not set
      if (!existingOpticUrl) {
        if (/.json/i.test(path)) {
          await writeJson(path, {
            [OPTIC_URL_KEY]: api.url,
            ...(standard ? { [OPTIC_STANDARD_KEY]: standard } : {}),
          });
        } else {
          await writeYml(path, {
            [OPTIC_URL_KEY]: api.url,
            ...(standard ? { [OPTIC_STANDARD_KEY]: standard } : {}),
          });
        }
      }
    }
  };
