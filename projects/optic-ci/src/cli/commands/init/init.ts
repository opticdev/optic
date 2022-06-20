import fs from 'fs';
import { findOpenAPISpecs } from './find-openapi-specs';
import { generateOpticConfig } from './generate-optic-config';
import { writeOpticConfig } from './write-optic-config';
import { hasGit, isInGitRepo } from './check-git';
import { configFile } from './constants';

export const init = async (): Promise<void> => {
  if (!(await hasGit())) {
    console.error('Error: git must be available in PATH for "init" to work.');
    return;
  }
  if (!(await isInGitRepo())) {
    console.error('Error: "init" must be called from a git repository.');
    return;
  }
  if (fs.existsSync(configFile)) {
    console.error(
      `Error: a pre-existing "${configFile}" file was found. If you wish to re-run "init", remove this file first.`
    );
    return;
  }
  const openApiSpecs = await findOpenAPISpecs();
  const opticConfig = generateOpticConfig(openApiSpecs);
  await writeOpticConfig(opticConfig);
};
