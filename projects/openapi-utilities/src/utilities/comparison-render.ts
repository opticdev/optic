import { ResultWithSourcemap, IChange, OperationLocation } from '..';

import groupBy from 'lodash.groupby';
import isUrl from 'is-url';
import { Instance as Chalk } from 'chalk';
import { getOperationsModifsLabel } from './count-changed-operations';

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

function* generateComparisonLogs(
  comparison: {
    results: ResultWithSourcemap[];
    changes: IChange[];
  },
  options: {
    output: 'pretty' | 'plain';
    verbose: boolean;
  }
) {
  const chalk = new Chalk({ level: options.output === 'plain' ? 0 : 1 });
  const totalNumberOfChecks = comparison.results.length;
  const failedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed && !result.exempted
  ).length;
  const exemptedFailedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed && result.exempted
  ).length;
  const passedNumberOfChecks = totalNumberOfChecks - failedNumberOfChecks;
  const operationsModifsLabel = getOperationsModifsLabel(comparison.changes);
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
      yield `${getIndent(1)}${resultNode} ${chalk.bold('Specification')}`;
    } else {
      const { method, path } = conceptualLocation;
      yield;
      `${getIndent(1)}${resultNode} ${chalk.bold(
        method.toUpperCase()
      )} ${path}`;
    }

    for (const result of renderedResults) {
      const icon = result.passed
        ? chalk.green('✔')
        : result.exempted
        ? chalk.white('✔')
        : chalk.red('x');

      const rulePrefix = result.type ? `${result.type} rule` : 'rule';
      yield `${getIndent(2)}${rulePrefix}: ${result.name ?? ''}${
        result.exempted ? ' (exempted)' : ''
      }`;

      if (!result.passed && !result.exempted) {
        yield getIndent(3) + chalk.red(`${icon} ${result.error}`);
        if (result.expected && result.received) {
          yield getIndent(3) + chalk.red('Expected Value:');
          yield formatRawValue(result.expected, getIndent(3));
          yield getIndent(3) + chalk.red('Received Value:');
          yield formatRawValue(result.received, getIndent(3));
        }
      }
      if (!result.passed && result.exempted) {
        yield getIndent(3) + `${icon} ${result.error}`;
        if (result.expected && result.received) {
          yield getIndent(3) + 'Expected Value:';
          yield formatRawValue(result.expected, getIndent(3));
          yield getIndent(3) + 'Received Value:';
          yield formatRawValue(result.received, getIndent(3));
        }
      }

      if (result.docsLink) {
        yield `${getIndent(3)}Read more in our API Guide (${result.docsLink})`;
      }
      if (result.sourcemap) {
        yield `${getIndent(3)}at ${
          isUrl(result.sourcemap.filePath)
            ? `${chalk.underline(result.sourcemap.filePath)} line ${
                result.sourcemap.startLine
              }`
            : chalk.underline(
                `${result.sourcemap.filePath}:${result.sourcemap.startLine}:${result.sourcemap.startPosition}`
              )
        }`;
      }
      yield '';
    }
    yield '\n';
  }

  yield operationsModifsLabel;
  yield chalk.green.bold(`${passedNumberOfChecks} checks passed`);
  yield chalk.red.bold(`${failedNumberOfChecks} checks failed`);

  if (exemptedFailedNumberOfChecks > 0) {
    yield chalk.bold(`${exemptedFailedNumberOfChecks} checks exempted`);
  }
}

export const getComparisonLogs = (
  comparison: {
    results: ResultWithSourcemap[];
    changes: IChange[];
  },
  options: {
    output: 'pretty' | 'plain';
    verbose: boolean;
  }
) => [...generateComparisonLogs(comparison, options)];

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
  for (const log of generateComparisonLogs(comparison, options)) {
    console.log(log);
  }
};
