import { Command, Option } from 'commander';

import {
  defaultEmptySpec,
  generateSpecResults,
  RuleRunner,
  SpectralInput,
  BulkCompareJson,
  NormalizedCiContext,
  logComparison,
  UserError,
} from '@useoptic/openapi-utilities';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import {
  wrapActionHandlerWithSentry,
  SentryClient,
} from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  parseSpecVersion,
  specFromInputToResults,
  validateUploadRequirements,
} from '../utils';
import { newExemptionsCount } from '../utils/count-exemptions';

import { CliConfig } from '../../types';
import { createOpticClient } from '../../clients/optic-client';
import { bulkUploadCiRun } from './bulk-upload';
import { sendBulkGithubMessage } from './bulk-github-comment';
import { sendBulkGitlabMessage } from './bulk-gitlab-comment';
import { loadCiContext } from '../utils/load-context';
import {
  getComparisonsFromGlob,
  parseJsonComparisonInput,
} from './input-generators';
import { Comparison, ComparisonData } from './types';
import { validateOpenApiV3Document } from '@useoptic/openapi-io';
import OpenAPISchemaValidator from '@useoptic/openapi-io/build/validation/validator';

const packageJson = require('../../../../package.json');

export const registerBulkCompare = (
  cli: Command,
  projectName: string,
  ruleRunner: RuleRunner,
  cliConfig: CliConfig,
  generateContext: (details: { fileName: string }) => Object = () => ({}),
  hideCommand: boolean,
  spectralConfig?: SpectralInput
) => {
  cli
    .command(
      'bulk-compare',
      hideCommand
        ? {
            hidden: true,
          }
        : {}
    )
    .option(
      '--input <input>',
      'a csv with the from, to files, and context format: <from>,<to>,<jsonified context>'
    )
    .option(
      '--glob <glob>',
      'a glob to filter specifications to match (e.g. "**/*.yml" or "**/specifications/*.json"). Also takes \
comma separated values (e.g. "**/*.yml,**/*.json")'
    )
    .option(
      '--ignore <ignore>',
      'an ignore glob to ignore certain matches (e.g. "**/*.yml" or "**/specifications/*.json"). Also takes \
comma separated values (e.g. "**/*.yml,**/*.json")'
    )
    .option('--base <base>', 'base ref to compare against')
    .option('--verbose', 'show all checks, even passing', false)
    .addOption(
      new Option(
        '--output <output>',
        "show 'pretty' output for interactive usage or 'json' for JSON, defaults to 'pretty'"
      ).choices(['pretty', 'json', 'plain'])
    )
    .option(
      '--upload-results',
      'upload results of this run to optic cloud',
      false
    )
    .option(
      '--ci-context <ciContext>',
      'path to file with the context shape from the ci provider (e.g. github actions, circle ci)'
    )
    .action(
      wrapActionHandlerWithSentry(
        async ({
          input,
          glob,
          base,
          verbose,
          output = 'pretty',
          uploadResults,
          ciContext,
          ignore,
        }: {
          input?: string;
          glob?: string;
          base?: string;
          verbose: boolean;
          ignore?: string;
          output?: 'pretty' | 'json' | 'plain';
          uploadResults: boolean;
          ciContext?: string;
        }) => {
          validateUploadRequirements(uploadResults, cliConfig);
          if (!input && glob && base) {
            await runBulkCompare({
              checkService: ruleRunner,
              verbose,
              output,
              uploadResults,
              ciContext,
              projectName,
              cliConfig,
              generateContext,
              spectralConfig,
              glob,
              base,
              ignore,
            });
          } else if (input) {
            await runBulkCompare({
              checkService: ruleRunner,
              input,
              verbose,
              output,
              uploadResults,
              ciContext,
              projectName,
              cliConfig,
              generateContext,
              spectralConfig,
            });
          } else {
            throw new UserError({
              message:
                'Expected --input or both --glob and --base to be provided as input',
            });
          }
          process.exit(0);
        }
      )
    );
};

const loadSpecFile = async (
  fileName?: string
): Promise<ReturnType<typeof specFromInputToResults>> => {
  return specFromInputToResults(
    parseSpecVersion(fileName, defaultEmptySpec),
    process.cwd()
  );
};

