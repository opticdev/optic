import React from 'react';
import { program as cli } from 'commander';
import { Compare } from './commands/compare';
import { parseSpecVersion } from './input-helpers/compare-input-parser';
import { defaultEmptySpec } from '@useoptic/openapi-utilities';
const packageJson = require('../../package.json');
import { render } from 'ink';
import { ApiCheckService } from '../sdk/api-check-service';
import { registerUpload } from './commands/upload';
import { registerGithubComment } from './commands/comment';
import { registerBulkCompare } from './commands/compare';
import { initSentry, wrapActionHandlerWithSentry } from './sentry';
import { initSegment } from './segment';

export function makeCiCli<T>(
  forProject: string,
  checkService: ApiCheckService<T>,
  options: {
    opticToken?: string;
  } = {}
) {
  initSentry(packageJson.version);
  initSegment();
  const { opticToken } = options;

  cli.version(
    `for ${forProject}, running optic api-check ${packageJson.version}`
  );

  cli
    .command('compare')
    .option('--from <from>', 'from file or rev:file, defaults empty spec')
    .option('--to <to>', 'to file or rev:file, defaults empty spec')
    .option('--context <context>', 'json of context')
    .option('--verbose', 'show all checks, even passing', false)
    .option(
      '--output <format>',
      "show 'pretty' output for interactive usage or 'json' for JSON",
      'pretty'
    )
    .action(
      wrapActionHandlerWithSentry(
        async (options: {
          from: string;
          to?: string;
          rules: string;
          context: T;
          verbose: boolean;
          output: 'pretty' | 'json' | 'plain';
        }) => {
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
          const { waitUntilExit } = render(
            <Compare
              verbose={options.verbose}
              output={options.output}
              apiCheckService={checkService}
              from={parseSpecVersion(options.from, defaultEmptySpec)}
              to={parseSpecVersion(options.to, defaultEmptySpec)}
              context={options.context}
            />,
            { exitOnCtrlC: true }
          );
          await waitUntilExit();
        }
      )
    );

  registerBulkCompare(cli, checkService);
  registerUpload(cli, { opticToken });
  registerGithubComment(cli);

  return cli;
}
