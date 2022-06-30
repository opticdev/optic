import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { Command } from 'commander';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import {
  CompareFileJson,
  defaultEmptySpec,
  logComparison,
  UserError,
} from '@useoptic/openapi-utilities';

import { createOpticClient, UploadSlot } from '../../clients/optic-client';
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
      'base to compare against, defaults to master',
      'master'
    )
    .option('--verbose', 'show all checks, even passing', false)
    .action(
      wrapActionHandlerWithSentry(
        async ({ base, verbose }: { base: string; verbose: boolean }) => {
          const token = process.env.OPTIC_TOKEN;
          if (!token) {
            throw new UserError(
              'OPTIC_TOKEN environment variable is not set. You can generate an optic token through our app at https://app.useoptic.com'
            );
          }

          await cloudCompare(token, base, verbose);
        }
      )
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

const cloudCompare = async (token: string, base: string, verbose: boolean) => {
  const gitRootPath = await getGitRootPath();
  const expectedYmlPath = path.join(gitRootPath, OPTIC_YML_NAME);
  try {
    await fs.access(expectedYmlPath);
  } catch (e) {
    throw new UserError(
      'Could not find an optic.yml at the root of the repo. Create an optic.yml file with a list of files to run optic against. Run `npx @useoptic/optic-ci@latest init` to generate a file.'
    );
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

  const sessions = await initRun(opticClient, specInputs, base, context);
  const resultFiles: (CompareFileJson | null)[] = await Promise.all(
    sessions.map(async (session) => {
      if (session.session.status !== 'completed') {
        return null;
      }

      const resultsFile = session.files.find(
        (f) => f.slot === UploadSlot.CheckResults
      );
      if (!resultsFile) {
        throw new Error('Could not load the results file');
      }

      return fetch(resultsFile.url, {
        headers: { accept: 'application/json' },
      }).then((res) => res.json());
    })
  );
  let hasError = false;

  for (let i = 0; i < resultFiles.length; i++) {
    const resultFile = resultFiles[i];
    const session = sessions[i];
    const specInput = specInputs[i];
    console.log(`Comparison for ${specInput.path}`);

    if (resultFile) {
      // the run completed
      if (
        resultFile.results.some((result) => !result.passed && !result.exempted)
      ) {
        hasError = true;
      }
      logComparison(resultFile, {
        output: 'pretty',
        verbose,
      });
      console.log(
        `Comparison for ${specInput.path} can be found at: ${session.web_url}`
      );
    } else {
      if (session.session.status === 'error') {
        const errorMessage = session.session.metadata?.error?.message;
        console.log(`There was an error running the comparison.`);
        errorMessage && console.error(errorMessage);
      } else if (session.session.status === 'noop') {
        console.log(
          'No changes were detected, not doing anything for this comparison.'
        );
      }
    }
  }

  if (hasError) {
    console.log('Finished running comparison - exiting with error');
    return process.exit(1);
  } else {
    console.log('Finished running comparison - exiting');
    return process.exit(0);
  }
};
