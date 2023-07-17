import { Octokit } from '@octokit/rest';
import {
  BulkUploadJson,
  findOpticCommentId,
  UserError,
} from '@useoptic/openapi-utilities';
import { generateHashForComparison } from '@useoptic/openapi-utilities/build/utilities/comparison-hash';
import { trackEvent } from '@useoptic/openapi-utilities/build/utilities/segment';
import { createBulkCommentBody } from './comment';
import fetch from 'node-fetch';

export const sendBulkGithubMessage = async ({
  githubToken,
  uploadOutput,
  baseUrl,
}: {
  githubToken: string;
  uploadOutput: BulkUploadJson;
  baseUrl: string;
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
    baseUrl,
    request: { fetch },
  });

  try {
    const { data: requestedReviewers } =
      await octokit.pulls.listRequestedReviewers({
        owner,
        repo,
        pull_number,
      });

    trackEvent(
      'optic_ci.bulk_github_comment',
      {
        owner,
        repo,
        pull_number,
        org_repo_pr: `${owner}/${repo}/${pull_number}`,
        number_of_reviewers:
          requestedReviewers.users.length + requestedReviewers.teams.length,
      },
      `${owner}-optic-ci`
    );
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
  const comparisonsHash = generateHashForComparison(
    comparisons.map((comparison) => ({
      results: comparison.results,
      changes: comparison.changes,
    }))
  );
  const body = createBulkCommentBody(
    comparisons,
    comparisonsHash,
    commit_hash,
    run
  );

  // Given we don't have the comment id; we need to fetch all comments on a PR.
  // We don't want to spam the comments, we want to update to the latest
  let maybeOpticCommentId: number | null;
  try {
    maybeOpticCommentId = await findOpticCommentId(
      octokit,
      comparisonsHash,
      owner,
      repo,
      pull_number
    );
  } catch (e) {
    console.error(e);
    throw new UserError();
  }

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
