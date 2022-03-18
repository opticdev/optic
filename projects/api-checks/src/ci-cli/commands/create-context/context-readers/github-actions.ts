import { UserError } from '../../../errors';
import { NormalizedCiContext } from '../../../types';

export const getContextFromGithubEnvironment = (): NormalizedCiContext => {
  const organization = process.env.GITHUB_REPOSITORY_OWNER;
  const pull_request = process.env.GITHUB_REF?.match(
    /refs\/pull\/(.+)\/merge/i
  )?.[1];
  const run = process.env.GITHUB_RUN_NUMBER;
  const commit_hash = process.env.GITHUB_SHA;
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const branch_name = process.env.GITHUB_HEAD_REF;
  let user: string = '';
  if (typeof process.env.GITHUB_CONTEXT === "string") {
    const github_context = JSON.parse(process.env.GITHUB_CONTEXT);
    user = github_context.event.user?.login;
  }

  if (!organization) {
    throw new UserError(
      'Could not extract the organization from environment `GITHUB_REPOSITORY_OWNER`'
    );
  }

  if (!pull_request) {
    throw new UserError(
      `Could not extract the pull request number from environment \`GITHUB_REF\` - 
expected format 'refs/pull/<pr_number>/merge' - this needs to be triggered off the 'pull request event'`
    );
  }
  if (!run) {
    throw new UserError(
      'Could not extract the run from environment `GITHUB_RUN_NUMBER`'
    );
  }

  if (!commit_hash) {
    throw new UserError(
      'Could not extract the commit_hash from environment `GITHUB_SHA`'
    );
  }

  if (!repo) {
    throw new UserError(
      "Could not extract the repo from environment `GITHUB_REPOSITORY` - expected format 'owner/repository'"
    );
  }

  if (!branch_name) {
    throw new UserError(
      "Could not extract the branch_name from environment `GITHUB_HEAD_REF` - this needs to be triggered off the 'pull request event'"
    );
  }

  if (user === '') {
    console.log(`Could not identify commit author from 'GITHUB_CONTEXT', ignoring.`);
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
