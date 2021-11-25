import React from 'react';
import { program as cli } from 'commander';
import scenarios from './update-scenarios';

cli
  .requiredOption('--scenario <scenario>')
  .action(async (options: { scenario: string }) => {
    const scenario = scenarios[options.scenario];

    console.log('ABC');

    if (scenario) {
      const abc = await scenario();
      console.log(abc.results);
    } else {
      throw new Error(`${options.scenario} not found`);
    }
  });

cli.parse(process.argv);
