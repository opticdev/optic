import { Command } from 'commander';
import { createOpticClient } from '../utils/optic-client';

import {
  defaultEmptySpec,
  validateOpenApiV3Document,
} from '@useoptic/openapi-utilities';
import { ApiCheckService } from '../../../sdk/api-check-service';
import {
  parseSpecVersion,
  specFromInputToResults,
  validateUploadRequirements,
  generateSpecResults,
} from '../utils';
import { UserError } from '../../errors';
import { wrapActionHandlerWithSentry, SentryClient } from '../../sentry';
import { OpticCINamedRulesets } from '../../../sdk/ruleset';
import { trackEvent, flushEvents } from '../../segment';
import { CliConfig, NormalizedCiContext } from '../../types';
import { uploadCiRun } from './upload';
import { sendGithubMessage } from './github-comment';
import { logComparison } from '../utils/comparison-renderer';
import path from 'path';
import { loadCiContext } from '../utils/load-context';

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
  rulesetServices: OpticCINamedRulesets,
  cliConfig: CliConfig
) => {
  cli
    .command('compare')
    .option('--from <from>', 'from file or rev:file, defaults empty spec')
    .option('--to <to>', 'to file or rev:file, defaults empty spec')
    .option('--context <context>', 'json of context')
    .option('--verbose', 'show all checks, even passing', false)
    .option('--ruleset <ruleset>', 'name of ruleset to run', 'default')
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
          ruleset: string;
          githubAnnotations: boolean;
          uploadResults: boolean;
          ciContext?: string;
        }) => {
          const checkService = rulesetServices[options.ruleset];
          if (!checkService) {
            throw new UserError(
              `Ruleset named ${
                options.ruleset
              } is not registered. valid options: ${JSON.stringify(
                Object.keys(rulesetServices)
              )}`
            );
          }

          const parsedContext = parseContextObject(options.context);
          validateUploadRequirements(options.uploadResults, cliConfig);

          await runCompare({
            from: options.from,
            to: options.to,
            apiCheckService: checkService,
            context: parsedContext,
            uploadResults: options.uploadResults,
            projectName: projectName,
            ciContext: options.ciContext,
            cliConfig: cliConfig,
            verbose: options.verbose,
            output: options.output,
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
}: {
  from?: string;
  to?: string;
  apiCheckService: ApiCheckService<any>;
  context: any;
  uploadResults: boolean;
  ciContext?: string;
  cliConfig: CliConfig;
  projectName: string;
  output: 'pretty' | 'plain' | 'json';
  verbose: boolean;
}) => {
  console.log('Loading spec files');
  const [parsedFrom, parsedTo] = await Promise.all([
    specFromInputToResults(
      parseSpecVersion(from, defaultEmptySpec),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike);
      return results;
    }),
    specFromInputToResults(
      parseSpecVersion(to, defaultEmptySpec),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike);
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

  const compareOutput = await generateSpecResults(
    apiCheckService,
    parsedFrom,
    parsedTo,
    context
  );
  const { results, changes } = compareOutput;
  if (output === 'json') {
    const filteredResults = verbose
      ? results
      : results.filter((x) => !x.passed);
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

  if (uploadResults && changes.length === 0) {
    console.log('No changes were detected, not uploading anything');
  } else if (uploadResults && normalizedCiContext) {
    console.log('Uploading files to Optic...');

    // We've validated the shape in validateUploadRequirements
    const opticToken = cliConfig.opticToken!;
    const { token, provider } = cliConfig.gitProvider!;
    const opticClient = createOpticClient(opticToken);

    try {
      const uploadOutput = await uploadCiRun(
        compareOutput,
        parsedFrom.jsonLike,
        parsedTo.jsonLike,
        opticClient,
        {
          from: from ? path.join(process.cwd(), from) : from,
          to: to ? path.join(process.cwd(), to) : to,
        },
        normalizedCiContext
      );

      if (uploadOutput) {
        console.log('Successfully uploaded files to Optic');
        console.log(
          `Results of this run can be found at: ${uploadOutput.opticWebUrl}`
        );

        // In the future we can add different git providers
        if (provider === 'github') {
          console.log('Posting comment to github...');
          try {
            await sendGithubMessage({
              githubToken: token,
              compareOutput,
              uploadOutput,
            });
          } catch (e) {
            console.log(
              'Failed to post comment to github - exiting with comparison rules run exit code.'
            );
            console.error(e);
            if ((e as Error).name !== 'UserError') {
              SentryClient?.captureException(e);
            }
          }
        }
      }
    } catch (e) {
      console.log(
        'Error uploading the run to Optic - exiting with comparison rules run exit code.'
      );
      console.error(e);

      if ((e as Error).name !== 'UserError') {
        SentryClient?.captureException(e);
      }
    }
  }

  const hasError = results.some((result) => !result.passed);

  trackEvent(
    'optic_ci.compare',
    (normalizedCiContext && normalizedCiContext.user) ||
      `${projectName}-optic-ci`,
    {
      isInCi: process.env.CI === 'true',
      projectName,
      numberOfErrors: results.reduce(
        (count, result) => (result.passed ? count : count + 1),
        0
      ),
      numberOfChanges: changes.length,
      ...(normalizedCiContext || {}),
      org_repo_pr: 
        `${normalizedCiContext?.organization}/${normalizedCiContext?.repo}/${normalizedCiContext?.pull_request}`,

    }
  );

  await flushEvents();
  if (hasError) {
    throw new UserError();
  }
};
