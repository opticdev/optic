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
    logger.warn(chalk.red('Could not identify your APIs with Optic cloud'));
    logger.warn(
      "Optic identifies your APIs by their path in the repository and the repository's Git remote origin, but the latter could not be determined."
    );
    logger.warn(
      "Either set your repository's Git remote and run the command again, or add an identifier to your specification: run `optic api new <name>` and follow the instructions.\n"
    );
    return null;
  } else if (!orgRes.ok) {
    logger.error(
      `Optic encountered an error trying to connect APIs to Optic cloud: ${orgRes.error}`
    );
    return null;
  }
  return null;
}
