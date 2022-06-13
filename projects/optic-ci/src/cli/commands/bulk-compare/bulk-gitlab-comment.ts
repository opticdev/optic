import { trackEvent } from '../../segment';
import { GitlabClient } from '../../clients/gitlab-client';
import { BulkUploadJson } from '@useoptic/openapi-utilities';
import { generateHashForComparison } from '../utils/comparison-hash';
import { UserError } from '../../errors';
import { createBulkCommentBody } from './comment';

export const sendBulkGitlabMessage = async ({
  gitlabToken,
  uploadOutput,
  baseUrl,
}: {
  gitlabToken: string;
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
  const gitlabClient = new GitlabClient(baseUrl, gitlabToken);
  const projectPath = encodeURIComponent(`${owner}/${repo}`);
  try {
    const reviewers = await gitlabClient.listMergeRequestReviewers(
      projectPath,
      pull_number
    );

    trackEvent('optic_ci.bulk_gitlab_comment', `${owner}-optic-ci`, {
      owner,
      repo,
      pull_number,
      org_repo_pr: `${owner}/${repo}/${pull_number}`,
      number_of_reviewers: reviewers.length,
    });
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
  let maybeOpticCommentId: number | null = null;
  try {
    const mergeRequestComments = await gitlabClient.listMergeRequestComment(
      projectPath,
      pull_number
    );
    const matchingComment = mergeRequestComments.find((comment) => {
      return new RegExp(comparisonsHash).test(comment.body);
    });

    if (matchingComment) {
      maybeOpticCommentId = matchingComment.id;
    }
  } catch (e) {
    console.error(e);
    throw new UserError();
  }

  try {
    if (maybeOpticCommentId) {
      await gitlabClient.updateMergeRequestComment(
        projectPath,
        pull_number,
        maybeOpticCommentId,
        body
      );
    } else {
      await gitlabClient.createMergeRequestComment(
        projectPath,
        pull_number,
        body
      );
    }
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};
