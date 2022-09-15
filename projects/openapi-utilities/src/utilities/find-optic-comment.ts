import { Octokit } from '@octokit/rest';

export const OPTIC_COMMENT_SURVEY_LINK = 'https://forms.gle/9CgSy6ytjeLasnfWA';
export const getCommentId = (appId: string) => `optic-status-comment-${appId}`;

export const findOpticCommentId = async (
  octokit: Octokit,
  appId: string,
  owner: string,
  repo: string,
  pull_number: number
): Promise<number | null> => {
  const PER_PAGE = 100;
  let page = 1;
  let hasMore = true;

  const opticCommentRegex = new RegExp(getCommentId(appId));

  type GHComment = Awaited<
    ReturnType<typeof octokit.rest.issues.listComments>
  >['data'][number];

  const isOpticComment = (comment: GHComment): boolean =>
    opticCommentRegex.test(comment.body ?? '');

  while (hasMore) {
    const { data } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
      per_page: PER_PAGE,
      page,
    });
    const opticComment = data.find(isOpticComment);
    if (opticComment) return opticComment.id;
    page += 1;
    hasMore = data.length >= PER_PAGE;
  }

  return null;
};
