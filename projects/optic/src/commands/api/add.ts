import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { Command } from 'commander';
import prompts from 'prompts';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import { OpticCliConfig, VCS } from '../../config';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import chalk from 'chalk';

const exec = promisify(callbackExec);

const usage = () => `
  optic api add
  optic api add <path_to_spec.yml>
  optic api add <path_to_spec.yml> --history-depth 0
  optic api add <path_to_spec.yml> --ruleset <ruleset_id> --web`;

const helpText = `
Example usage:
  Add a single api to optic
  $ optic api add <path_to_spec.yml>

  Add a single api to optic and crawl through the history \`depth\` steps. history-depth=0 will crawl the entire history
  $ optic api add <path_to_spec.yml> --history-depth <depth>

  Discover all apis in the current repo
  $ optic api add

  Add all apis and attach rulesets - configure your ruleset in Optic cloud
  $ optic api add --ruleset <ruleset_id>
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
      'Set rulesets to run on API diffs. You can always add this later by setting the `[x-optic-ruleset]` key on your OpenAPI spec',
      '1'
    )
    .option(
      '--ruleset <ruleset>',
      'Set rulesets to run on API diffs. You can always add this later by setting the `[x-optic-ruleset]` key on your OpenAPI spec'
    )
    .option('--web', 'open to the added API in Optic Cloud', false)
    .action(wrapActionHandlerWithSentry(getApiAddAction(config)));
};

type ApiAddActionOptions = {
  historyDepth: string;
  ruleset?: boolean;
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
      { id: 'b', name: 'org2' },
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

    let ruleset = options.ruleset;
    if (!ruleset) {
      // TODO fetch existing rulesets
      const existingStandards: { id: string; name: string; slug: string }[] =
        [];

      const rulesetResponse = await prompts([
        {
          type: 'confirm',
          message:
            'Would you like to attach a standard to added APIs? Note that you can always add a standard later',
          name: 'add',
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
          name: 'rulesetSlug',
          message: 'Select an existing standard to add to these APIs',
          choices: existingStandards.map((r) => ({
            title: r.slug,
            value: r.slug,
          })),
        },
      ]);

      if (rulesetResponse.rulesetSlug) {
        ruleset = rulesetResponse.rulesetSlug;
      } else if (rulesetResponse.add) {
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

        // TODO create ruleset API with sensible defaults
        const rulesetUrl = 'todo';
        logger.info(
          `A new standard has been created. You can view and edit this standard at ${rulesetUrl}`
        );
      }
    } else {
      // TODO make API call to check that ruleset exists
      const rulesetExists = 'asd';
      if (!rulesetExists) {
        logger.warn(
          chalk.yellow(
            `Warning: It looks like the standard ${options.ruleset} does not exist.`
          )
        );
      }
    }

    logger.info('');
    logger.info(
      `Adding APIs to organization ${org.name}${
        ruleset ? ` with ruleset ${ruleset}` : ''
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
        logger.info(`File ${path} does not exist in sha ${firstSha}`);
        continue;
      }

      const opticUrl = parseResult.jsonLike[OPTIC_URL_KEY];
      const apiId = opticUrl
        ? 'todo get optic id from url'
        : 'todo make API call';

      logger.info(`Found OpenAPI Spec at ${path}`);
      for await (const sha of shas) {
        let parseResult: ParseResult;
        try {
          parseResult = await getFileFromFsOrGit(`${sha}:${path}`, config);
        } catch (e) {
          logger.debug(
            `${sha}:${path} is not a valid OpenAPI file, stopping here`,
            e
          );
          break;
        }
        if (parseResult.isEmptySpec) {
          logger.debug(
            `File ${path} does not exist in sha ${sha}, stopping here`
          );
          break;
        }
        logger.info(`Uploading spec ${sha}:${path}`);

        // TODO Upload spec here
      }

      // Write to file only if optic-url is not set
      if (!opticUrl) {
        // TODO write to json / yml non-desctructively
        // If no x-optic-url, add x-optic-url + add ruleset
      }
    }
  };

type Path = string;
type Sha = string;

async function getShasCandidatesForPath(
  path: string,
  depth: string
): Promise<Map<Path, Sha[]>> {
  // This should return commits in reverse chronological order
  // first parent treats merge commits as a single depth (not including children in it)
  const command =
    depth === '0'
      ? `git rev-list HEAD --first-parent`
      : `git rev-list HEAD -n ${depth} --first-parent`;
  let hashes: string[];
  try {
    const commandResults = await exec(command).then(({ stdout }) =>
      stdout.trim()
    );
    hashes = commandResults.split('\n');
  } catch (e) {
    // Will fail in an empty git repository
    return new Map();
  }

  return new Map([[path, hashes]]);
}

async function getPathCandidatesForSha(sha: string): Promise<Map<Path, Sha[]>> {
  const results = new Map();
  // Pull all spec candidates (i.e. specs that have openapi key and are yml/yaml/json)
  // This won't check version / validity of spec and will not look for swagger2 specs
  const command = `toplevel=$(git rev-parse --show-toplevel) && \
    git grep --untracked --name-only -E 'openapi' -- \
    $toplevel/'*.yml' \
    $toplevel/'*.yaml' \
    $toplevel/'*.json' \
    || true`;

  const res = await exec(command);
  if (res.stderr) throw new Error(res.stderr);
  const relativePaths = res.stdout
    .trim()
    .split('\n')
    .filter((path) => !!path);

  for (const p of relativePaths) {
    results.set(p, [sha]);
  }

  return results;
}

async function uploadSpecs() {
  // upload specs
  // update the apis on the HEAD branch and add 'x-optic-url' to the apis
}