// TODO extract out the parallel request promise logic into a generic fn and write tests around this
// TODO type of `Comparison` can be narrowed
const compareSpecs = async ({
  checkService,
  comparisons,
  onComparisonComplete,
  onComparisonError,
  spectralConfig,
}: {
  checkService: RuleRunner;
  comparisons: Map<string, Comparison>;
  onComparisonComplete: (id: string, data: ComparisonData) => void;
  onComparisonError: (id: string, error: any) => void;
  spectralConfig?: SpectralInput;
}) => {
  const PARALLEL_REQUESTS = 4;
  const inflightRequests = new Map<string, Promise<string>>();
  for (const [id, comparison] of comparisons.entries()) {
    if (inflightRequests.size >= PARALLEL_REQUESTS) {
      // await, then remove
      const resolvePromiseId = await Promise.race([
        ...inflightRequests.values(),
      ]);
      inflightRequests.delete(resolvePromiseId);
    }
    // Enqueue next
    inflightRequests.set(
      id,
      new Promise<{
        id: string;
        data: ComparisonData;
      }>(async (resolve, reject) => {
        try {
          const [from, to] = await Promise.all([
            loadSpecFile(comparison.fromFileName),
            loadSpecFile(comparison.toFileName),
          ]);

          validateOpenApiV3Document(from.jsonLike, from.sourcemap, {
            strictOpenAPI: false,
          });
          validateOpenApiV3Document(to.jsonLike, to.sourcemap);

          const { results, changes } = await generateSpecResults(
            checkService,
            from,
            to,
            comparison.context,
            spectralConfig
          );
          resolve({
            id,
            data: {
              results,
              changes,
              version: packageJson.version,
            },
          });
        } catch (e) {
          reject({
            id,
            error: e,
          });
        }
      })
        .then(({ id, data }) => {
          onComparisonComplete(id, data);
          return id;
        })
        .catch((e) => {
          const { id, error } = e as { id: string; error: any };
          onComparisonError(id, error);
          return id;
        })
    );
  }

  // Then wait for all the remaining requests to complete
  await Promise.all([...inflightRequests.values()]);
};

