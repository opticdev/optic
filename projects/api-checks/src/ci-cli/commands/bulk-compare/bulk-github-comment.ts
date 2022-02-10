import { Octokit } from '@octokit/rest';
import { trackEvent } from '../../segment';
import {
  findOpticCommentId,
  OPTIC_COMMENT_SURVEY_LINK,
} from '../utils/shared-comment';
import { BulkUploadJson } from '../../types';

// The identifier we use to find the Optic Comment
// TODO is there a better way to track and identify Optic comments for comment / replace?
const GITHUB_COMMENT_IDENTIFIER =
  'INTERNAL-OPTIC-BULK-COMMENT-IDENTIFIER-1234567890';

export const sendBulkGithubMessage = async ({
  githubToken,
  uploadOutput,
}: {
  githubToken: string;
  uploadOutput: BulkUploadJson;
}) => {
  const { comparisons, ciContext } = uploadOutput;
  const {
    organization: owner,
    repo,
    pull_request: pull_number,
    commit_hash,
    run,
  } = ciContext;

  if (comparisons.length === 0) {
    console.log('No comparisons were found, exiting.');
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

  trackEvent('optic_ci.bulk_github_comment', `${owner}-optic-ci`, {
    owner,
    repo,
    pull_number,
    number_of_reviewers:
      requestedReviewers.users.length + requestedReviewers.teams.length,
  });

  const commentIdentifier = GITHUB_COMMENT_IDENTIFIER + '-' + commit_hash;

  // Given we don't have the comment id; we need to fetch all comments on a PR.
  // We don't want to spam the comments, we want to update to the latest
  const maybeOpticCommentId = await findOpticCommentId(
    octokit,
    commentIdentifier,
    owner,
    repo,
    pull_number
  );

  const renderedComparisons = comparisons.map((comparison) => {
    const { opticWebUrl, changes, inputs, results } = comparison;
    const failingChecks = results.filter((result) => !result.passed).length;
    const totalChecks = results.length;

    const comparisonDescription =
      inputs.from && inputs.to
        ? `changes to \`${inputs.from}\``
        : !inputs.from && inputs.to
        ? `new spec \`${inputs.to}\``
        : inputs.from && !inputs.to
        ? `removed spec \`${inputs.from}\``
        : 'empty specs';
    const body = `
#### Changelog for [${comparisonDescription}](${opticWebUrl})

  💡 **${changes.length}** API change${changes.length > 1 ? 's' : ''}
  ${
    failingChecks > 0
      ? `⚠️ **${failingChecks}** / **${totalChecks}** checks failed.`
      : totalChecks > 0
      ? `✅ all checks passed (**${totalChecks}**).`
      : `ℹ️ No automated checks have run.`
  }
`;
    return body;
  });

  const body = `<!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${commentIdentifier} -->
### Changes to your OpenAPI specs

Summary of run # ${run} results (${commit_hash}):

${renderedComparisons.join(`\n---\n`)}

------
How can Optic be improved? Leave your feedback [here](${OPTIC_COMMENT_SURVEY_LINK})
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
