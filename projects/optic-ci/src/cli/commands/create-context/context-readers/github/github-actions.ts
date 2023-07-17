import fs from 'fs/promises';
import { UserError } from '@useoptic/openapi-utilities';
import { NormalizedCiContext } from '@useoptic/openapi-utilities';

const getEventPayload = async (): Promise<any> => {
  if (process.env.GITHUB_EVENT_PATH) {
    try {
      const file = (
        await fs.readFile(process.env.GITHUB_EVENT_PATH)
      ).toString();
      return JSON.parse(file);
    } catch (e) {
      return null;
    }
  } else {
    return null;
  }
};

export const getContextFromGithubEnvironment =
  async (): Promise<NormalizedCiContext> => {
    const eventPayload = await getEventPayload();
    const organization = process.env.GITHUB_REPOSITORY_OWNER;
    const pull_request = process.env.GITHUB_REF?.match(
      /refs\/pull\/(.+)\/merge/i
    )?.[1];
    const run = process.env.GITHUB_RUN_NUMBER;
    const commit_hash =
      eventPayload?.pull_request?.head?.sha ?? process.env.GITHUB_SHA;
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
    const branch_name = process.env.GITHUB_HEAD_REF;
    const user: string | null =
      eventPayload?.pull_request?.head?.user?.login ?? null;

    if (!organization) {
      throw new UserError({
        message:
          'Could not extract the organization from environment `GITHUB_REPOSITORY_OWNER`',
      });
    }

    if (!pull_request) {
      throw new UserError({
        message: `Could not extract the pull request number from environment \`GITHUB_REF\` - 
expected format 'refs/pull/<pr_number>/merge' - this needs to be triggered off the 'pull request event'`,
      });
    }
    if (!run) {
      throw new UserError({
        message:
          'Could not extract the run from environment `GITHUB_RUN_NUMBER`',
      });
    }

    if (!commit_hash) {
      throw new UserError({
        message:
          'Could not extract the commit_hash from environment `GITHUB_SHA`',
      });
    }

    if (!repo) {
      throw new UserError({
        message:
          "Could not extract the repo from environment `GITHUB_REPOSITORY` - expected format 'owner/repository'",
      });
    }

    if (!branch_name) {
      throw new UserError({
        message:
          "Could not extract the branch_name from environment `GITHUB_HEAD_REF` - this needs to be triggered off the 'pull request event'",
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
