import fs from 'fs';
import path from 'path';
import { dump } from 'js-yaml';
import { findOpenAPISpecs } from './find-openapi-specs';
import { generateOpticConfig } from './generate-optic-config';
import { writeOpticConfig } from './write-optic-config';
import { hasGit, isInGitRepo, getRootPath } from '../../utils/git-utils';
import { configFile } from './constants';
import { getValidSpecs } from './get-valid-specs';

export const init = async (): Promise<void> => {
  // Sanity checks
  if (!(await hasGit())) {
    console.error('Error: git must be available in PATH for "init" to work.');
    return;
  }

  if (!(await isInGitRepo())) {
    console.error('Error: "init" must be called from a git repository.');
    return;
  }

  const gitRoot = await getRootPath();
  const configPath = path.join(gitRoot, configFile);

  if (fs.existsSync(configPath)) {
    console.error(
      `Error: a configuration file already exists at ${configPath}.`
    );
    return;
  }

  console.log('Initializing Optic...');

  // Find valid spec files
  const openApiSpecPaths = await findOpenAPISpecs();
  const validSpecs = await getValidSpecs(openApiSpecPaths);

  console.log(
    `Found ${openApiSpecPaths.length} candidate OpenAPI specification files, ${validSpecs.length} of which are valid.`
  );

  // Write configuration
  if (validSpecs.length) {
    const opticConfig = generateOpticConfig(validSpecs, gitRoot);
    const opticConfigYml = dump(opticConfig);
    await writeOpticConfig(opticConfigYml, configPath);

    console.log(
      `The following specification files were identified in ${configPath}:\n`
    );

    for (const spec of opticConfig.files) {
      console.log(`  path: ${spec.path}`);
      console.log(`  id: ${spec.id}\n`);
    }

    console.log(
      'These IDs are stable identifiers for your API specifications that will appear in Optic. You can change them now before you check in the optic.yml file.'
    );
  } else {
    console.error(
      'No valid specification files were found: not writing Optic configuration file.'
    );
  }
};
