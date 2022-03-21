import {
  ResultWithSourcemap,
  IChange,
  OpenApiFact,
} from '@useoptic/openapi-utilities';

import groupBy from 'lodash.groupby';
import isUrl from 'is-url';
import { Instance as Chalk } from 'chalk';

const getIndent = (depth: number): string => ' '.repeat(depth * 2);

export const logComparison = (
  comparison: {
    results: ResultWithSourcemap[];
    changes: IChange<OpenApiFact>[];
  },
  options: {
    output: 'pretty' | 'plain';
    verbose: boolean;
  }
) => {
  const chalk = new Chalk({ level: options.output === 'plain' ? 0 : 1 });
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
      console.log('');
    }
    console.log('\n');
  }

  console.log(`${numberOfChanges} changes detected`);
  console.log(chalk.green.bold(`${passedNumberOfChecks} checks passed`));
  console.log(chalk.red.bold(`${failedNumberOfChecks} checks failed`));
};
