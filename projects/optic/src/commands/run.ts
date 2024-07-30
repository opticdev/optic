import { Command, Option } from 'commander';
import { OpticCliConfig } from '../config';
import { errorHandler } from '../error-handler';

import fs from 'fs';
import {
  CommentApi,
  GithubCommenter,
  GitlabCommenter,
} from './ci/comment/comment-api';
import { CiRunDetails } from '../utils/ci-data';
import {
  COMPARE_SUMMARY_IDENTIFIER,
  generateCompareSummaryMarkdown,
} from './ci/comment/common';
import { CustomUploadFn } from '../types';

const usage = () => `
  To see how Optic handles changes, run Optic in your repository a first time; then make
  changes to one or more of your OpenAPI files and run again:

  $ optic run

  Visit https://www.useoptic.com/docs/setup-ci for CI setup instructions.
`;

const severities = ['none', 'error'] as const;

function getProvider() {
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) return 'github';

  const gitlabToken = process.env.OPTIC_GITLAB_TOKEN;
  if (gitlabToken) return 'gitlab';
  else return null;
}

async function getGithubCommenter() {
  const eventFile = fs.readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8');
  const event = JSON.parse(eventFile);
  const pullRequest = event.pull_request.number;
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');
  const sha = process.env.GITHUB_SHA!;
  const token = process.env.GITHUB_TOKEN!;
  const commenter = new GithubCommenter({
    owner,
    repo,
    pullRequest,
    sha,
    token,
    enterpriseBaseUrl: process.env.GITHUB_API_URL,
  });
  return commenter;
}

async function getGitlabCommenter() {
  const commenter = new GitlabCommenter({
    token: process.env.OPTIC_GITLAB_TOKEN!,
    enterpriseBaseUrl: process.env.CI_SERVER_URL,
    projectId: process.env.CI_PROJECT_ID!,
    sha: process.env.CI_COMMIT_SHA!,
    mergeRequestId: process.env.CI_MERGE_REQUEST_IID!,
  });
  return commenter;
}

async function comment(data: CiRunDetails, commenter: CommentApi, sha: string) {
  const maybeComment: { id: string; body: string } | null =
    await commenter.getComment(COMPARE_SUMMARY_IDENTIFIER);

  const body = generateCompareSummaryMarkdown({ sha }, data, {
    verbose: false,
  });

  if (maybeComment) {
    await commenter.updateComment(maybeComment.id, body);
  } else {
    if (data.completed.length > 0 || data.failed.length > 0) {
      await commenter.createComment(body);
    }
  }
}

export function registerRunCommand(
  cli: Command,
  config: OpticCliConfig,
  options: { customUpload?: CustomUploadFn }
) {
  cli
    .command('run')
    .description(
      'CI workflow command that tests each OpenAPI specification in your repo and summarizes the results as a pull (or merge) request comment'
    )
    .configureHelp({ commandUsage: usage })
    .option(
      '-i, --ignore <glob_pattern,...>',
      'Glob patterns matching specifications to ignore'
    )
    .option(
      '-I, --include-git-ignored',
      'Include specifications matched in .gitignore',
      false
    )
    .addOption(
      new Option(
        '-s, --severity <severity>',
        'Control the exit code when there are issues: error=1, none=0'
      )
        .choices(severities)
        .default('error')
    )
    .argument(
      '[file_paths]',
      'Comma-seperated glob patterns matching specifications to process. When omitted, matches all non-ignored specifications.'
    )
    .action(errorHandler(getRunAction(config, options), { command: 'run' }));
}

type RunActionOptions = {
  ignore?: string;
  severity: (typeof severities)[number];
  includeGitIgnored: boolean;
};

export const getRunAction =
  (config: OpticCliConfig, customOptions: { customUpload?: CustomUploadFn }) =>
  async (matchArg: string | undefined, options: RunActionOptions) => {
    console.error(
      'Run is not supported - use `optic diff` or `optic diff-all` instead'
    );
    return;
  };
