import { Command, Option } from 'commander';

import { OpticCliConfig } from '../../../config';
import { CiRunDetails, readDataForCi } from '../../../utils/ci-data';
import {
  COMPARE_SUMMARY_IDENTIFIER,
  generateCompareSummaryMarkdown,
} from './common';
import { logger } from '../../../logger';
import { CommentApi, GithubCommenter, GitlabCommenter } from './comment-api';
import { errorHandler } from '../../../error-handler';
import chalk from 'chalk';

const usage = () => `
  GITHUB_TOKEN=<github-token> optic ci comment --provider github --owner <repo-owner> --repo <repo-name> --pull-request <pr-number> --sha <commit-sha>
  GITLAB_TOKEN=<gitlab-token> optic ci comment --provider gitlab --project-id <project-id> --merge-request-id <merge-request-id> --sha <commit-sha>
`;

export const registerCiComment = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('comment')
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
    .option(
      '--enterprise-base-url <enterprise-base-url>',
      '(only for enterprise versions of github or gitlab) - the base url to your enterprise github / gitlab instance'
    )
    .description('comment on a pull request / merge request')
    .action(errorHandler(getCiCommentAction(config)));
};

type UnvalidatedOptions = {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  pullRequest?: string;
  projectId?: string;
  mergeRequestId?: string;
  sha: string;
  enterpriseBaseUrl?: string;
};

type CiCommentActionOptions =
  | {
      provider: 'github';
      owner: string;
      repo: string;
      pullRequest: string;
      sha: string;
      enterpriseBaseUrl?: string;
    }
  | {
      provider: 'gitlab';
      projectId: string;
      mergeRequestId: string;
      sha: string;
      enterpriseBaseUrl?: string;
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

    let data: CiRunDetails;
    try {
      data = await readDataForCi();
    } catch (e) {
      logger.error(
        'Could not find a valid ci run details file. CI run detail files are generated from `optic diff` and `optic diff-all` when run in ci (`CI=true`)'
      );
      logger.error(e);
      process.exitCode = 1;
      return;
    }
    const commenter: CommentApi =
      options.provider === 'github'
        ? new GithubCommenter({ ...options, token: githubToken })
        : new GitlabCommenter({ ...options, token: gitlabToken });

    const maybeComment: { id: string; body: string } | null =
      await commenter.getComment(COMPARE_SUMMARY_IDENTIFIER);
    const body = generateCompareSummaryMarkdown({ sha: options.sha }, data);

    if (maybeComment) {
      // If there's a comment already, we need to check whether this session newer than the posted comment
      await commenter.updateComment(maybeComment.id, body);
    } else {
      // if does not have comment, we should only comment when there is a completed or failed session
      if (data.completed.length > 0 || data.failed.length > 0) {
        await commenter.createComment(body);
      }
    }

    logger.log(body);
    if (data.failed.length || data.noop.length)
      logger.log(
        chalk.red(`${data.failed.length + data.noop.length} failures`)
      );
    if (data.completed.length) {
      logger.log('Visual Changelogs:');
      data.completed.forEach((result) => {
        const results = result.warnings.length
          ? `${result.warnings.length}/${result.comparison.results.length} failures`
          : `all ${result.comparison.results.length} checks passed`;

        const leadIcon = result.warnings.length
          ? chalk.red('⚠')
          : chalk.green('✓');
        logger.log(
          `- ${leadIcon} ${result.apiName} (${results})  \n  ${chalk.blue(
            result.opticWebUrl
          )}`
        );
      });
    }
  };
