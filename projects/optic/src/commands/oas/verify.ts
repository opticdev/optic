import { Command } from 'commander';
import Path from 'path';
import path from 'path';
import * as fs from 'fs-extra';

import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { flushEvents, trackEvent } from './lib/segment';
import { trackWarning } from './lib/sentry';
import * as AT from './lib/async-tools';
import { OpenAPIV3, readDeferencedSpec } from './specs';
import { CapturedInteractions, HarEntries } from './captures';
import { captureStorage } from './captures/capture-storage';
import chalk from 'chalk';
import {
  addIfUndocumented,
  matchInteractions,
  observationToUndocumented,
  StatusObservations,
} from './diffing/document';
import {
  patchOperationsAsNeeded,
  renderDiffs,
  updateByInteractions,
} from './diffing/patch';
import { specToOperations } from './operations/queries';
import { OpticCliConfig, VCS } from '../../config';
import { OPTIC_URL_KEY } from '../../constants';
import { getApiFromOpticUrl } from '../../utils/cloud-urls';
import { uploadSpec, uploadSpecVerification } from '../../utils/cloud-specs';
import { getFileFromFsOrGit } from '../../utils/spec-loaders';
import * as Git from '../../utils/git-utils';
import { sanitizeGitTag } from '@useoptic/openapi-utilities';
import { nextCommand } from './reporters/next-command';

type VerifyOptions = {
  exit0?: boolean;
  har?: string;
  upload?: boolean;
  message?: string;
};

export function verifyCommand(config: OpticCliConfig): Command {
  const command = new Command('verify');
  const feedback = createCommandFeedback(command);

  command
    .description('match observed traffic up to an OpenAPI spec')
    .argument(
      '<openapi-file>',
      'an OpenAPI spec to match up to observed traffic'
    )
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option('--exit0', 'always exit 0')
    .option(
      '--upload',
      'Upload the verification data to optic cloud. Requires the spec to be in optic',
      false
    )
    .option(
      '--message',
      'Used in conjunction with `--upload`, sets a message on an uploaded verification.'
    )
    .action(async (specPath) => {
      const options = command.opts();

      return await runVerify(
        specPath,
        options as VerifyOptions,
        config,
        feedback
      );
    });

  return command;
}

