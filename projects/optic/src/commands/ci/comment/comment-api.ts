export interface CommentApi {
  getComment: (
    commentIdentifier: string
  ) => Promise<{ id: string; body: string } | null>;
  getShaCreatedAt: (sha: string) => Promise<Date>;
  updateComment: (commentId: string, body: string) => Promise<void>;
  createComment: (body: string) => Promise<void>;
}
