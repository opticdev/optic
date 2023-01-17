import { Command, Option } from 'commander';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import { OpticCliConfig } from '../../../config';
import { readDataForCi } from '../../../utils/ci-data';
import {
  COMPARE_SUMMARY_IDENTIFIER,
  generateCompareSummaryMarkdown,
  getMetadataFromMarkdown,
} from './common';
import { logger } from '../../../logger';
import { CommentApi } from './comment-api';

const usage = () => `
  GITHUB_TOKEN=<github-token> optic ci comment --provider github --owner <repo-owner> --repo <repo-name> --pull-request <pr-number> --sha <commit-sha>
  GITLAB_TOKEN=<gitlab-token> optic ci comment --provider gitlab --project-id <project-id> --merge-request-id <merge-request-id> --sha <commit-sha>
`;

export const registerCiComment = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('comment', { hidden: true })
    .configureHelp({
      commandUsage: usage,
    })
    .addOption(
      new Option(
        '--provider <provider>',
        `the git provider where you want to post this comment. supported providers are: 'github', 'gitlab'`
      )
        .choices(['github', 'gitlab'])
        .makeOptionMandatory()
    )
    .option(
      '--owner <owner>',
      '[github only] the owner of the repo (this can be an organization or a user)'
    )
    .option('--repo <repo>', '[github only] the name of the repo')
    .option(
      '--pull-request <pull-request>',
      '[github only] the pull request number on the repo'
    )
    .requiredOption('--sha <sha>', 'the git sha of this run')
    .option(
      '--project-id <project-id>',
      '[gitlab only] the project id of the project'
    )
    .option(
      '--merge-request-id <merge-request-id>',
      '[gitlab only] the merge request iid in the repo'
    )
    .description('comment on a pull request / merge request')
    .action(wrapActionHandlerWithSentry(getCiCommentAction(config)));
};

type UnvalidatedOptions = {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  pullRequest?: string;
  projectId?: string;
  mergeRequestId?: string;
  sha: string;
};

type CiCommentActionOptions =
  | {
      provider: 'github';
      owner: string;
      repo: string;
      pullRequest: string;
      sha: string;
    }
  | {
      provider: 'gitlab';
      projectId: string;
      mergeRequestId: string;
      sha: string;
    };

const getCiCommentAction =
  (config: OpticCliConfig) => async (_options: UnvalidatedOptions) => {
    const githubToken = process.env.GITHUB_TOKEN!;
    const gitlabToken = process.env.GITLAB_TOKEN!;
    if (
      _options.provider === 'github' &&
      (!_options.owner ||
        !_options.repo ||
        !_options.pullRequest ||
        !_options.sha)
    ) {
      logger.error(
        'option --provider github must include --owner, --repo, --pull-request and --sha'
      );
      process.exitCode = 1;
      return;
    } else if (
      _options.provider === 'gitlab' &&
      (!_options.projectId || !_options.mergeRequestId || !_options.sha)
    ) {
      logger.error(
        'option --provider gitlab must include --project-id, --merge-request-id and --sha'
      );
      process.exitCode = 1;
      return;
    } else if (_options.provider === 'github' && !githubToken) {
      logger.error(
        'no github token was found. Ensure that the environment variable GITHUB_TOKEN is set'
      );
      process.exitCode = 1;
      return;
    } else if (_options.provider === 'gitlab' && !gitlabToken) {
      logger.error(
        'no gitlab token was found. Ensure that the environment variable GITLAB_TOKEN is set'
      );
      process.exitCode = 1;
      return;
    }

    const options = _options as CiCommentActionOptions;

    const data = await readDataForCi();
    const commenter: CommentApi = {} as any; // TODO

    const maybeComment: { id: string; body: string } | null =
      await commenter.getComment(COMPARE_SUMMARY_IDENTIFIER);
    const commitCreatedAt = await commenter.getShaCreatedAt(options.sha);
    const body = generateCompareSummaryMarkdown(
      {
        sha: options.sha,
        timestamp: commitCreatedAt.toISOString(),
      },
      data
    );

    if (maybeComment) {
      // If there's a comment already, we need to check whether this session newer than the posted comment
      const maybeMetadata = getMetadataFromMarkdown(maybeComment.body);
      const shouldWriteComment =
        !!maybeMetadata && commitCreatedAt > maybeMetadata.date;
      if (shouldWriteComment) {
        await commenter.updateComment(maybeComment.id, body);
      }
    } else {
      // if does not have comment, we should only comment when there is a completed or failed session
      if (data.completed.length > 0 || data.failed.length > 0) {
        await commenter.createComment(body);
      }
    }
  };
