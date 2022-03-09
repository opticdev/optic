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
import { CliConfig } from '../../types';
import { uploadCiRun } from './upload';
import { sendGithubMessage } from './github-comment';
import path from 'path';

type LoadingState =
  | {
      loading: true;
    }
  | {
      loading: false;
      error: Error;
    }
  | {
      loading: false;
      error: false;
    };

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
    .option(
      '--github-annotations',
      'show the result of checks using github action errors',
      false
    )
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

          if (options.output === 'plain') {
            // https://github.com/chalk/chalk#supportscolor
            // https://github.com/chalk/supports-color/blob/ff1704d46cfb0714003f53c8d7e55736d8d545ff/index.js#L38
            if (
              process.env.FORCE_COLOR !== 'false' &&
              process.env.FORCE_COLOR !== '0'
            ) {
              console.error(
                `Please set FORCE_COLOR=false or FORCE_COLOR=0 to enable plain text output in the environment you want to run this command in`
              );
              return process.exit(1);
            }
          }
          const parsedContext = parseContextObject(options.context);
          validateUploadRequirements(
            options.uploadResults,
            cliConfig,
            options.ciContext
          );

          // TODO figure out if we need to maintain verbose, and json
          await runCompare({
            from: options.from,
            to: options.to,
            apiCheckService: checkService,
            context: parsedContext,
            uploadResults: options.uploadResults,
            projectName: projectName,
            ciContext: options.ciContext,
            cliConfig: cliConfig,
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
}: {
  from?: string;
  to?: string;
  apiCheckService: ApiCheckService<any>;
  context: any;
  uploadResults: boolean;
  ciContext?: string;
  cliConfig: CliConfig;
  projectName: string;
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

  const compareOutput = await generateSpecResults(
    apiCheckService,
    parsedFrom,
    parsedTo,
    context
  );
  const { results, changes } = compareOutput;
  // TODO render code here
  // TODO handle output json
  // if (props.output == 'json') {
  //   if ('data' in results) {
  //     const filteredResults = props.verbose
  //       ? results.data
  //       : results.data.filter((x) => !x.passed);
  //     stdout.write(JSON.stringify(filteredResults, null, 2));
  //   }
  //   return null;
  // }

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

      SentryClient?.captureException(e);
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
