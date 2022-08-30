import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import { Command } from 'commander';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import {
  CompareFileJson,
  logComparison,
  UserError,
} from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  trackEvent,
  flushEvents,
} from '@useoptic/openapi-utilities/build/utilities/segment';

import {
  createOpticClient,
  UploadSlot,
} from '@useoptic/optic-ci/build/cli/clients/optic-client';
import { loadCiContext } from '@useoptic/optic-ci/build/cli/commands/utils/load-context';

import { logger } from '../../logger';
import { initRun } from './init-run';
import { OpticCliConfig } from '../../config';
import { parseFilesFromRef, ParseResult } from '../../utils/spec-loaders';

export const registerCloudCompare = (
  cli: Command,
  cliConfig: OpticCliConfig
) => {
  cli
    .command('run')
    .option(
      '--base <base>',
      'base to compare against, defaults to master',
      'master'
    )
    .option('--verbose', 'show all checks, even passing', false)
    .action(
      wrapActionHandlerWithSentry(
        async ({ base, verbose }: { base: string; verbose: boolean }) => {
          console.warn('optic cloud run is deprecated, please migrate to our new flow by installing our github application. Follow the instructions at https://app.useoptic.com.')
          const token = process.env.OPTIC_TOKEN;
          if (!token) {
            throw new UserError(
              'OPTIC_TOKEN environment variable is not set. You can generate an optic token through our app at https://app.useoptic.com'
            );
          }

          if (!cliConfig.vcs) {
            throw new UserError(
              'optic cloud run must be run inside a git repository'
            );
          }

          await cloudCompare(token, base, verbose, cliConfig);
        }
      )
    );
};

const cloudCompare = async (
  token: string,
  base: string,
  verbose: boolean,
  cliConfig: OpticCliConfig
) => {
  if (!cliConfig.configPath) {
    throw new UserError(
      'Could not find an optic.dev.yml at the root of the repo. Create an optic.dev.yml file with a list of files to run optic against. Run `npx @useoptic/optic@latest init` to generate a file.'
    );
  }

  const specInputs: {
    from: ParseResult;
    to: ParseResult;
    id: string;
    path: string;
  }[] = await Promise.all(
    cliConfig.files.map(async (file) => {
      const { baseFile, headFile, pathFromGitRoot } = await parseFilesFromRef(
        file.path,
        base,
        cliConfig.root
      );

      return {
        from: baseFile,
        to: headFile,
        id: file.id,
        path: pathFromGitRoot,
      };
    })
  );

  const opticClient = createOpticClient(token);

  const context = await loadCiContext();

  logger.info(`Running ${specInputs.length} comparisons...`);

  const sessions = await initRun(
    opticClient,
    specInputs,
    base,
    context,
    cliConfig.ruleset
  );
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
    logger.info(`Comparison for ${specInput.path}`);

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
      logger.info(
        `Comparison for ${specInput.path} can be found at: ${session.web_url}`
      );
    } else {
      if (session.session.status === 'error') {
        const errorMessage = session.session.metadata?.error?.message;
        logger.info(`There was an error running the comparison.`);
        errorMessage && console.error(errorMessage);
      } else if (session.session.status === 'noop') {
        logger.info(
          'No changes were detected, not doing anything for this comparison.'
        );
      }
    }
  }

  trackEvent(
    'optic-ci.cloud_compare',
    `${context.organization}/${context.repo}`,
    {
      numberOfRepos: specInputs.length,
    }
  );
  await flushEvents();

  if (hasError) {
    logger.info('Finished running comparison - exiting with error');
    return process.exit(1);
  } else {
    logger.info('Finished running comparison - exiting');
    return process.exit(0);
  }
};
