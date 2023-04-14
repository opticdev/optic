import {
  RuleResult,
  ObjectDiff,
  SerializedSourcemap,
  sourcemapReader,
  OpenAPIV3,
  Severity,
  getOperationsChangedLabel,
  sevToText,
} from '@useoptic/openapi-utilities';
import groupBy from 'lodash.groupby';
import isUrl from 'is-url';
import { Instance as Chalk } from 'chalk';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getLocation } from '@useoptic/openapi-utilities/build/openapi3/traverser';
import { GroupedDiffs } from '@useoptic/openapi-utilities/build/openapi3/group-diff';

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
    severity: Severity;
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
  const blue = mdOutput ? identity : chalk.blue;
  const yellow = mdOutput ? identity : chalk.yellow;
  const white = mdOutput ? identity : chalk.white;
  const red = mdOutput ? identity : chalk.red;
  const bgRed = mdOutput ? identity : chalk.bgRed;
  const bgGreen = mdOutput ? identity : chalk.bgGreen;
  const underline = mdOutput ? identity : chalk.underline;

  const totalNumberOfChecks = comparison.results.length;
  const failedChecks = comparison.results.filter(
    (result) => !result.passed && !result.exempted
  );
  const numberOfChecks = {
    info: failedChecks.filter((r) => r.severity === Severity.Info).length,
    warn: failedChecks.filter((r) => r.severity === Severity.Warn).length,
    error: failedChecks.filter((r) => r.severity === Severity.Error).length,
  };
  const exemptedFailedNumberOfChecks = comparison.results.filter(
    (result) => !result.passed && result.exempted
  ).length;
  const passedNumberOfChecks = totalNumberOfChecks - failedChecks.length;
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
      (result) =>
        result.passed || result.exempted || result.severity < options.severity
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
      // depending on the severity, use different colors
      const failedAccent =
        result.severity === Severity.Info
          ? blue
          : result.severity === Severity.Warn
          ? yellow
          : red;
      const icon = result.passed
        ? mdOutput
          ? ':heavy_check_mark:'
          : green('✔')
        : result.exempted
        ? mdOutput
          ? ':heavy_minus_sign:'
          : white('✔')
        : result.severity === Severity.Info
        ? mdOutput
          ? ':information_source:'
          : failedAccent('ⓘ')
        : result.severity === Severity.Warn
        ? mdOutput
          ? ':warning:'
          : failedAccent('⚠')
        : mdOutput
        ? ':x:'
        : failedAccent('x');

      const severity = failedAccent(` [${sevToText(result.severity)}]`);
      const rulePrefix =
        (result.type ? `${result.type} rule` : 'rule') + severity;
      yield `${getItem()}${getIndent(2)}${rulePrefix}: ${result.name ?? ''}${
        result.exempted ? ' (exempted)' : ''
      }`;

      if (!result.passed && !result.exempted) {
        yield getIndent(3) + failedAccent(`${icon} ${result.error}`);
        if (result.expected && result.received) {
          yield getIndent(3) + failedAccent('Expected Value:');
          yield formatRawValue(result.expected, getIndent(3));
          yield getIndent(3) + failedAccent('Received Value:');
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
  yield green(bold(`${passedNumberOfChecks} passed`));
  if (numberOfChecks.info > 0) yield blue(bold(`${numberOfChecks.info} info`));
  if (numberOfChecks.warn > 0)
    yield blue(bold(`${numberOfChecks.warn} warnings`));
  yield red(bold(`${numberOfChecks.error} errors`));

  if (exemptedFailedNumberOfChecks > 0) {
    yield bold(`${exemptedFailedNumberOfChecks} checks exempted`);
  }
}
