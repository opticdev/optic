import fs from 'fs';
import { findOpenAPISpecs } from './find-openapi-specs';
import { generateOpticConfigYml } from './generate-optic-config';
import { writeOpticConfig } from './write-optic-config';
import { hasGit, isInGitRepo } from './check-git';
import { configFile } from './constants';
import { getValidSpecs } from './get-valid-specs';

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
  const openApiSpecPaths = await findOpenAPISpecs();
  console.log(`Found ${openApiSpecPaths.length} candidate OpenAPI spec files.`);
  const validSpecs = await getValidSpecs(openApiSpecPaths);
  console.log(`${validSpecs.length} of which are valid OpenAPI files.`);
  const opticConfigYml = generateOpticConfigYml(validSpecs);
  await writeOpticConfig(opticConfigYml);
  console.log(`Optic onfiguration file was written to ${configFile}.`);
};
