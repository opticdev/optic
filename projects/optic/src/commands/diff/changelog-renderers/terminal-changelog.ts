import { OpenAPIV3 } from 'openapi-types';
import {
  ObjectDiff,
  RuleResult,
  Severity,
  getOperationsChangedLabel,
  typeofDiff,
} from '@useoptic/openapi-utilities';
import type {
  GroupedDiffs,
  Body,
  Diff,
  Endpoint,
  Response,
} from '@useoptic/openapi-utilities/build/openapi3/group-diff';
import { typeofV3Diffs } from '@useoptic/openapi-utilities/build/openapi3/group-diff';
import { Instance as Chalk } from 'chalk';
import { getLocation } from '@useoptic/openapi-utilities/build/openapi3/traverser';
import { interpretFieldLevelDiffs } from './common';
import { ParseResult } from '../../../utils/spec-loaders';

const chalk = new Chalk();

const added = chalk.green('added');
const removed = chalk.red('removed');
const changed = chalk.yellow('changed');

const INDENTATION = '  ';

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

function* indent(generator: Generator<string>) {
  for (const y of generator) {
    yield `${INDENTATION}${y}`;
  }
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
  }
): Generator<string> {
  const specName = specs.to.jsonLike.info.title || 'Unnamed spec';
  const operationsChangedLabel = getOperationsChangedLabel(groupedDiffs);
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

  const icon = options.check
    ? failedChecks.length === 0
      ? chalk.green('✔')
      : chalk.red('x')
    : '';
  yield `${icon} ${chalk.bold(specName)} ${chalk.gray(options.path)}`;
  if (options.inCi) {
    yield `${chalk.bold('Preview docs')} TODO implement me`;
  }

  yield `${chalk.bold('Operations: ')}${operationsChangedLabel}`;

  if (options.check) {
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
      'Checks: '
    )} ${passedNumberOfChecks}/${totalNumberOfChecks} ${
      label ? `(${label})` : ''
    }`;
  }

  const { endpoints, specification } = groupedDiffs;
  yield* getDetailLogs(specification.diffs, {
    label: 'specification details:',
  });

  for (const [, endpoint] of Object.entries(endpoints))
    yield* getEndpointLogs(
      { from: specs.from.jsonLike, to: specs.to.jsonLike },
      endpoint
    );
}

function* getEndpointLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  endpointChange: Endpoint
): Generator<string> {
  const {
    method,
    path,
    request,
    responses,
    cookieParameters,
    diffs,
    headerParameters,
    pathParameters,
    queryParameters,
  } = endpointChange;

  const change = typeofV3Diffs(diffs);
  yield `${chalk.bold(method.toUpperCase())} ${path}: ${
    change ? getAddedOrRemovedLabel(change) : ''
  }`;

  yield* indent(getDetailLogs(diffs));

  yield* indent(getParameterLogs(specs, 'query', queryParameters));

  yield* indent(getParameterLogs(specs, 'cookie', cookieParameters));

  yield* indent(getParameterLogs(specs, 'path', pathParameters));

  yield* indent(getParameterLogs(specs, 'header', headerParameters));

  yield* indent(getRequestChangeLogs(specs, request));

  for (const [statusCode, response] of Object.entries(responses)) {
    yield* indent(getResponseChangeLogs(specs, response, statusCode));
  }
}

function* getResponseChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  response: Response,
  statusCode: string
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
  for (const diff of response.headers.diffs) {
    yield* indent(getResponseHeaderLogs(diff));
  }

  for (const [key, contentType] of Object.entries(response.contents)) {
    yield* indent(getBodyChangeLogs(specs, contentType, key));
  }
}

function* getRequestChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  request: Endpoint['request']
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

  for (const [key, bodyChange] of Object.entries(request.contents)) {
    yield* indent(getBodyChangeLogs(specs, bodyChange, key));
  }
}

function* getBodyChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  body: Body,
  key: string
) {
  const fieldDiffs = interpretFieldLevelDiffs(specs, body.fields);
  const flatDiffs = [...fieldDiffs, ...body.examples.diffs];
  const change = typeofV3Diffs(flatDiffs);
  const label = `- body ${chalk.bold(key)}:`;

  if (change === 'removed') {
    yield `${label} ${removed}`;
    return;
  }

  yield `${label} ${change === 'added' ? added : ''}`;

  yield* indent(getDetailLogs(flatDiffs));
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
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  parameterType: 'query' | 'cookie' | 'path' | 'header',
  diffByName: Record<string, { diffs: Diff[]; rules: RuleResult[] }>
) {
  for (const [name, { diffs: diffsForName }] of Object.entries(diffByName)) {
    const change = typeofV3Diffs(diffsForName);
    yield `- ${parameterType} parameter ${chalk.italic(
      name
    )}: ${getAddedOrRemovedLabel(change)}`;

    if (change !== 'removed') {
      yield* indent(getDetailLogs(diffsForName));
    }
  }
}
