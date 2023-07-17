import { UserError } from '@useoptic/openapi-utilities';
import { NormalizedCiContext } from '@useoptic/openapi-utilities';

export const getContextFromCircleCiEnvironment = (): NormalizedCiContext => {
  const organization = process.env.CIRCLE_PROJECT_USERNAME;
  const pull_request = process.env.CIRCLE_PULL_REQUEST?.split('/').slice(-1)[0];
  const repo = process.env.CIRCLE_PROJECT_REPONAME;
  const branch_name = process.env.CIRCLE_BRANCH;
  const commit_hash = process.env.CIRCLE_SHA1;
  const run = process.env.CIRCLE_BUILD_NUM;
  const user =
    (process.env.OPTIC_COMMIT_USER || process.env.CIRCLE_PR_USERNAME) ?? null;

  if (!pull_request) {
    throw new UserError({
      message:
        'Could not extract the pull request from environment `CIRCLE_PULL_REQUEST`',
    });
  }

  if (isNaN(Number(pull_request))) {
    throw new UserError({
      message: `Could not parse PR number from CIRCLE_PULL_REQUEST - expected format - https://github.com/org/project/pull/<pr_number>`,
    });
  }

  if (!organization) {
    throw new UserError({
      message:
        'Could not extract the repo owner from environment `CIRCLE_PROJECT_USERNAME`',
    });
  }

  if (!repo) {
    throw new UserError({
      message:
        'Could not extract the repo name from environment `CIRCLE_PROJECT_REPONAME`',
    });
  }

  if (!branch_name) {
    throw new UserError({
      message:
        'Could not extract the branch name from environment `CIRCLE_BRANCH`',
    });
  }

  if (!commit_hash) {
    throw new UserError({
      message:
        'Could not extract the commit_hash from environment `CIRCLE_SHA1`',
    });
  }

  if (!run) {
    throw new UserError({
      message:
        'Could not extract the build number from environment `CIRCLE_BUILD_NUM`',
    });
  }

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
