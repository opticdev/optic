import * as Git from './git-utils';
import { getOrganizationFromToken } from './organization';
import { OpticCliConfig } from '../config';
import { logger } from '../logger';
import chalk from 'chalk';

export async function getDetailsForGeneration(config: OpticCliConfig): Promise<{
  default_branch: string;
  default_tag: string;
  web_url: string;
  organization_id: string;
} | null> {
  let default_branch: string = 'main';
  let default_tag: string = 'gitbranch:main';
  const maybeOrigin = await Git.guessRemoteOrigin();

  const message = `Select the organization that your APIs belong to. Use an organization token to disambiguate in non interactive environments.`;
  const orgRes = await getOrganizationFromToken(config.client, message);

  const maybeDefaultBranch = await Git.getDefaultBranchName();
  if (maybeDefaultBranch) {
    default_branch = maybeDefaultBranch;
    default_tag = `gitbranch:${default_branch}`;
  }

  if (maybeOrigin && orgRes.ok) {
    return {
      default_branch,
      default_tag,
      web_url: maybeOrigin.web_url,
      organization_id: orgRes.org.id,
    };
  } else if (!maybeOrigin) {
    logger.warn(
      chalk.yellow(
        'Could not guess the git remote origin - cannot automatically connect apis with optic cloud'
      )
    );
    logger.warn(
      `To fix this, ensure that the git remote is set, or manually add x-optic-url to the specs you want to track.`
    );
    return null;
  } else if (!orgRes.ok) {
    logger.error(orgRes.error);
    logger.error('skipping automatically connect apis with optic cloud');
    return null;
  }
  return null;
}
