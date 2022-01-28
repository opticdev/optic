#!/usr/bin/env node

import { program as cli } from 'commander';
import { Compare } from '@useoptic/api-checks/build/ci-cli/commands/compare';
import { wrapActionHandlerWithSentry } from '@useoptic/api-checks/build/ci-cli/sentry';
import { render } from 'ink';
import React from 'react';
import { SourcemapRendererEnum } from '@useoptic/api-checks/build/ci-cli/commands/components/render-results';
import { parseConfig } from './config';
import { parseSpecVersion, specFromInputToResults } from '@useoptic/api-checks';
import { defaultEmptySpec } from '@useoptic/openapi-utilities';

cli.name('optic-ci');
cli.description('compare two OpenAPI files');

cli
  .command('compare')
  .option('--from <from>', 'from file or rev:file, defaults empty spec')
  .option('--to <to>', 'to file or rev:file, defaults empty spec')
  .option('--verbose', 'show all checks, even passing', false)

  .option(
    '--output <format>',
    "show 'pretty' output for interactive usage or 'json' for JSON",
    'pretty'
  )
  .action(
    wrapActionHandlerWithSentry(
      async (options: {
        from?: string;
        to?: string;
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

        const toSpec = await specFromInputToResults(
          parseSpecVersion(options.to, defaultEmptySpec),
          process.cwd()
        );

        const checkService = parseConfig(toSpec.jsonLike);

        const { waitUntilExit } = render(
          <Compare
            verbose={options.verbose}
            output={options.output}
            apiCheckService={checkService}
            from={options.from}
            to={options.to}
            context={{}}
            mapToFile={SourcemapRendererEnum.local}
            projectName={'optic-ci'}
            uploadResults={false}
            cliConfig={{}}
          />,
          { exitOnCtrlC: true }
        );
        await waitUntilExit();
        return Promise.resolve();
      }
    )
  );

cli.parse(process.argv);
