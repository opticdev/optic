import {
  ResultWithSourcemap,
  IChange,
  OperationLocation,
  RuleResult,
  ObjectDiff,
  SerializedSourcemap,
  sourcemapReader,
  OpenAPIV3,
} from '..';
import groupBy from 'lodash.groupby';
import isUrl from 'is-url';
import { Instance as Chalk } from 'chalk';
import {
  getOperationsModifsLabel,
  getOperationsChangedLabel,
} from './count-changed-operations';
import { getLocation } from '../openapi3/traverser';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { GroupedDiffs } from '../openapi3/group-diff';

const SEPARATOR = `~_-_~`;

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

const md = {
  bold: (s: string) => `**${s}**`,
};

export function* generateComparisonLogs(
  comparison: {
    results: ResultWithSourcemap[];
    changes: IChange[];
  },
  options: {
    output: 'pretty' | 'plain' | 'md';
    verbose: boolean;
  }
) {
  const mdOutput = options.output === 'md';
  const chalk = new Chalk({
    level: options.output === 'pretty' ? 1 : 0,
  });
  const getIndent = (depth: number): string =>
    mdOutput ? '' : ' '.repeat(depth * 2);
  const getItem = () => (mdOutput ? '- ' : '');

  const identity = (s: string) => s;
  const bold = mdOutput ? md.bold : chalk.bold;
  const green = mdOutput ? identity : chalk.green;
  const white = mdOutput ? identity : chalk.white;
  const red = mdOutput ? identity : chalk.red;
  const bgRed = mdOutput ? identity : chalk.bgRed;
  const bgGreen = mdOutput ? identity : chalk.bgGreen;
  const underline = mdOutput ? identity : chalk.underline;

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
      ? bold(bgGreen(white(mdOutput ? 'PASS' : ' PASS ')))
      : bold(bgRed(white(mdOutput ? 'FAIL' : ' FAIL ')));

    if (!('path' in conceptualLocation)) {
      yield `${getIndent(1)}${resultNode} ${bold('Specification')}`;
    } else {
      const { method, path } = conceptualLocation;
      yield `${getIndent(1)}${resultNode} ${bold(
        method.toUpperCase()
      )} ${path}`;
    }

    for (const result of renderedResults) {
      const icon = result.passed
        ? mdOutput
          ? ':heavy_check_mark:'
          : green('✔')
        : result.exempted
        ? mdOutput
          ? ':heavy_minus_sign:'
          : white('✔')
        : mdOutput
        ? ':x:'
        : red('x');

      const rulePrefix = result.type ? `${result.type} rule` : 'rule';
      yield `${getItem()}${getIndent(2)}${rulePrefix}: ${result.name ?? ''}${
        result.exempted ? ' (exempted)' : ''
      }`;

      if (!result.passed && !result.exempted) {
        yield getIndent(3) + red(`${icon} ${result.error}`);
        if (result.expected && result.received) {
          yield getIndent(3) + red('Expected Value:');
          yield formatRawValue(result.expected, getIndent(3));
          yield getIndent(3) + red('Received Value:');
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
            ? `${underline(result.sourcemap.filePath)} line ${
                result.sourcemap.startLine
              }`
            : underline(
                `${result.sourcemap.filePath}:${result.sourcemap.startLine}:${result.sourcemap.startPosition}`
              )
        }`;
      }
      yield '';
    }
    yield '\n';
  }

  yield operationsModifsLabel;
  yield green(bold(`${passedNumberOfChecks} checks passed`));
  yield red(bold(`${failedNumberOfChecks} checks failed`));

  if (exemptedFailedNumberOfChecks > 0) {
    yield bold(`${exemptedFailedNumberOfChecks} checks exempted`);
  }
}

export const getComparisonLogs = (
  comparison: {
    results: ResultWithSourcemap[];
    changes: IChange[];
  },
  options: {
    output: 'pretty' | 'plain' | 'md';
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

export function* generateComparisonLogsV2(
  groupedDiffs: GroupedDiffs,
  sourcemap: {
    from: SerializedSourcemap;
    to: SerializedSourcemap;
  },
  comparison: {
    results: RuleResult[];
    diffs: ObjectDiff[];
  },
  options: {
    output: 'pretty' | 'plain' | 'md';
    verbose: boolean;
  }
) {
  const operationsChangedLabel = getOperationsChangedLabel(groupedDiffs);
  const { findFileAndLines: findFileAndLinesFromBefore } = sourcemapReader(
    sourcemap.from
  );
  const { findFileAndLines: findFileAndLinesFromAfter } = sourcemapReader(
    sourcemap.to
  );
  const mdOutput = options.output === 'md';
  const chalk = new Chalk({
    level: options.output === 'pretty' ? 1 : 0,
  });
  const getIndent = (depth: number): string =>
    mdOutput ? '' : ' '.repeat(depth * 2);
  const getItem = () => (mdOutput ? '- ' : '');

  const identity = (s: string) => s;
  const bold = mdOutput ? md.bold : chalk.bold;
  const green = mdOutput ? identity : chalk.green;
  const white = mdOutput ? identity : chalk.white;
  const red = mdOutput ? identity : chalk.red;
  const bgRed = mdOutput ? identity : chalk.bgRed;
  const bgGreen = mdOutput ? identity : chalk.bgGreen;
  const underline = mdOutput ? identity : chalk.underline;

  const totalNumberOfChecks = comparison.results.length;
  const failedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed && !result.exempted
  ).length;
  const exemptedFailedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed && result.exempted
  ).length;
  const passedNumberOfChecks = totalNumberOfChecks - failedNumberOfChecks;
  const groupedResults = groupBy(comparison.results, (result) => {
    // OpenAPIV3 assumption
    const parts = jsonPointerHelpers.decode(result.location.jsonPath);
    if (parts.length >= 3 && parts[0] === 'paths') {
      const location = getLocation({
        location: {
          jsonPath: result.location.jsonPath,
        },
        type: 'operation',
      });

      if (
        Object.values(OpenAPIV3.HttpMethods).includes(location.method as any)
      ) {
        return `${location.pathPattern}${SEPARATOR}${location.method}`;
      } else {
        return `${location.pathPattern}${SEPARATOR}`;
      }
    } else {
      return 'Specification';
    }
  });

  for (const [location, operationResults] of Object.entries(groupedResults)) {
    const allPassed = operationResults.every(
      (result) => result.passed || result.exempted
    );
    const renderedResults = operationResults.filter(
      (result) => options.verbose || (!result.passed && !result.exempted)
    );
    const resultNode = allPassed
      ? bold(bgGreen(white(mdOutput ? 'PASS' : ' PASS ')))
      : bold(bgRed(white(mdOutput ? 'FAIL' : ' FAIL ')));

    if (location === 'specification') {
      yield `${getIndent(1)}${resultNode} ${bold('Specification')}`;
    } else {
      const [path, method] = location.split(SEPARATOR);
      if (!method) {
        yield `${getIndent(1)}${resultNode} ${path}`;
      } else {
        yield `${getIndent(1)}${resultNode} ${bold(
          method.toUpperCase()
        )} ${path}`;
      }
    }

    for (const result of renderedResults) {
      const icon = result.passed
        ? mdOutput
          ? ':heavy_check_mark:'
          : green('✔')
        : result.exempted
        ? mdOutput
          ? ':heavy_minus_sign:'
          : white('✔')
        : mdOutput
        ? ':x:'
        : red('x');

      const rulePrefix = result.type ? `${result.type} rule` : 'rule';
      yield `${getItem()}${getIndent(2)}${rulePrefix}: ${result.name ?? ''}${
        result.exempted ? ' (exempted)' : ''
      }`;

      if (!result.passed && !result.exempted) {
        yield getIndent(3) + red(`${icon} ${result.error}`);
        if (result.expected && result.received) {
          yield getIndent(3) + red('Expected Value:');
          yield formatRawValue(result.expected, getIndent(3));
          yield getIndent(3) + red('Received Value:');
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
      const sourcemap =
        result.location.spec === 'before'
          ? findFileAndLinesFromBefore(result.location.jsonPath)
          : findFileAndLinesFromAfter(result.location.jsonPath);
      if (sourcemap) {
        yield `${getIndent(3)}at ${
          isUrl(sourcemap.filePath)
            ? `${underline(sourcemap.filePath)} line ${sourcemap.startLine}`
            : underline(
                `${sourcemap.filePath}:${sourcemap.startLine}:${sourcemap.startPosition}`
              )
        }`;
      }
      yield '';
    }
    yield '\n';
  }

  yield operationsChangedLabel;
  yield green(bold(`${passedNumberOfChecks} checks passed`));
  yield red(bold(`${failedNumberOfChecks} checks failed`));

  if (exemptedFailedNumberOfChecks > 0) {
    yield bold(`${exemptedFailedNumberOfChecks} checks exempted`);
  }
}
