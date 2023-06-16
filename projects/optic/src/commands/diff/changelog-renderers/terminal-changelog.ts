import { OpenAPIV3 } from 'openapi-types';
import path from 'path';
import {
  ObjectDiff,
  RuleResult,
  Severity,
  SeverityText,
  getOperationsChangedLabel,
  sevToText,
  sourcemapReader,
  typeofDiff,
} from '@useoptic/openapi-utilities';
import type {
  GroupedDiffs,
  Body,
  Diff,
  Endpoint,
  Response,
} from '@useoptic/openapi-utilities/build/openapi3/group-diff';
import {
  getEndpointRules,
  typeofV3Diffs,
} from '@useoptic/openapi-utilities/build/openapi3/group-diff';
import { Instance as Chalk } from 'chalk';
import { getLocation } from '@useoptic/openapi-utilities/build/openapi3/traverser';
import { interpretFieldLevelDiffs } from './common';
import { ParseResult } from '../../../utils/spec-loaders';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import isUrl from 'is-url';

const chalk = new Chalk();

const added = chalk.green('added');
const removed = chalk.red('removed');
const changed = chalk.yellow('changed');
type SourcemapReaderFindLine = ReturnType<
  typeof sourcemapReader
>['findFileAndLines'];

const INDENTATION = '  ';
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

const getAddedOrRemovedLabel = (
  change: 'added' | 'changed' | 'removed' | null
) => (change === 'added' ? added : change === 'removed' ? removed : '');

function* getDetailLogs(diffs: Diff[], options: { label?: string } = {}) {
  if (diffs.length === 0) return;
  if (options.label) yield options.label;

  const summarized: {
    added: string[];
    changed: string[];
    removed: string[];
  } = {
    added: [],
    changed: [],
    removed: [],
  };

  for (const diff of diffs) {
    if (diff.trail === '') {
      continue;
    }
    const key = typeofDiff(diff);
    summarized[key].push(diff.trail);
  }

  if (summarized.added.length) {
    const keys = summarized.added.join(', ');
    yield `- ${keys} ${added}`;
  }

  if (summarized.changed.length) {
    const keys = summarized.changed.join(', ');
    yield `- ${keys} ${changed}`;
  }

  if (summarized.removed.length) {
    const keys = summarized.removed.join(', ');
    yield `- ${keys} ${removed}`;
  }

  yield '';
}

function getRuleStatus(
  rules: RuleResult[],
  options: { severity: Severity }
): 'passed' | SeverityText {
  if (
    rules.some(
      (r) => !r.passed && !r.exempted && r.severity <= options.severity
    )
  ) {
    return 'error';
  } else if (
    rules.some((r) => !r.passed && !r.exempted && r.severity === Severity.Warn)
  ) {
    return 'warn';
  } else if (
    rules.some((r) => !r.passed && !r.exempted && r.severity === Severity.Info)
  ) {
    return 'info';
  } else {
    return 'passed';
  }
}

function getEndpointStatus(
  endpoint: GroupedDiffs['endpoints'][string],
  options: {
    severity: Severity;
  }
): 'passed' | SeverityText {
  const rules = getEndpointRules(endpoint);

  return getRuleStatus(rules, options);
}

function getIcon(status: 'passed' | SeverityText): string {
  return status === 'passed'
    ? '✔'
    : status === 'info'
    ? 'ⓘ'
    : status === 'warn'
    ? '⚠'
    : 'x';
}

