import { Octokit } from '@octokit/rest';
import { Command } from 'commander';
import { createOpticClient } from '../../clients/optic-client';
import { generateHashForComparison } from '@useoptic/openapi-utilities/build/utilities/comparison-hash';
import {
  trackEvent,
  flushEvents,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { sendGithubMessage } from '@useoptic/openapi-utilities/build/utilities/send-github-message';

import {
  NormalizedCiContext,
  RuleRunner,
  SpectralInput,
  defaultEmptySpec,
  generateSpecResults,
  logComparison,
  UserError,
} from '@useoptic/openapi-utilities';
import {
  parseSpecVersion,
  specFromInputToResults,
  validateUploadRequirements,
} from '../utils';
import {
  wrapActionHandlerWithSentry,
  SentryClient,
} from '@useoptic/openapi-utilities/build/utilities/sentry';
import { CliConfig } from '../../types';
import { uploadCiRun } from './upload';
import { loadCiContext } from '../utils/load-context';
import { sendGitlabMessage } from './gitlab-comment';
import { getRelativeRepoPath } from '../utils/path';
import { validateOpenApiV3Document } from '@useoptic/openapi-io';
import { inGit } from '../utils/git';
import { newExemptionsCount } from '../utils/count-exemptions';
import OpenAPISchemaValidator from '@useoptic/openapi-io/build/validation/validator';
import fetch from 'node-fetch';

const parseContextObject = (context?: string): any => {
  try {
    const parsedContext = context ? JSON.parse(context) : {};
    return parsedContext;
  } catch (e) {
    throw new UserError(
      `Could not parse the context object provided at --context ${context}. Got an error: ${
        (e as Error).message
      }`
    );
  }
};

export const registerCompare = (
  cli: Command,
  projectName: string,
  ruleRunner: RuleRunner,
  cliConfig: CliConfig,
  generateContext: (details: { fileName: string }) => Object,
  hideCommand: boolean,
  spectralConfig?: SpectralInput
) => {
  cli
    .command(
      'compare',
      hideCommand
        ? {
            hidden: true,
          }
        : {}
    )
    .option('--from <from>', 'from file or rev:file, defaults empty spec')
    .option('--to <to>', 'to file or rev:file, defaults empty spec')
    .option('--context <context>', 'json of context')
    .option('--verbose', 'show all checks, even passing', false)
    .option(
      '--output <format>',
      "show 'pretty' output for interactive usage or 'json' for JSON",
      'pretty'
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
        async (options: {
          from?: string;
          to?: string;
          context?: string;
          verbose: boolean;
          output: 'pretty' | 'json' | 'plain';
          githubAnnotations: boolean;
          uploadResults: boolean;
          ciContext?: string;
        }) => {
          const parsedContext = options.context
            ? parseContextObject(options.context)
            : generateContext({
                fileName: options.to || options.from || '',
              });
          validateUploadRequirements(options.uploadResults, cliConfig);

          await runCompare({
            from: options.from,
            to: options.to,
            apiCheckService: ruleRunner,
            context: parsedContext,
            uploadResults: options.uploadResults,
            projectName: projectName,
            ciContext: options.ciContext,
            cliConfig: cliConfig,
            verbose: options.verbose,
            output: options.output,
            spectralConfig,
          });
        }
      )
    );
};

