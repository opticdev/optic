import { Command } from 'commander';
import { createOpticClient } from '../utils/optic-client';

import {
  defaultEmptySpec,
  ResultWithSourcemap,
  validateOpenApiV3Document,
  IChange,
  OpenApiFact,
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
import { CliConfig } from '../../types';
import { uploadCiRun } from './upload';
import { sendGithubMessage } from './github-comment';
import path from 'path';
import groupBy from 'lodash.groupby';
import isUrl from 'is-url';
import { Instance as Chalk } from 'chalk';
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
          validateUploadRequirements(
            options.uploadResults,
            cliConfig,
            options.ciContext
          );

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

const getIndent = (depth: number): string => ' '.repeat(depth * 2);

// todo move this to shared file
const logComparison = (
  comparison: {
    results: ResultWithSourcemap[];
    changes: IChange<OpenApiFact>[];
    from?: string;
    to?: string;
  },
  options: {
    output: 'pretty' | 'plain';
    verbose: boolean;
  }
) => {
  const chalk = new Chalk({ level: options.output === 'plain' ? 0 : 1 });
  const fromName = comparison.from || 'Empty Spec';
  const toName = comparison.to || 'Empty Spec';
  const totalNumberOfChecks = comparison.results.length;
  const failedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed
  ).length;
  const passedNumberOfChecks = totalNumberOfChecks - failedNumberOfChecks;
  const numberOfChanges = comparison.changes.length;
  const groupedResults = groupBy(
    comparison.results,
    (result) =>
      `${result.change.location.conceptualLocation.method}-${result.change.location.conceptualLocation.path}`
  );

  console.log(`Comparing ${fromName} to ${toName}\n`);

  for (const operationResults of Object.values(groupedResults)) {
    const { method, path } =
      operationResults[0].change.location.conceptualLocation;
    const allPassed = operationResults.every((result) => result.passed);
    const renderedResults = operationResults.filter(
      (result) => options.verbose || !result.passed
    );
    const resultNode = allPassed
      ? chalk.bold.bgGreen.white(' PASS ')
      : chalk.bold.bgRed.white(' FAIL ');

    console.log(
      `${getIndent(1)}${resultNode} ${chalk.bold(method.toUpperCase())} ${path}`
    );

    for (const result of renderedResults) {
      const icon = result.passed ? chalk.green('✔') : chalk.red('x');
      const requirement = `${result.where} ${
        result.isMust ? 'must' : 'should'
      } ${result.condition}`;

      console.log(`${getIndent(2)}${icon} ${requirement}`);

      if (!result.passed) {
        console.log(getIndent(3) + chalk.red(result.error));
      }
      if (result.docsLink) {
        console.log(
          `${getIndent(3)}Read more in our API Guide (${result.docsLink})`
        );
      }
      if (result.sourcemap) {
        console.log(
          `${getIndent(3)}at ${
            isUrl(result.sourcemap.filePath)
              ? `${chalk.underline(result.sourcemap.filePath)} line ${
                  result.sourcemap.startLine
                }`
              : chalk.underline(
                  `${result.sourcemap.filePath}:${result.sourcemap.startLine}:${result.sourcemap.startPosition}`
                )
          }`
        );
      }
    }
    console.log('\n');
  }

  console.log(`${numberOfChanges} changes detected`);
  console.log(chalk.red.bold(`${passedNumberOfChecks} checks passed`));
  console.log(chalk.green.bold(`${failedNumberOfChecks} checks failed`));
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
    throw new UserError(e);
  });
  console.log('Specs loaded - running comparison');

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
        from,
        to,
      },
      {
        output,
        verbose,
      }
    );
  }

  if (uploadResults && changes.length > 0) {
    console.log('Uploading files to Optic...');

    // We've validated the shape in validateUploadRequirements
    const ciContextNotNull = ciContext!;
    const ciProvider = cliConfig.ciProvider!;
    const opticToken = cliConfig.opticToken!;
    const { token, provider } = cliConfig.gitProvider!;
    const opticClient = createOpticClient(opticToken);

    try {
      const uploadOutput = await uploadCiRun(
        compareOutput,
        parsedFrom.jsonLike,
        parsedTo.jsonLike,
        ciContextNotNull,
        ciProvider,
        opticClient,
        {
          from: from ? path.join(process.cwd(), from) : from,
          to: to ? path.join(process.cwd(), to) : to,
        }
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
              'Failed to post comment to github - exiting with a zero exit code.'
            );
            SentryClient?.captureException(e);
          }
        }
      }
    } catch (e) {
      console.log(
        'Error uploading the run to Optic - exiting with a zero exit code.'
      );

      if ((e as Error).name !== 'UserError') {
        SentryClient?.captureException(e);
      }
    }
  } else if (uploadResults) {
    console.log('No changes were detected, not uploading anything');
  }

  const hasError = results.some((result) => !result.passed);

  trackEvent('optic_ci.compare', `${projectName}-optic-ci`, {
    isInCi: process.env.CI === 'true',
    numberOfErrors: results.reduce(
      (count, result) => (result.passed ? count : count + 1),
      0
    ),
    numberOfChanges: changes.length,
  });

  await flushEvents();
  if (hasError) {
    throw new UserError();
  }
};
