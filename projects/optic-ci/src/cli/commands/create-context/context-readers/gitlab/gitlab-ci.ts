import { UserError } from '@useoptic/openapi-utilities';
import { NormalizedCiContext } from '@useoptic/openapi-utilities';

export const getContextFromGitlabEnvironment = (): NormalizedCiContext => {
  const organization = process.env.CI_PROJECT_NAMESPACE;
  const pull_request = process.env.CI_MERGE_REQUEST_IID;
  const repo = process.env.CI_PROJECT_NAME;
  const branch_name = process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME;
  const commit_hash = process.env.CI_COMMIT_SHA;
  const run = process.env.CI_CONCURRENT_ID;
  const user = process.env.GITLAB_USER_ID;

  if (!pull_request) {
    throw new UserError({
      message:
        'Could not extract the merge_request_iid from environment `CI_MERGE_REQUEST_IID`',
    });
  }

  if (!organization) {
    throw new UserError({
      message:
        'Could not extract the project namespace from environment `CI_PROJECT_NAMESPACE`',
    });
  }

  if (!repo) {
    throw new UserError({
      message:
        'Could not extract the project name from environment `CI_PROJECT_NAME`',
    });
  }

  if (!branch_name) {
    throw new UserError({
      message:
        'Could not extract the branch name from environment `CI_MERGE_REQUEST_SOURCE_BRANCH_NAME`',
    });
  }

  if (!commit_hash) {
    throw new UserError({
      message:
        'Could not extract the commit_hash from environment `CI_COMMIT_SHA`',
    });
  }

  if (!run) {
    throw new UserError({
      message:
        'Could not extract the build number from environment `CI_CONCURRENT_ID`',
    });
  }

  if (!user) {
    throw new UserError({
      message: 'Could not extract the user from environment `GITLAB_USER_ID`',
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