const runCompare = async ({
  from,
  to,
  apiCheckService,
  context,
  uploadResults,
  ciContext,
  cliConfig,
  projectName,
  output,
  verbose,
  spectralConfig,
}: {
  from?: string;
  to?: string;
  apiCheckService: RuleRunner;
  context: any;
  uploadResults: boolean;
  ciContext?: string;
  cliConfig: CliConfig;
  projectName: string;
  output: 'pretty' | 'plain' | 'json';
  verbose: boolean;
  spectralConfig?: SpectralInput;
}) => {
  console.log('Loading spec files');
  const [parsedFrom, parsedTo] = await Promise.all([
    specFromInputToResults(
      parseSpecVersion(from, defaultEmptySpec),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike, results.sourcemap, {
        strictOpenAPI: false,
      });
      return results;
    }),
    specFromInputToResults(
      parseSpecVersion(to, defaultEmptySpec),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike, results.sourcemap);
      return results;
    }),
  ]).catch((e) => {
    console.log('Stopping. Could not load two specifications to compare');
    // TODO add in better error messaging here
    console.error(e);
    throw new UserError();
  });
  console.log('Specs loaded - running comparison');

  const fromName = from || 'Empty Spec';
  const toName = to || 'Empty Spec';
  console.log(`Comparing ${fromName} to ${toName}\n`);

  let compareOutput: Awaited<ReturnType<typeof generateSpecResults>>;
  try {
    compareOutput = await generateSpecResults(
      apiCheckService,
      parsedFrom,
      parsedTo,
      context,
      spectralConfig
    );
  } catch (e) {
    console.log('Error running rules');
    console.error(e);
    throw new UserError();
  }
  const { results, changes } = compareOutput;
  if (output === 'json') {
    const filteredResults = verbose
      ? results
      : results.filter((x) => !x.passed && !x.exempted);
    console.log(JSON.stringify(filteredResults, null, 2));
  } else {
    logComparison(
      {
        results,
        changes,
      },
      {
        output,
        verbose,
      }
    );
  }

  let normalizedCiContext: NormalizedCiContext | null = null;
  if (uploadResults && cliConfig.ciProvider) {
    normalizedCiContext = await loadCiContext(cliConfig.ciProvider, ciContext);
  }

  if (uploadResults && changes.length === 0 && results.length === 0) {
    console.log('No changes were detected, not uploading anything');
  } else if (uploadResults && normalizedCiContext) {
    console.log('Uploading files to Optic...');

    // We've validated the shape in validateUploadRequirements
    const opticToken = cliConfig.opticToken!;
    const { token } = cliConfig.gitProvider!;
    const opticClient = createOpticClient(opticToken);

    try {
      const gitRootPath = await inGit(process.cwd());
      const { git_provider, git_api_url } =
        await opticClient.getMyOrganization();
      const uploadOutput = await uploadCiRun(
        compareOutput,
        parsedFrom.jsonLike,
        parsedTo.jsonLike,
        opticClient,
        {
          from: from ? getRelativeRepoPath(from, gitRootPath) : from,
          to: to ? getRelativeRepoPath(to, gitRootPath) : to,
        },
        normalizedCiContext
      );

      if (uploadOutput) {
        console.log('Successfully uploaded files to Optic');
        console.log(
          `Results of this run can be found at: ${uploadOutput.opticWebUrl}`
        );

        if (git_provider === 'github') {
          console.log('Posting comment to github...');
          const octokit = new Octokit({
            auth: token,
            baseUrl: git_api_url,
            request: { fetch },
          });
          const compareHash = generateHashForComparison({
            results,
            changes,
          });
          try {
            await sendGithubMessage(
              octokit,
              compareHash,
              {
                compareOutput,
                uploadOutput,
              },
              (e) => {
                console.error(e);
                throw new UserError();
              }
            );
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
            await sendGitlabMessage({
              gitlabToken: token,
              compareOutput,
              uploadOutput,
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

  const hasError = results.some((result) => !result.passed && !result.exempted);

  let numberOfExemptionsAdded = 0;
  for (const change of changes) {
    numberOfExemptionsAdded += newExemptionsCount(change);
  }

  trackEvent(
    'optic_ci.compare',
    {
      isInCi: process.env.CI === 'true',
      projectName,
      numberOfErrors: results.reduce(
        (count, result) =>
          result.passed || result.exempted ? count : count + 1,
        0
      ),
      numberOfExemptionsAdded,
      numberOfChanges: changes.length,
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

  await flushEvents();
  if (hasError) {
    throw new UserError();
  }
};
