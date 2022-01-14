import { Octokit } from '@octokit/rest';
import { loadFile } from '../utils';
import { trackEvent } from '../../segment';
import { findOpticCommentId } from '../utils/shared-comment';
import { CompareJson, UploadJson } from '../../types';

// The identifier we use to find the Optic Comment
// TODO is there a better way to track and identify Optic comments for comment / replace?
const GITHUB_COMMENT_IDENTIFIER =
  'INTERNAL-OPTIC-COMMENT-IDENTIFIER-1234567890';

export const sendGithubMessage = async ({
  githubToken,
  compareOutput,
  uploadOutput,
}: {
  githubToken: string;
  compareOutput: CompareJson;
  uploadOutput: UploadJson;
}) => {
  const { results, changes } = compareOutput;
  const { opticWebUrl, ciContext } = uploadOutput;
  const {
    organization: owner,
    repo,
    pull_request: pull_number,
    commit_hash,
  } = ciContext;

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

  The latest run at commit ${commit_hash} detected:
  - ${changes.length} API changes
  - ${passingChecks} checks passed out of ${totalChecks} total checks (${failingChecks} failing checks).

  The API changes can be viewed at ${opticWebUrl}
`;

  if (maybeOpticCommentId) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: maybeOpticCommentId,
      body,
    });
  } else {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body,
    });
  }
};
