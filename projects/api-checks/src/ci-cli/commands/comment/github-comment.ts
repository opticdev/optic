import { Command, Option } from 'commander';
import { Octokit } from '@octokit/rest';
import {
  loadFile,
  readAndValidateGithubContext,
  readAndValidateCircleCiContext,
} from '../utils';
import { trackEvent } from '../../segment';
import { wrapActionHandlerWithSentry } from '../../sentry';
import { findOpticCommentId } from './shared-comment';
import { UploadFileJson } from '@useoptic/openapi-utilities';

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
  const uploadFileResults = await loadFile(upload);
  // TODO write this in a validation step and error to give better errors to the user
  const {
    opticWebUrl,
    results,
    changes,
    ciContext,
  }: UploadFileJson = JSON.parse(uploadFileResults.toString());

  if (changes.length === 0) {
    console.log('No changes were found, exiting.');
    return;
  }
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

  trackEvent('optic_ci.github_comment', `${owner}-optic-ci`, {
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
    GITHUB_COMMENT_IDENTIFIER,
    owner,
    repo,
    pull_number
  );
  const failingChecks = results.filter((result) => !result.passed).length;
  const totalChecks = results.filter((result) => !result.passed).length;
  const passingChecks = totalChecks - failingChecks;

  const body = `
  <!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${GITHUB_COMMENT_IDENTIFIER} -->
  ## View Changes in Optic

  The latest run at commit ${ciContext.commit_hash} detected:
  - ${changes.length} API changes
  - ${passingChecks} checks passed out of ${totalChecks} total checks (${failingChecks} failing checks).

  The API changes can be viewed at ${opticWebUrl}
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