function* getRuleLogs(
  rules: RuleResult[],
  sourcemapReaders: {
    before: SourcemapReaderFindLine;
    after: SourcemapReaderFindLine;
  },
  options: {
    verbose: boolean;
  }
) {
  const filteredRules = rules.filter((r) =>
    options.verbose ? true : !r.passed
  );
  for (const result of filteredRules) {
    const accent = result.passed
      ? chalk.green
      : result.exempted
      ? chalk.gray
      : result.severity === Severity.Info
      ? chalk.blue
      : result.severity === Severity.Warn
      ? chalk.yellow
      : chalk.red;
    const icon = getIcon(result.passed ? 'passed' : sevToText(result.severity));
    yield accent(
      `${chalk.bold(`${icon} ${`[${result.name}]` ?? ''}`)}${
        result.exempted ? ' (exempted)' : ''
      } ${result.error}`
    );

    if (result.expected && result.received) {
      yield accent('Expected Value:');
      yield formatRawValue(result.expected, INDENTATION.repeat(3));
      yield accent('Received Value:');
      yield formatRawValue(result.received, INDENTATION.repeat(3));
    }

    if (result.docsLink) {
      yield `Read more in our API Guide (${result.docsLink})`;
    }
    const sourcemap =
      result.location.spec === 'before'
        ? sourcemapReaders.before(result.location.jsonPath)
        : sourcemapReaders.after(result.location.jsonPath);

    const sourcemapText = sourcemap
      ? isUrl(sourcemap.filePath)
        ? ` (${chalk.underline(sourcemap.filePath)} line ${
            sourcemap.startLine
          })`
        : ' ' +
          chalk.underline(
            `(${path.relative(process.cwd(), sourcemap.filePath)}:${
              sourcemap.startLine
            }:${sourcemap.startPosition})`
          )
      : '';

    const jsonPath = jsonPointerHelpers
      .decode(result.location.jsonPath)
      .join(' > ');
    yield `at ${jsonPath}${sourcemapText}`;
    yield '';
  }
}

function* indent(generator: Generator<string>) {
  for (const y of generator) {
    yield `${INDENTATION}${y}`;
  }
}

function countUnusedEndpoints(
  spec: OpenAPIV3.Document,
  groupedDiffs: GroupedDiffs
): number {
  const endpoints = new Set<string>();

  for (const [path, pathObj] of Object.entries(spec.paths)) {
    for (const method of Object.keys(pathObj ?? {})) {
      if (Object.values(OpenAPIV3.HttpMethods).includes(method as any)) {
        endpoints.add(`${path}${method}`);
      }
    }
  }

  for (const { path, method } of Object.values(groupedDiffs.endpoints)) {
    endpoints.delete(`${path}${method}`);
  }

  return endpoints.size;
}

export function* terminalChangelog(
  specs: { from: ParseResult; to: ParseResult },
  groupedDiffs: GroupedDiffs,
  comparison: {
    results: RuleResult[];
    diffs: ObjectDiff[];
  },
  options: {
    path: string;
    check: boolean;
    inCi: boolean;
    output: 'pretty' | 'plain';
    verbose: boolean;
    severity: Severity;
    previewDocsLink?: string | null;
  }
): Generator<string> {
  const specName = specs.to.jsonLike.info.title || 'Unnamed spec';
  const sourcemapReaders = {
    before: sourcemapReader(specs.from.sourcemap).findFileAndLines,
    after: sourcemapReader(specs.to.sourcemap).findFileAndLines,
  };
  const operationsChangedLabel =
    getOperationsChangedLabel(groupedDiffs) || 'No operations changed';
  const totalNumberOfChecks = comparison.results.length;
  const failedChecks = comparison.results.filter(
    (result) =>
      !result.passed && !result.exempted && result.severity <= options.severity
  );
  const exemptedFailedNumberOfChecks = comparison.results.filter(
    (result) =>
      !result.passed && result.exempted && result.severity <= options.severity
  ).length;
  const passedNumberOfChecks = totalNumberOfChecks - failedChecks.length;
  const failedWarnings = comparison.results.filter(
    (result) =>
      !result.passed && !result.exempted && result.severity === Severity.Warn
  ).length;
  const failedInfo = comparison.results.filter(
    (result) =>
      !result.passed && !result.exempted && result.severity === Severity.Info
  ).length;

  const specStatus = getRuleStatus(comparison.results, options);
  const accent = options.check
    ? specStatus === 'passed'
      ? chalk.green
      : specStatus === 'info'
      ? chalk.blue
      : specStatus === 'warn'
      ? chalk.yellow
      : chalk.red
    : (i: string) => i;
  const icon = options.check ? accent(`${getIcon(specStatus)} `) : '';
  yield `${icon}${chalk.bold(specName)} ${chalk.gray(options.path)}`;
  if (options.inCi) {
    const link =
      options.previewDocsLink || 'https://useoptic.com/docs/cloud-get-started';
    yield `${chalk.bold('Preview docs: ')} ${link}`;
  }

  yield `${chalk.bold('Operations: ')}${operationsChangedLabel}`;

  if (options.check && totalNumberOfChecks > 0) {
    const exemptLabel =
      exemptedFailedNumberOfChecks > 0
        ? chalk.gray(`${exemptedFailedNumberOfChecks} exempted`)
        : '';
    const warnLabel =
      options.severity === Severity.Error && failedWarnings > 0
        ? chalk.yellow(`${failedWarnings} warnings`)
        : '';
    const infoLabel =
      options.severity > Severity.Info && failedInfo > 0
        ? chalk.blue(`${failedWarnings} info`)
        : '';
    const label = [exemptLabel, warnLabel, infoLabel]
      .filter((l) => l)
      .join(', ');
    yield `${icon} ${chalk.bold(
      'Checks:'
    )} ${passedNumberOfChecks}/${totalNumberOfChecks} passed ${
      label ? `(${label})` : ''
    }`;
  }

  yield '';

  const { endpoints, specification } = groupedDiffs;
  yield* getDetailLogs(specification.diffs, {
    label: 'specification details:',
  });
  yield* getRuleLogs(specification.rules, sourcemapReaders, options);

  for (const [, endpoint] of Object.entries(endpoints))
    yield* getEndpointLogs(
      { from: specs.from.jsonLike, to: specs.to.jsonLike },
      endpoint,
      sourcemapReaders,
      options
    );

  const otherEndpoints = countUnusedEndpoints(specs.to.jsonLike, groupedDiffs);
  if (otherEndpoints > 0 && Object.keys(groupedDiffs.endpoints).length > 0)
    yield `...and ${otherEndpoints} other ${
      otherEndpoints === 1 ? 'endpoint' : 'endpoints'
    }`;
  yield '';
}

function* getEndpointLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  endpointChange: Endpoint,
  sourcemapReaders: {
    before: SourcemapReaderFindLine;
    after: SourcemapReaderFindLine;
  },
  options: {
    verbose: boolean;
    check: boolean;
    severity: Severity;
  }
): Generator<string> {
  const {
    method,
    path,
    request,
    responses,
    cookieParameters,
    diffs,
    rules,
    headerParameters,
    pathParameters,
    queryParameters,
  } = endpointChange;

  const change = typeofV3Diffs(diffs);
  const endpointStatus = getEndpointStatus(endpointChange, options);
  const icon = options.check ? `${getIcon(endpointStatus)} ` : '';
  const accent = options.check
    ? endpointStatus === 'passed'
      ? chalk.green
      : endpointStatus === 'info'
      ? chalk.blue
      : endpointStatus === 'warn'
      ? chalk.yellow
      : chalk.red
    : (i: string) => i;

  yield `${accent(`${icon}${chalk.bold(method.toUpperCase())} ${path}`)}: ${
    change ? getAddedOrRemovedLabel(change) : ''
  }`;

  yield* indent(getDetailLogs(diffs));
  yield* indent(getRuleLogs(rules, sourcemapReaders, options));

  yield* indent(
    getParameterLogs('query', queryParameters, sourcemapReaders, options)
  );

  yield* indent(
    getParameterLogs('cookie', cookieParameters, sourcemapReaders, options)
  );

  yield* indent(
    getParameterLogs('path', pathParameters, sourcemapReaders, options)
  );

  yield* indent(
    getParameterLogs('header', headerParameters, sourcemapReaders, options)
  );

  yield* indent(
    getRequestChangeLogs(specs, request, sourcemapReaders, options)
  );

  for (const [statusCode, response] of Object.entries(responses)) {
    yield* indent(
      getResponseChangeLogs(
        specs,
        response,
        statusCode,
        sourcemapReaders,
        options
      )
    );
  }
  yield '';
}

function* getResponseChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  response: Response,
  statusCode: string,
  sourcemapReaders: {
    before: SourcemapReaderFindLine;
    after: SourcemapReaderFindLine;
  },
  options: {
    verbose: boolean;
  }
) {
  const label = `- response ${chalk.bold(statusCode)}:`;
  const change = typeofV3Diffs(response.diffs);

  if (change === 'removed') {
    yield `${label} ${removed}`;
    return;
  }

  if (
    change ||
    response.headers.diffs.length ||
    Object.values(response.contents).length
  ) {
    yield `${label} ${change === 'added' ? added : ''}`;
  }

  if (change) {
    yield* indent(getDetailLogs(response.diffs));
  }
  yield* indent(getRuleLogs(response.rules, sourcemapReaders, options));
  for (const diff of response.headers.diffs) {
    yield* indent(getResponseHeaderLogs(diff));
  }
  yield* indent(getRuleLogs(response.headers.rules, sourcemapReaders, options));

  for (const [key, contentType] of Object.entries(response.contents)) {
    yield* indent(
      getBodyChangeLogs(specs, contentType, key, sourcemapReaders, options)
    );
  }
}

function* getRequestChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  request: Endpoint['request'],
  sourcemapReaders: {
    before: SourcemapReaderFindLine;
    after: SourcemapReaderFindLine;
  },
  options: {
    verbose: boolean;
  }
) {
  const change = typeofV3Diffs(request.diffs);
  const label = `- request:`;

  if (change === 'removed') {
    yield `${label} ${removed}`;
    return;
  }

  if (change || Object.values(request.contents).length) {
    yield `${label} ${change === 'added' ? added : ''}`;
  }

  yield* indent(getDetailLogs(request.diffs));
  yield* indent(getRuleLogs(request.rules, sourcemapReaders, options));

  for (const [key, bodyChange] of Object.entries(request.contents)) {
    yield* indent(
      getBodyChangeLogs(specs, bodyChange, key, sourcemapReaders, options)
    );
  }
}

function* getBodyChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  body: Body,
  key: string,
  sourcemapReaders: {
    before: SourcemapReaderFindLine;
    after: SourcemapReaderFindLine;
  },
  options: {
    verbose: boolean;
  }
) {
  const fieldDiffs = interpretFieldLevelDiffs(specs, body.fields);
  const flatDiffs = [...fieldDiffs, ...body.examples.diffs];
  const flatRules = [
    ...Object.values(body.fields).flatMap((f) => f.rules),
    ...body.examples.rules,
  ];
  const change = typeofV3Diffs(flatDiffs);
  const label = `- body ${chalk.bold(key)}:`;

  if (change === 'removed') {
    yield `${label} ${removed}`;
    return;
  }

  yield `${label} ${change === 'added' ? added : ''}`;

  yield* indent(getDetailLogs(flatDiffs));
  yield* indent(getRuleLogs(flatRules, sourcemapReaders, options));
}

function* getResponseHeaderLogs(diff: Diff) {
  const change = typeofDiff(diff);
  const location = getLocation({
    location: { jsonPath: diff.after ?? diff.before },
    type: 'response-header',
  });
  yield `- response header ${chalk.italic(
    location.headerName
  )}: ${getAddedOrRemovedLabel(change)}`;

  if (change !== 'removed') {
    yield* indent(getDetailLogs([diff]));
  }
}

function* getParameterLogs(
  parameterType: 'query' | 'cookie' | 'path' | 'header',
  diffByName: Record<string, { diffs: Diff[]; rules: RuleResult[] }>,
  sourcemapReaders: {
    before: SourcemapReaderFindLine;
    after: SourcemapReaderFindLine;
  },
  options: {
    verbose: boolean;
  }
) {
  for (const [name, { diffs: diffsForName, rules }] of Object.entries(
    diffByName
  )) {
    const change = typeofV3Diffs(diffsForName);
    yield `- ${parameterType} parameter ${chalk.italic(
      name
    )}: ${getAddedOrRemovedLabel(change)}`;

    if (change !== 'removed') {
      yield* indent(getDetailLogs(diffsForName));
    }
    yield* indent(getRuleLogs(rules, sourcemapReaders, options));
  }
}
