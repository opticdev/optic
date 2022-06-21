import fs from 'fs';
import { findOpenAPISpecs } from './find-openapi-specs';
import { generateOpticConfigYml } from './generate-optic-config';
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
    console.error(`Error: a pre-existing "${configFile}" file was found.`);
    return;
  }
  const openApiSpecs = await findOpenAPISpecs();
  console.log(
    `Optic found ${openApiSpecs.length} candidate OpenAPI spec files.`
  );
  console.log(`Writing Optic onfiguration file...`);
  const opticConfigYml = generateOpticConfigYml(openApiSpecs);
  await writeOpticConfig(opticConfigYml);
  console.log(`Optic onfiguration file was written to ${configFile}.`);
};
