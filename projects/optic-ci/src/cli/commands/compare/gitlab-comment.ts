import { trackEvent } from '../../segment';
import { generateHashForComparison } from '../utils/comparison-hash';
import { CompareFileJson, UploadJson } from '@useoptic/openapi-utilities';
import { UserError } from '../../errors';
import { createCommentBody } from './comment';
import { GitlabClient } from '../../clients/gitlab-client';

export const sendGitlabMessage = async ({
  gitlabToken,
  compareOutput,
  uploadOutput,
  baseUrl,
}: {
  gitlabToken: string;
  compareOutput: CompareFileJson;
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
  const gitlabClient = new GitlabClient(baseUrl, gitlabToken);
  const projectPath = encodeURIComponent(`${owner}/${repo}`);

  try {
    const reviewers = await gitlabClient.listMergeRequestReviewers(
      projectPath,
      pull_number
    );

    trackEvent('optic_ci.gitlab_comment', `${owner}-optic-ci`, {
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

  // Given we don't have the comment id; we need to fetch all comments on a PR.
  // We don't want to spam the comments, we want to update to the latest
  let maybeOpticCommentId: number | null = null;
  try {
    const mergeRequestComments = await gitlabClient.listMergeRequestComment(
      projectPath,
      pull_number
    );
    const matchingComment = mergeRequestComments.find((comment) => {
      return new RegExp(compareHash).test(comment.body);
    });

    if (matchingComment) {
      maybeOpticCommentId = matchingComment.id;
    }
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