export async function runVerify(
  specPath: string,
  options: VerifyOptions,
  config: OpticCliConfig,
  feedback: ReturnType<typeof createCommandFeedback>,
  internalOptions: { printCoverage: boolean } = { printCoverage: true }
) {
  const analytics: { event: string; properties: any }[] = [];

  if (options.upload) {
    if (config.vcs?.type !== VCS.Git || config.vcs.status === 'dirty') {
      console.error(
        'optic oas verify --upload can only be run in a git repository without uncommitted changes. That ensures reports are properly tagged.'
      );
      process.exitCode = 1;
      return;
    }
  }

  console.log('');

  const { existingCaptures, openApiExists } = await captureStorage(specPath);
  if (!openApiExists) {
    return await feedback.inputError(
      'OpenAPI specification file could not be found',
      InputErrors.SPEC_FILE_NOT_FOUND
    );
  }
  const absoluteSpecPath = Path.resolve(specPath);

  const makeInteractionsIterator = async () =>
    getInteractions(options, specPath, feedback);

  /// Run to verify with the latest specification
  const parseResult = await getFileFromFsOrGit(absoluteSpecPath, config, {
    strict: false,
    denormalize: true,
  });

  const { jsonLike: spec, sourcemap } = parseResult;

  const opticUrlDetails = getApiFromOpticUrl(spec[OPTIC_URL_KEY]);

  const interactions = await makeInteractionsIterator();

  feedback.notable(
    `Verifying API behavior with traffic ${
      options.har
        ? 'from har'
        : `from last ${chalk.blue.underline(
            existingCaptures.toString()
          )} capture${existingCaptures === 1 ? '' : 's'}. ${nextCommand(
            'Reset captures',
            `optic oas capture clear ${path.relative(process.cwd(), specPath)}`
          )}\``
    } \n`
  );

  let { results: updatePatches } = updateByInteractions(spec, interactions);

  let { observations, coverage } = matchInteractions(
    spec,
    await makeInteractionsIterator()
  );

  const renderingStatus = await renderOperationStatus(
    observations,
    spec,
    specPath,
    feedback
  );

  const diffResults = await renderDiffs(
    sourcemap,
    spec,
    updatePatches,
    coverage
  );

  const coverageStats = coverage.calculateCoverage();

  if (internalOptions.printCoverage) {
    console.log('\n ' + chalk.bold.underline(`API Behavior Report`));
    console.log(`
 Total Requests          : ${coverageStats.totalRequests}
 Diffs                   : ${diffResults.shapeDiff}
 Undocumented operations : ${renderingStatus.undocumentedPaths}
 Undocumented bodies     : ${diffResults.undocumentedBody}\n`);

    coverage.renderCoverage();
  }

  const hasDiff =
    diffResults.totalDiffCount + renderingStatus.undocumentedPaths > 0;

  analytics.push({
    event: 'openapi.verify',
    properties: {
      totalInteractions: coverageStats.totalRequests,
      coverage: coverageStats.percent,
      diffs: diffResults.totalDiffCount,
      shapeDiffs: diffResults.shapeDiff,
      undocumentedOperations: renderingStatus.undocumentedPaths,
      undocumentedBodies: renderingStatus.undocumentedPaths,
    },
  });

  if (options.upload) {
    if (!opticUrlDetails) {
      console.error(
        `File ${specPath} does not have an optic url. Files must be added to Optic and have an x-optic-url key before verification data can be uploaded.`
      );
      console.error(`${chalk.yellow('Hint: ')} Run optic api add ${specPath}`);
      process.exitCode = 1;
      return;
    }

    const { orgId, apiId } = opticUrlDetails;
    const tags: string[] = [];
    if (config.vcs?.type === VCS.Git) {
      tags.push(`git:${config.vcs.sha}`);
      const currentBranch = await Git.getCurrentBranchName();
      tags.push(sanitizeGitTag(`gitbranch:${currentBranch}`));
    }
    const specId = await uploadSpec(apiId, {
      spec: parseResult,
      client: config.client,
      tags,
      orgId,
    });

    await uploadSpecVerification(specId, {
      client: config.client,
      verificationData: coverage.coverage,
      message: options.message,
    });
  }

  analytics.forEach((event) => trackEvent(event.event, event.properties));

  await flushEvents();

  if (!options.exit0 && hasDiff) {
    console.log(
      chalk.red('OpenAPI and implementation are out of sync. Exiting 1')
    );
    process.exit(1);
  }
  if (!hasDiff) {
    console.log(
      chalk.green.bold(
        'No diffs detected. OpenAPI and implementation appear to be in sync.'
      )
    );
  }
}
async function renderOperationStatus(
  observations: StatusObservations,
  spec: OpenAPIV3.Document,
  specPath: string,
  feedback: ReturnType<typeof createCommandFeedback>
) {
  const { pathsToAdd } = await observationToUndocumented(
    observations,
    specToOperations(spec)
  );

  let undocumentedPaths: number = 0;

  if (pathsToAdd.length) {
    for (let unmatchedPath of pathsToAdd) {
      undocumentedPaths++;
      unmatchedPath.methods.forEach((method) =>
        renderUndocumentedPath(
          method.toUpperCase(),
          unmatchedPath.pathPattern,
          unmatchedPath.examplePath
        )
      );
    }
    console.log('');
    console.log(
      nextCommand(
        'Document all new operations with',
        `optic update ${path.relative(process.cwd(), specPath)} --all`
      )
    );

    console.log(
      nextCommand(
        'Document individual operations with',
        `optic update ${path.relative(
          process.cwd(),
          specPath
        )} "[method] /[path]" ...`
      )
    );
  }

  return { undocumentedPaths };
}

export async function getInteractions(
  options: { har?: string },
  specPath: string,
  feedback: any
) {
  const sources: CapturedInteractions[] = [];

  const { trafficDirectory } = await captureStorage(specPath);

  const captureDirectoryContents = (await fs.readdir(trafficDirectory)).sort();

  // if HAR provided, only pullf rom there
  if (options.har) {
    // override with a har
    let absoluteHarPath = Path.resolve(options.har);
    if (!(await fs.pathExists(absoluteHarPath))) {
      return await feedback.inputError(
        'HAR file could not be found at given path',
        InputErrors.HAR_FILE_NOT_FOUND
      );
    }
    let harFile = fs.createReadStream(absoluteHarPath);
    let harEntryResults = HarEntries.fromReadable(harFile);
    let harEntries = AT.unwrapOr(harEntryResults, (err) => {
      let message = `HAR entry skipped: ${err.message}`;
      console.warn(message); // warn, skip and keep going
      trackWarning(message, err);
    });
    sources.push(CapturedInteractions.fromHarEntries(harEntries));
  } else {
    // default is capture directory
    captureDirectoryContents.forEach((potentialCapture) => {
      // completed captures only
      if (potentialCapture.endsWith('.har')) {
        let harFile = fs.createReadStream(
          path.join(trafficDirectory, potentialCapture)
        );
        let harEntryResults = HarEntries.fromReadable(harFile);
        let harEntries = AT.unwrapOr(harEntryResults, (err) => {
          let message = `HAR entry skipped: ${err.message}`;
          console.warn(message); // warn, skip and keep going
          trackWarning(message, err);
        });

        sources.push(CapturedInteractions.fromHarEntries(harEntries));
      }
    });
  }

  if (sources.length < 1) {
    return await feedback.inputError(
      'no traffic captured for this OpenAPI spec. Run "oas capture" command',
      InputErrors.CAPTURE_METHOD_MISSING
    );
  }

  return AT.merge(...sources);
}

function renderUndocumentedPath(
  method: string,
  pathPattern: string,
  examplePath: string
) {
  console.log(
    `${chalk.bgYellow('  Undocumented  ')} ${method
      .toUpperCase()
      .padStart(6, ' ')}   ${pathPattern}\n${''.padStart(
      26, // undocumented + method length
      ' '
    )}${chalk.gray(examplePath)}`
  );
}
