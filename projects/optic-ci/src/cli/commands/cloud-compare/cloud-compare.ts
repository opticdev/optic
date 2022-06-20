import fs from 'node:fs/promises';
import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { Command } from 'commander';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import { defaultEmptySpec, UserError } from '@useoptic/openapi-utilities';
import { createOpticClient } from '../../clients/optic-client';
import { wrapActionHandlerWithSentry } from '../../sentry';
import { parseSpecVersion, SpecFromInput } from '../utils';
import { getGitRootPath } from '../utils/path';
import { initRun } from './init-run';
import { loadCiContext } from '../utils/load-context';

const exec = promisify(callbackExec);

export const registerCloudCompare = (cli: Command, hideCommand: boolean) => {
  cli
    .command('run', hideCommand ? { hidden: true } : {})
    .option(
      '--base <base>',
      'base ref to compare against, defaults to the master branch',
      'master'
    )
    .action(
      wrapActionHandlerWithSentry(async ({ base }: { base: string }) => {
        const token = process.env.OPTIC_TOKEN;
        if (!token) {
          throw new UserError('OPTIC_TOKEN environment variable is not set');
        }

        await cloudCompare(token, base);
      })
    );
};

type YmlConfig = {
  files: {
    path: string;
    id: string;
  }[];
};

const OPTIC_YML_NAME = 'optic.yml';

const validateYmlFile = (file: unknown) => {
  if (!file) {
    throw new UserError('optic.yml file is empty');
  }

  const ajv = new Ajv();
  const schema = {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
            },
            id: {
              type: 'string',
            },
          },
          required: ['path', 'id'],
        },
      },
    },
    required: ['files'],
  };
  try {
    ajv.validate(schema, file);
  } catch (e) {
    throw new UserError((e as Error).message);
  }
};

type ParsedInputs = {
  from: SpecFromInput;
  to: SpecFromInput;
  id: string;
  path: string;
};

const parseFileInputs = async (
  base: string,
  rootGitPath: string,
  file: YmlConfig['files'][number]
): Promise<ParsedInputs> => {
  const absolutePath = path.join(rootGitPath, file.path);
  const pathFromGitRoot = file.path.replace(/^\.(\/|\\)/, '');
  const fileExistsOnBasePromise = exec(`git show ${base}:${pathFromGitRoot}`)
    .then(() => true)
    .catch(() => false);
  const fileExistsOnHeadPromise = fs
    .access(absolutePath)
    .then(() => true)
    .catch(() => false);

  const [existsOnBase, existsOnHead] = await Promise.all([
    fileExistsOnBasePromise,
    fileExistsOnHeadPromise,
  ]);

  return {
    from: parseSpecVersion(
      existsOnBase ? `${base}:${pathFromGitRoot}` : undefined,
      defaultEmptySpec
    ),
    to: parseSpecVersion(
      existsOnHead ? absolutePath : undefined,
      defaultEmptySpec
    ),
    id: file.id,
    path: pathFromGitRoot,
  };
};

const cloudCompare = async (token: string, base: string) => {
  // TODO in the future the optic config could live in different
  // search for optic.yml at the root of the repo?
  const gitRootPath = await getGitRootPath();
  const expectedYmlPath = path.join(gitRootPath, OPTIC_YML_NAME);
  try {
    await fs.access(expectedYmlPath);
  } catch (e) {
    throw new UserError('Could not find an optic.yml at the root of the repo');
  }
  const yml = yaml.load(await fs.readFile(expectedYmlPath, 'utf-8'));

  validateYmlFile(yml);

  const specInputs: ParsedInputs[] = await Promise.all(
    (yml as YmlConfig).files.map((file) =>
      parseFileInputs(base, gitRootPath, file)
    )
  );

  const opticClient = createOpticClient(token);

  const context = await loadCiContext();

  await initRun(opticClient, specInputs, base, context);
};
