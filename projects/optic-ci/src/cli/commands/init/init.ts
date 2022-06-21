import fs from 'fs';
import { dump } from 'js-yaml';
import { findOpenAPISpecs } from './find-openapi-specs';
import { generateOpticConfig } from './generate-optic-config';
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

  console.log('Running Optic initialization...');

  const openApiSpecPaths = await findOpenAPISpecs();
  const validSpecs = await getValidSpecs(openApiSpecPaths);
  console.log(
    `Found ${openApiSpecPaths.length} candidate OpenAPI specification files, ${validSpecs.length} of which are valid.`
  );

  if (validSpecs.length) {
    const opticConfig = generateOpticConfig(validSpecs);
    await writeOpticConfig(dump(opticConfig));

    console.log(`The following identifiers were generated in ${configFile}:\n`);

    for (const spec of opticConfig.files) {
      console.log(`  path: ${spec.path}`);
      console.log(`  id: ${spec.id}\n`);
    }

    console.log(
      'Those ids are meant to be stable: if you wish to change them, change them now.'
    );
  } else {
    console.error(
      'No specification files found: failed to write Optic config file.'
    );
  }
};
