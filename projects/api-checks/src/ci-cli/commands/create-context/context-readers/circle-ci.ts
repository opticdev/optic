import { UserError } from '../../../errors';
import { NormalizedCiContext } from '../../../types';
import { execSync } from 'child_process';

export const getContextFromCircleCiEnvironment = (): NormalizedCiContext => {
  const organization = process.env.CIRCLE_PROJECT_USERNAME;
  const pull_request = process.env.CIRCLE_PULL_REQUEST?.split('/').slice(-1)[0];
  const repo = process.env.CIRCLE_PROJECT_REPONAME;
  const branch_name = process.env.CIRCLE_BRANCH;
  const commit_hash = process.env.CIRCLE_SHA1;
  const run = process.env.CIRCLE_BUILD_NUM;
  let user: string = '';

  const command = `git log -1 --pretty=format:'%an'`;
  try {
    user = execSync(
      command,
      { 
        cwd: process.cwd(),
        timeout: 2000
      },
    ).toString();
  } catch (err) {
    user = '';
  }

  if (!pull_request) {
    throw new UserError(
      'Could not extract the pull request from environment `CIRCLE_PULL_REQUEST`'
    );
  }

  if (isNaN(Number(pull_request))) {
    throw new UserError(
      `Could not parse PR number from CIRCLE_PULL_REQUEST - expected format - https://github.com/org/project/pull/<pr_number>`
    );
  }

  if (!organization) {
    throw new UserError(
      'Could not extract the repo owner from environment `CIRCLE_PROJECT_USERNAME`'
    );
  }

  if (!repo) {
    throw new UserError(
      'Could not extract the repo name from environment `CIRCLE_PROJECT_REPONAME`'
    );
  }

  if (!branch_name) {
    throw new UserError(
      'Could not extract the branch name from environment `CIRCLE_BRANCH`'
    );
  }

  if (!commit_hash) {
    throw new UserError(
      'Could not extract the commit_hash from environment `CIRCLE_SHA1`'
    );
  }

  if (!run) {
    throw new UserError(
      'Could not extract the build number from environment `CIRCLE_BUILD_NUM`'
    );
  }

  console.log(`returning user: ${user}`);

  return {
    organization,
    user,
    pull_request: Number(pull_request),
    run: Number(run),
    commit_hash,
    repo,
    branch_name,
  };
};
