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
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          owner,
          repo,
          path: gitPath,
          ref: sha,
        }
      );
      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString();
      } else {
        throw new ResolverError(
          ono(new Error('No content key from github response')),
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
