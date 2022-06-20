import { ResultWithSourcemap, IChange, OperationLocation } from '..';

import groupBy from 'lodash.groupby';
import isUrl from 'is-url';
import { Instance as Chalk } from 'chalk';

const getIndent = (depth: number): string => ' '.repeat(depth * 2);

// raw string value
const formatRawValue = (value: string, indent: string): string => {
  try {
    const parsedValue = JSON.parse(value);
    return (
      indent +
      JSON.stringify(parsedValue, null, 2).replace(/\n/g, '\n' + indent)
    );
  } catch (e) {
    return value;
  }
};

export const logComparison = (
  comparison: {
    results: ResultWithSourcemap[];
    changes: IChange[];
  },
  options: {
    output: 'pretty' | 'plain';
    verbose: boolean;
  }
) => {
  const chalk = new Chalk({ level: options.output === 'plain' ? 0 : 1 });
  const totalNumberOfChecks = comparison.results.length;
  const failedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed && !result.exempted
  ).length;
  const exemptedFailedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed && result.exempted
  ).length;
  const passedNumberOfChecks = totalNumberOfChecks - failedNumberOfChecks;
  const numberOfChanges = comparison.changes.length;
  const groupedResults = groupBy(
    comparison.results,
    (result) =>
      `${
        (result.change.location.conceptualLocation as OperationLocation).method
      }-${
        (result.change.location.conceptualLocation as OperationLocation).path
      }`
  );

  for (const operationResults of Object.values(groupedResults)) {
    const conceptualLocation =
      operationResults[0].change.location.conceptualLocation;

    const allPassed = operationResults.every(
      (result) => result.passed || result.exempted
    );
    const renderedResults = operationResults.filter(
      (result) => options.verbose || (!result.passed && !result.exempted)
    );
    const resultNode = allPassed
      ? chalk.bold.bgGreen.white(' PASS ')
      : chalk.bold.bgRed.white(' FAIL ');

    if (!('path' in conceptualLocation)) {
      console.log(
        `${getIndent(1)}${resultNode} ${chalk.bold('Specification')}`
      );
    } else {
      const { method, path } = conceptualLocation;
      console.log(
        `${getIndent(1)}${resultNode} ${chalk.bold(
          method.toUpperCase()
        )} ${path}`
      );
    }

    for (const result of renderedResults) {
      const icon = result.passed
        ? chalk.green('✔')
        : result.exempted
        ? chalk.white('✔')
        : chalk.red('x');
      const requirement = `${result.where} ${
        result.isMust ? 'must' : 'should'
      } ${result.condition}`;

      if (result.name) {
        console.log(
          `${getIndent(2)}Rule: ${result.name}${
            result.exempted ? ' (exempted)' : ''
          }`
        );
      }
      console.log(`${getIndent(2)}${icon} ${requirement}`);

      if (!result.passed && !result.exempted) {
        console.log(getIndent(3) + chalk.red(result.error));
        if (result.expected && result.received) {
          console.log(getIndent(3) + chalk.red('Expected Value:'));
          console.log(formatRawValue(result.expected, getIndent(3)));
          console.log(getIndent(3) + chalk.red('Received Value:'));
          console.log(formatRawValue(result.received, getIndent(3)));
        }
      }
      if (!result.passed && result.exempted) {
        console.log(getIndent(3) + result.error);
        if (result.expected && result.received) {
          console.log(getIndent(3) + 'Expected Value:');
          console.log(formatRawValue(result.expected, getIndent(3)));
          console.log(getIndent(3) + 'Received Value:');
          console.log(formatRawValue(result.received, getIndent(3)));
        }
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

  if (exemptedFailedNumberOfChecks > 0) {
    console.log(chalk.bold(`${exemptedFailedNumberOfChecks} checks exempted`));
  }
};
