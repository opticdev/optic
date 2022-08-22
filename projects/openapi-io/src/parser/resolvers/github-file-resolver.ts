import path from 'path';
import { ono } from '@jsdevtools/ono';
import { ResolverError } from '@apidevtools/json-schema-ref-parser';
import { Octokit } from '@octokit/rest';
import { ExternalRefHandler } from '../types';

export const createGithubFileResolver = (
  gitDetails: {
    owner: string;
    repo: string;
    sha: string;
  },
  octokit: Octokit
): ExternalRefHandler => ({
  order: 1,
  canRead: () => true,
  read: async (file) => {
    const { owner, repo, sha } = gitDetails;
    const gitPath = path.relative(process.cwd(), file.url);
    try {
      const response = await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          owner,
          repo,
          path: gitPath,
          ref: sha,
          headers: {
            accept: 'application/vnd.github.VERSION.raw'
          }
        }
      );
      if (typeof response.data === 'string') {
        return response.data as string // octokit typing doesn't recognize header accept changes
      } else {
        throw new ResolverError(
          ono(new Error('Expected a text response')),
          gitPath
        );
      }
    } catch (e) {
      throw new ResolverError(
        ono(e as Error, 'Error fetching file from github.'),
        gitPath
      );
    }
  },
});
