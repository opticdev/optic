import { Command, Option } from 'commander';
import { ParseResult, loadSpec } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import { UserError } from '@useoptic/openapi-utilities';
import { isYaml, writeYaml } from '@useoptic/openapi-io';
import fs from 'node:fs/promises';
import path from 'path';
import { errorHandler } from '../../error-handler';
const description = `dereference an OpenAPI specification`;

const usage = () => `
  optic dereference <file_path>
  optic dereference <file_path> > dereference.yml
  optic dereference <file_path> -o dereference.yml
`;
const helpText = `
Example usage:
  $ optic dereference openapi-spec.yml > dereference.yml
  `;

export const registerDereference = (cli: Command, config: OpticCliConfig) => {
  // TODO remove june 2023
  const filterXExtensions = new Option(
    '--filter-x-extensions [extensions]',
    'extensions to filter when truthy value set'
  ).hideHelp(true);
  const includeXExtensions = new Option(
    '--include-x-extensions [extensions]',
    'extensions to filter when truthy value set'
  ).hideHelp(true);

  cli
    .command('dereference')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description(description)
    .argument('[file_path]', 'openapi file to dereference')
    .option('-o [output]', 'output file name')
    .addOption(filterXExtensions)
    .addOption(includeXExtensions)
    .action(errorHandler(deferenceAction(config)));
};

const getDereferencedSpec = async (
  file1: string,
  config: OpticCliConfig
): Promise<ParseResult> => {
  try {
    return loadSpec(file1, config, {
      strict: false,
      denormalize: false,
    });
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    throw new UserError();
  }
};

type DereferenceActionOptions = {
  o: string;
  filterXExtensions: string;
  includeXExtensions: string;
};
const deferenceAction =
  (config: OpticCliConfig) =>
  async (filePath: string | undefined, options: DereferenceActionOptions) => {
    const { o, filterXExtensions, includeXExtensions } = options;

    const filterExtensions = (filterXExtensions || '')
      .split(/[ ,]+/)
      .filter((extension) => extension.startsWith('x-'));
    const includeExtensions = (includeXExtensions || '')
      .split(/[ ,]+/)
      .filter((extension) => extension.startsWith('x-'));

    let parsedFile: ParseResult;
    if (filePath) {
      parsedFile = await getDereferencedSpec(filePath, config);

      const specJson = parsedFile.jsonLike;

      if (includeExtensions.length) {
        Object.entries(specJson.paths).forEach(([path, operations]) => {
          Object.entries(operations!).forEach(([key, operation]) => {
            if (key === 'parameters') return;
            if (
              operation &&
              !includeExtensions.some((extension) =>
                Boolean(operation[extension])
              )
            ) {
              // @ts-ignore
              delete specJson.paths![path]![key]!;
              const otherKeys = Object.keys(specJson.paths![path] || {});
              if (
                otherKeys.length === 0 ||
                (otherKeys.length === 1 && otherKeys[0] === 'parameters')
              ) {
                delete specJson.paths![path];
              }
            }
          });
        });
      }

      if (filterExtensions.length) {
        Object.entries(specJson.paths).forEach(([path, operations]) => {
          Object.entries(operations!).forEach(([key, operation]) => {
            if (key === 'parameters') return;
            // should filter
            if (
              operation &&
              filterExtensions.some((extension) =>
                Boolean(operation[extension])
              )
            ) {
              // @ts-ignore
              delete specJson.paths![path]![key]!;
              const otherKeys = Object.keys(specJson.paths![path] || {});
              if (
                otherKeys.length === 0 ||
                (otherKeys.length === 1 && otherKeys[0] === 'parameters')
              ) {
                delete specJson.paths![path];
              }
            }
          });
        });
      }

      if (o) {
        // write to file
        const outputPath = path.resolve(o);
        await fs.writeFile(
          outputPath,
          isYaml(o) ? writeYaml(specJson) : JSON.stringify(specJson, null, 2)
        );
        console.log('wrote dereferenced spec to ' + path.resolve(o));
      } else {
        // assume pipe >
        if (isYaml(filePath)) {
          console.log(writeYaml(specJson));
        } else {
          console.log(JSON.stringify(specJson, null, 2));
        }
      }
    } else {
      console.error('No specification found');
      process.exitCode = 1;
      return;
    }
  };
