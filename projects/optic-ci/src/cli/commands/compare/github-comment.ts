import { Octokit } from '@octokit/rest';
import { trackEvent } from '../../segment';
import { findOpticCommentId } from '../utils/shared-comment';
import { generateHashForComparison } from '../utils/comparison-hash';
import { CompareJson, UploadJson } from '../../types';
import { UserError } from '../../errors';
import { createCommentBody } from './comment';

export const sendGithubMessage = async ({
  githubToken,
  compareOutput,
  uploadOutput,
  baseUrl,
}: {
  githubToken: string;
  compareOutput: CompareJson;
  uploadOutput: UploadJson;
  baseUrl: string;
}) => {
  const { results, changes } = compareOutput;
  const compareHash = generateHashForComparison({
    results,
    changes,
  });
  const { opticWebUrl, ciContext } = uploadOutput;
  const {
    organization: owner,
    repo,
    pull_request: pull_number,
    commit_hash,
    run,
  } = ciContext;

  if (changes.length === 0) {
    console.log('No changes were found, exiting.');
    return;
  }
  const octokit = new Octokit({
    auth: githubToken,
    baseUrl,
  });

  try {
    const { data: requestedReviewers } =
      await octokit.pulls.listRequestedReviewers({
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
      org_repo_pr: `${owner}/${repo}/${pull_number}`,
    });
  } catch (e) {
    console.error(e);
    throw new UserError();
  }

  // Given we don't have the comment id; we need to fetch all comments on a PR.
  // We don't want to spam the comments, we want to update to the latest
  let maybeOpticCommentId: number | null;
  try {
    maybeOpticCommentId = await findOpticCommentId(
      octokit,
      compareHash,
      owner,
      repo,
      pull_number
    );
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
  const body = createCommentBody(
    results,
    changes,
    compareHash,
    commit_hash,
    run,
    opticWebUrl
  );

  try {
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
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};
