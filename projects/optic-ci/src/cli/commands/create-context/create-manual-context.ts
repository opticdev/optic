import fs from 'fs';
import path from 'path';

import { Command } from 'commander';

import { DEFAULT_CONTEXT_PATH } from '../constants';
import { NormalizedCiContext } from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { UserError } from '@useoptic/openapi-utilities';

type ContextOptions = {
  owner: string;
  user: string;
  pull_request: string;
  run: string;
  commit_hash: string;
  repo: string;
  branch_name: string;
};

export const registerCreateManualContext = (cli: Command) => {
  cli
    .command('create-manual-context')
    .addHelpText(
      'before',
      'Creates a context object used for uploading specs to Optic cloud.'
    )
    .requiredOption(
      '--owner <owner>',
      'the owner of the repo; in github this can be a user or an organization; in gitlab this can be the group + subgroups, joined by slashes (e.g. `group1/subgroup2`) or a user'
    )
    .requiredOption('--repo <repo>', 'the repository name')
    .requiredOption(
      '--pull_request <pull_request>',
      'the pull request number that this run is triggered from'
    )
    .requiredOption(
      '--run <run>',
      'the build run number that this run was triggered from'
    )
    .requiredOption(
      '--commit_hash <commit_hash>',
      'the commit hash / sha that this run was triggered from'
    )
    .requiredOption(
      '--branch_name <branch_name>',
      'the branch name that this run was triggered from'
    )
    .requiredOption(
      '--user <user>',
      'the user that triggered this workflow (from a commit / PR action)'
    )
    .action(
      wrapActionHandlerWithSentry(async (options: ContextOptions) => {
        if (isNaN(Number(options.pull_request))) {
          throw new UserError({
            message: `pull request must be a number, received ${options.pull_request}`,
          });
        }
        if (isNaN(Number(options.run))) {
          throw new UserError({
            message: `pull request must be a number, received ${options.run}`,
          });
        }
        createContext(options);
      })
    );
};

const createContext = (options: ContextOptions) => {
  const normalizedContext: NormalizedCiContext = {
    organization: options.owner,
    user: options.user,
    pull_request: Number(options.pull_request),
    run: Number(options.run),
    commit_hash: options.commit_hash,
    repo: options.repo,
    branch_name: options.branch_name,
  };

  const contextFilePath = path.join(process.cwd(), DEFAULT_CONTEXT_PATH);
  if (fs.existsSync(contextFilePath)) {
    console.error(`Context file already exists at ${contextFilePath}`);
    throw new UserError();
  } else {
    fs.writeFileSync(
      contextFilePath,
      Buffer.from(JSON.stringify(normalizedContext))
    );
    console.log(`Context file written to ${contextFilePath}`);
  }
};
