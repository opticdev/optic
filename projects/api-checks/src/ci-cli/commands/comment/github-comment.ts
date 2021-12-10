import { Command, Option } from 'commander';
import { Octokit } from '@octokit/rest';
import {
  readAndValidateGithubContext,
  readAndValidateCircleCiContext,
} from '../ci-context-parsers';
import { loadFile } from '../utils';
import { trackEvent } from '../../segment';
import { wrapActionHandlerWithSentry, SentryClient } from '../../sentry';

export const registerGithubComment = (cli: Command) => {
  cli
    .command('github-comment')
    .requiredOption('--token <token>', 'github token')
    .addOption(
      new Option(
        '--provider <provider>',
        'The name of the ci-provider, supported'
      )
        .choices(['github', 'circleci'])
        .makeOptionMandatory()
    )
    .requiredOption('--ci-context <ciContext>', 'file with github context')
    .requiredOption('--upload <upload>', 'the file path to the upload output')
    .action(
      wrapActionHandlerWithSentry(
        async (runArgs: {
          token: string;
          ciContext: string;
          provider: 'github' | 'circleci';
          upload: string;
        }) => {
          try {
            const fileBuffer = await loadFile(runArgs.ciContext);
            const { organization: owner, repo, pull_request: pull_number } =
              runArgs.provider === 'github'
                ? readAndValidateGithubContext(fileBuffer)
                : readAndValidateCircleCiContext(fileBuffer);

            await sendMessage({
              githubToken: runArgs.token,
              owner: owner,
              repo: repo,
              pull_number: Number(pull_number),
              upload: runArgs.upload,
            });
          } catch (e) {
            console.error(e);
            SentryClient && SentryClient.captureException(e);
            return process.exit(1);
          }
        }
      )
    );
};

// The identifier we use to find the Optic Comment
// TODO is there a better way to track and identify Optic comments for comment / replace?
const GITHUB_COMMENT_IDENTIFIER =
  'INTERNAL-OPTIC-COMMENT-IDENTIFIER-1234567890';

const sendMessage = async ({
  githubToken,
  owner,
  repo,
  pull_number,
  upload,
}: {
  githubToken: string;
  owner: string;
  repo: string;
  pull_number: number;
  upload: string;
}) => {
  // the format should match src/ci-cli/commands/upload/upload.ts
  const uploadFileResults = await loadFile(upload);
  // TODO write this in a validation step and error to give better errors to the user
  const { opticWebUrl }: { opticWebUrl: string } = JSON.parse(
    uploadFileResults.toString()
  );

  const octokit = new Octokit({
    auth: githubToken,
  });

  const {
    data: requestedReviewers,
  } = await octokit.pulls.listRequestedReviewers({
    owner,
    repo,
    pull_number,
  });

  trackEvent('optic_ci_github_comment', {
    owner,
    repo,
    pull_number,
    number_of_reviewers:
      requestedReviewers.users.length + requestedReviewers.teams.length,
  });

  // Given we don't have the comment id; we need to fetch all comments on a PR.
  // We don't want to spam the comments, we want to update to the latest
  const maybeOpticCommentId = await findOpticCommentId(
    octokit,
    owner,
    repo,
    pull_number
  );

  const body = `
  <!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${GITHUB_COMMENT_IDENTIFIER} -->
  ## View Changes in Optic

  The OpenAPI changes can be viewed at ${opticWebUrl}
`;

  if (maybeOpticCommentId) {
    octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: maybeOpticCommentId,
      body,
    });
  } else {
    octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body,
    });
  }
};

const findOpticCommentId = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
): Promise<number | null> => {
  const PER_PAGE = 100;
  let page = 1;
  const comments = [];

  // Issues refer to top level comments in the PR
  const { data } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: pull_number,
    per_page: PER_PAGE,
    page,
  });
  comments.push(...data);

  let moreData = data.length >= PER_PAGE;

  while (moreData) {
    page += 1;
    const { data } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
      per_page: PER_PAGE,
      page,
    });
    moreData = data.length >= PER_PAGE;
    comments.push(...data);
  }

  return (
    comments.find((comment) =>
      new RegExp(GITHUB_COMMENT_IDENTIFIER).test(comment.body || '')
    )?.id || null
  );
};
