import React from 'react';
import { program as cli } from 'commander';
import scenarios from './update-scenarios';
import { render } from 'ink';
import { Baseline } from '../baseline';
import { Update } from '../update';

cli
  .requiredOption('--scenario <scenario>')
  .action(async (options: { scenario: string }) => {
    const scenario = scenarios[options.scenario];

    if (scenario) {
      const { source, specInterfaceFactory, start } = await scenario();

      const { waitUntilExit } = render(
        <Update source={source} specInterfaceFactory={specInterfaceFactory} />
      );

      setTimeout(() => {
        start();
      }, 100);
    } else {
      throw new Error(`${options.scenario} not found`);
    }
  });

cli.parse(process.argv);