const runBulkCompare = async ({
  checkService,
  input,
  verbose,
  projectName,
  output,
  uploadResults,
  ciContext,
  cliConfig,
  generateContext,
  spectralConfig,
  glob,
  base,
  ignore,
}: {
  checkService: RuleRunner;
  verbose: boolean;
  projectName: string;
  output: 'pretty' | 'json' | 'plain';
  uploadResults: boolean;
  ciContext?: string;
  cliConfig: CliConfig;
  generateContext: (details: { fileName: string }) => Object;
  spectralConfig?: SpectralInput;
} & (
  | { input: string; glob?: undefined; base?: undefined; ignore?: undefined }
  | { input?: undefined; glob: string; base: string; ignore?: string }
)) => {
  let numberOfErrors = 0;
  let numberOfComparisonsWithErrors = 0;
  let numberOfComparisonsWithAChange = 0;
  let hasChecksFailing = false;
  let hasError = false;
  let numberOfExemptionsAdded = 0;

  let normalizedCiContext: NormalizedCiContext | null = null;
  if (uploadResults && cliConfig.ciProvider) {
    normalizedCiContext = await loadCiContext(cliConfig.ciProvider, ciContext);
  }

  const { comparisons: initialComparisons, skippedParsing } = input
    ? await parseJsonComparisonInput(input, generateContext)
    : await getComparisonsFromGlob(glob!, ignore || '', base!, generateContext);

  if (initialComparisons.size === 0) {
    throw new UserError({ message: 'No comparisons were specified - exiting' });
  }

  console.log(`Bulk comparing ${initialComparisons.size} comparisons`);
  const finalComparisons = new Map(initialComparisons);

  await compareSpecs({
    checkService,
    spectralConfig,
    comparisons: initialComparisons,
    onComparisonComplete: (id, comparison) => {
      const { results, changes } = comparison;
      if (results.some((result) => !result.passed && !result.exempted)) {
        hasChecksFailing = true;
        numberOfComparisonsWithErrors += 1;
        numberOfErrors += results.reduce(
          (count, result) =>
            result.passed || result.exempted ? count : count + 1,
          0
        );
      }
      if (changes.length > 0) {
        numberOfComparisonsWithAChange += 1;
      }
      finalComparisons.set(id, {
        ...initialComparisons.get(id)!,
        loading: false,
        error: false,
        data: comparison,
      });
      for (const change of changes) {
        numberOfExemptionsAdded += newExemptionsCount(change);
      }
    },
    onComparisonError: (id, error) => {
      hasError = true;
      finalComparisons.set(id, {
        ...initialComparisons.get(id)!,
        loading: false,
        error: true,
        errorDetails: error,
      });
    },
  });

  trackEvent(
    'optic_ci.bulk_compare',
    {
      isInCi: process.env.CI === 'true',
      numberOfErrors,
      projectName,
      numberOfComparisons: initialComparisons.size,
      numberOfComparisonsWithErrors,
      numberOfComparisonsWithAChange,
      numberOfExemptionsAdded,
      ...(normalizedCiContext
        ? {
            ...normalizedCiContext,
            org_repo_pr: `${normalizedCiContext.organization}/${normalizedCiContext.repo}/${normalizedCiContext.pull_request}`,
          }
        : {}),
    },
    (normalizedCiContext && normalizedCiContext.user) ||
      `${projectName}-optic-ci`
  );

  if (output === 'json') {
    console.log(JSON.stringify([...finalComparisons.values()], null, 2));
  } else {
    for (const comparison of [...finalComparisons.values()]) {
      const fromName = comparison.fromFileName || 'Empty Spec';
      const toName = comparison.toFileName || 'Empty Spec';
      console.log(`Comparing ${fromName} to ${toName}\n`);

      if (comparison.loading) {
        console.log('loading');
      } else if (comparison.error) {
        console.log(`Error running rules`);
        console.error(comparison.errorDetails);
      } else {
        logComparison(
          {
            results: comparison.data.results,
            changes: comparison.data.changes,
          },
          {
            output,
            verbose,
          }
        );
      }
    }
  }

  const maybeError = skippedParsing
    ? new UserError({
        message: 'Error: Could not read all of the comparison inputs',
      })
    : hasError
    ? new UserError({ message: 'Error: Could not run all of the comparisons' })
    : undefined;

  if (maybeError) {
    throw maybeError;
  }

  const bulkCompareOutput: BulkCompareJson = {
    comparisons: [...finalComparisons].map(([, comparison]) => {
      if (comparison.loading || comparison.error) {
        throw new Error('Expected comparison to be loaded without errors');
      }
      return {
        results: comparison.data.results,
        changes: comparison.data.changes,
        version: comparison.data.version,
        inputs: {
          from: comparison.fromFileName,
          to: comparison.toFileName,
        },
      };
    }),
  };
  if (uploadResults && normalizedCiContext) {
    const numberOfUploads = bulkCompareOutput.comparisons.filter(
      (comparison) => comparison.changes.length > 0
    ).length;
    const numberOfComparisons = bulkCompareOutput.comparisons.length;
    console.log(
      `Uploading ${numberOfUploads} comparisons with at least 1 change to Optic... (${
        numberOfComparisons - numberOfUploads
      } did not have any changes)`
    );

    // We've validated the shape in validateUploadRequirements
    const opticToken = cliConfig.opticToken!;
    const { token } = cliConfig.gitProvider!;
    const opticClient = createOpticClient(opticToken);

    try {
      const { git_provider, git_api_url } =
        await opticClient.getMyOrganization();
      const bulkUploadOutput = await bulkUploadCiRun(
        opticClient,
        bulkCompareOutput,
        normalizedCiContext
      );
      if (bulkUploadOutput) {
        console.log(
          `Successfully uploaded ${bulkUploadOutput.comparisons.length} comparisons that had at least 1 change`
        );
        console.log('These files can be found at');
        for (const comparison of bulkUploadOutput.comparisons) {
          console.log(
            `from: ${comparison.inputs.from || 'Empty Spec'} to: ${
              comparison.inputs.to || 'Empty Spec'
            } - ${comparison.opticWebUrl}`
          );
        }

        if (git_provider === 'github') {
          console.log('Posting comment to github...');

          try {
            await sendBulkGithubMessage({
              githubToken: token,
              uploadOutput: bulkUploadOutput,
              baseUrl: git_api_url,
            });
          } catch (e) {
            console.log(
              'Failed to post comment to github - exiting with comparison rules run exit code.'
            );
            console.error(e);
            if (!UserError.isInstance(e)) {
              SentryClient.captureException(e);
            }
          }
        } else if (git_provider === 'gitlab') {
          console.log('Posting comment to gitlab...');

          try {
            await sendBulkGitlabMessage({
              gitlabToken: token,
              uploadOutput: bulkUploadOutput,
              baseUrl: git_api_url,
            });
          } catch (e) {
            console.log(
              'Failed to post comment to gitlab - exiting with comparison rules run exit code.'
            );
            console.error(e);
            if (!UserError.isInstance(e)) {
              SentryClient.captureException(e);
            }
          }
        }
      } else {
        console.log('No changes were detected, not uploading anything');
      }
    } catch (e) {
      console.log(
        'Error uploading the run to Optic - exiting with comparison rules run exit code.'
      );
      console.error(e);

      if (!UserError.isInstance(e)) {
        SentryClient.captureException(e);
      }
    }
  }
  await flushEvents();

  if (hasChecksFailing) {
    throw new UserError();
  }
};
