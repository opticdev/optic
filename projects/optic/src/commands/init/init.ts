import path from 'path';
import { dump } from 'js-yaml';
import { findOpenAPISpecs } from './find-openapi-specs';
import { generateOpticConfig } from './generate-optic-config';
import { writeOpticConfig } from './write-optic-config';
import { hasGit, isInGitRepo, getRootPath } from '../../utils/git-utils';
import { OPTIC_YML_NAME } from '../../config';
import { getValidSpecs } from './get-valid-specs';
import { OpticCliConfig } from '../../config';
import { supportedCIs, SupportedCI } from './constants';
import { writeCIAction } from './write-ci-action';

export type InitOptions = {
  ci?: SupportedCI;
};

export const getInit =
  (config: OpticCliConfig) =>
  async ({ ci }: InitOptions): Promise<void> => {
    // Sanity checks
    if (config.configPath) {
      console.error(
        `Error: a configuration file already exists at ${config.configPath}.`
      );
      process.exitCode = 1;
      return;
    }

    if (!(await hasGit())) {
      console.error('Error: git must be available in PATH for "init" to work.');
      process.exitCode = 1;
      return;
    }

    if (!(await isInGitRepo())) {
      console.error('Error: "init" must be called from a git repository.');
      process.exitCode = 1;
      return;
    }

    if (ci && !supportedCIs.includes(ci)) {
      console.error(
        `Error: unsupported ci: ${ci}. Supported values: ${supportedCIs.join(
          ', '
        )}`
      );
      process.exitCode = 1;
      return;
    }

    const gitRoot = await getRootPath();
    const configPath = path.join(gitRoot, OPTIC_YML_NAME);

    console.log('Initializing Optic...');

    // Find valid spec files
    console.log(`Detecting OpenAPI specs in ${gitRoot}...`);
    const openApiSpecPaths = await findOpenAPISpecs();
    const validSpecs = await getValidSpecs(openApiSpecPaths);

    // Write configuration
    if (validSpecs.length) {
      console.log();
      console.log(
        `Found ${validSpecs.length} valid spec${
          validSpecs.length !== 1 ? 's' : ''
        }`
      );

      if (validSpecs.length < openApiSpecPaths.length) {
        const validSpecPaths = validSpecs.map((spec) => spec.path);
        const invalidSpecPaths = openApiSpecPaths.filter(
          (spec) => !validSpecPaths.includes(spec)
        );

        console.log();
        console.log(
          `The following ${invalidSpecPaths.length} spec${
            invalidSpecPaths.length !== 1 ? 's' : ''
          } look like OpenAPI specs but couldn't be parsed:`
        );

        invalidSpecPaths.forEach((spec) => console.log(`- ${spec}`));
      }

      const opticConfig = generateOpticConfig(validSpecs, gitRoot);
      const opticConfigYml = dump(opticConfig);
      await writeOpticConfig(opticConfigYml, configPath);

      console.log();
      console.log(`Adding files:`);
      for (const spec of opticConfig.files) {
        console.log(`- path: ${spec.path}`);
        console.log(`  id: ${spec.id}`);
      }

      console.log();
      console.log('Adding ruleset:');
      console.log();
      for (const ruleset of opticConfig.ruleset) {
        console.log(`- ${ruleset}`);
      }

      console.log();
      console.log(
        'File IDs are stable identifiers for your API specifications that will appear in Optic.'
      );
      console.log(
        'You can change them now before you check in the optic.yml file.'
      );
    } else {
      console.error(
        'No valid specification files were found: not writing Optic configuration file.'
      );
    }

    if (ci) {
      console.log('');
      writeCIAction(gitRoot, ci);
    }
  };
