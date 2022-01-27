import { Octokit } from '@octokit/rest';

export const OPTIC_COMMENT_SURVEY_LINK = 'https://forms.gle/9CgSy6ytjeLasnfWA';

export const findOpticCommentId = async (
  octokit: Octokit,
  commitIdentifier: string,
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
      new RegExp(commitIdentifier).test(comment.body || '')
    )?.id || null
  );
};
