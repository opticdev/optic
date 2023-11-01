import chalk from 'chalk';
import path from 'path';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { ParseResult } from '../../../utils/spec-loaders';
import {
  generateEndpointSpecPatches,
  jsonOpsFromSpecPatches,
} from '../patches/patches';

import { CapturedInteractions } from '../sources/captured-interactions';
import { ApiCoverageCounter } from '../coverage/api-coverage';
import * as AT from '../../oas/lib/async-tools';
import { writePatchesToFiles } from '../write/file';
import { logger } from '../../../logger';

import { jsonPointerLogger } from '@useoptic/openapi-io';
import { UnpatchableDiff } from '../patches/patchers/shapes/diff';
import { SpecPatch } from '../patches/patchers/spec/patches';
import { getSourcemapLink, sourcemapReader } from '@useoptic/openapi-utilities';

type GroupedUnpatchableDiff = Omit<UnpatchableDiff, 'example'> & {
  examples: any[];
};

function getShapeDiffDetails(
  description: string,
  pathToHighlight: string,
  error: string,
  pointerLogger: ReturnType<typeof jsonPointerLogger>
): string {
  const lines = `${chalk.bgRed('  Diff  ')} ${description}
${pointerLogger.log(pathToHighlight, {
  highlightColor: 'yellow',
  observation: error,
})}\n`;
  return lines;
}

function locationFromPath(path: string) {
  // expected patterns:
  // /paths/:path/:method/requestBody
  // /paths/:path/:method/responses/:statusCode
  const parts = jsonPointerHelpers.decode(path);

  const location =
    parts[3] === 'requestBody'
      ? '[request body]'
      : parts[3] === 'responses' && parts[4]
      ? `[${parts[4]} response body]`
      : '';
  return location;
}

function summarizePatch(
  patch: SpecPatch,
  parseResult: ParseResult,
  options: {
    mode: 'update' | 'verify';
    verbose: boolean;
  }
): string[] {
  const verbose = options.verbose && options.mode === 'verify';
  const { jsonLike: spec, sourcemap } = parseResult;
  const pointerLogger = jsonPointerLogger(sourcemap);
  const { diff, path, groupedOperations } = patch;
  const color = options.mode === 'update' ? chalk.green : chalk.red;
  if (!diff || groupedOperations.length === 0) return [];
  if (
    diff.kind === 'UnmatchdResponseBody' ||
    diff.kind === 'UnmatchedRequestBody' ||
    diff.kind === 'UnmatchedResponseStatusCode'
  ) {
    const location =
      diff.kind === 'UnmatchedRequestBody'
        ? '[request body]'
        : `[${diff.statusCode} response body]`;
    const action =
      options.mode === 'update' ? 'has been added' : 'is not documented';
    return [color(`${location} body ${action}`)];
  } else if (
    diff.kind === 'UnmatchedRequestParameter' ||
    diff.kind === 'UnmatchedResponseHeader'
  ) {
    const location =
      diff.kind === 'UnmatchedRequestParameter'
        ? `[${diff.in} parameter]`
        : `[${diff.statusCode} response header]`;

    const action =
      options.mode === 'update' ? 'has been added' : 'is not documented';
    return [color(`${location} body ${action}`)];
  } else if (
    diff.kind === 'MissingRequiredRequiredParameter' ||
    diff.kind === 'MissingRequiredResponseHeader'
  ) {
    const location =
      diff.kind === 'MissingRequiredRequiredParameter'
        ? `[${diff.in} parameter]`
        : `[${diff.statusCode} response header]`;
    const action =
      options.mode === 'update' ? 'is now optional' : 'is required and missing';
    return [color(`${location} body ${action}`)];
  } else {
    const location = locationFromPath(path);

    if (diff.kind === 'AdditionalProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.parentObjectPath)
        ).match
      )
        return [];

      const action =
        options.mode === 'update' ? 'has been added' : 'is not documented';
      const propertyLocation =
        options.mode === 'update'
          ? `(${diff.propertyPath})`
          : diff.parentObjectPath
          ? `(${diff.parentObjectPath})`
          : '';
      return [color(`${location} '${diff.key}' ${action} ${propertyLocation}`)];
    } else if (diff.kind === 'UnmatchedType') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return [];
      let action: string;
      if (diff.keyword === 'oneOf') {
        action =
          options.mode === 'update'
            ? 'now matches schema'
            : `does not match schema`;
      } else {
        action =
          options.mode === 'update'
            ? `is now type ${diff.expectedType}`
            : `does not match type ${diff.expectedType}. Received ${diff.example}`;
      }
      const color = options.mode === 'update' ? chalk.yellow : chalk.red;

      const lines = [
        color(`${location} '${diff.key}' ${action} (${diff.propertyPath})`),
      ];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff.description,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `[Actual] ${JSON.stringify(diff.example)}`,
            pointerLogger
          )
        );
      }
      return lines;
    } else if (diff.kind === 'MissingRequiredProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return [];

      const action =
        options.mode === 'update'
          ? `is now optional`
          : `is required and missing`;
      const color = options.mode === 'update' ? chalk.yellow : chalk.red;

      const lines = [
        color(`${location} '${diff.key}' ${action} (${diff.propertyPath})`),
      ];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff.description,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `missing`,
            pointerLogger
          )
        );
      }
      return lines;
    } else if (diff.kind === 'MissingEnumValue') {
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return [];

      const action =
        options.mode === 'update'
          ? `now has enum value '${diff.value}'`
          : `missing enum value '${diff.value}'`;
      const color = options.mode === 'update' ? chalk.yellow : chalk.red;

      const lines = [
        color(`${location} '${diff.key}' ${action} (${diff.propertyPath})`),
      ];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff.description,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `missing enum value '${diff.value}'`,
            pointerLogger
          )
        );
      }
      return lines;
    }
  }

  return [];
}

function summarizeUnpatchableDiff(
  diff: GroupedUnpatchableDiff,
  parseResult: ParseResult,
  options: {
    mode: 'update' | 'verify';
    verbose: boolean;
  }
): string[] {
  const verbose = options.verbose && options.mode === 'verify';
  const pointerLogger = jsonPointerLogger(parseResult.sourcemap);
  const reader = sourcemapReader(parseResult.sourcemap);
  const { path: jsonPath, validationError, examples } = diff;
  const location = locationFromPath(jsonPath);
  const summarizedExamples =
    examples
      .slice(0, 3)
      .map((e) => JSON.stringify(e))
      .join(', ') +
    (examples.length > 3 ? ` and ${examples.length - 3} other values` : '');

  const lines = [
    chalk.red(
      `${location} schema (${diff.schemaPath}) with keyword '${
        validationError.keyword
      }' and parameters ${JSON.stringify(
        validationError.params
      )} received invalid values ${summarizedExamples}`
    ),
  ];
  if (options.mode === 'update') {
    const sourcemap = reader.findFileAndLines(jsonPath);
    lines.push(
      chalk.red(
        ` ⛔️ schema could not be automatically updated. Update the schema manually` +
          (sourcemap ? ` at ${getSourcemapLink(sourcemap)}` : '')
      )
    );
  }
  if (verbose) {
    lines.push(
      getShapeDiffDetails(
        'interaction did not match schema',
        jsonPath,
        `[Actual] ${summarizedExamples}`,
        pointerLogger
      )
    );
  }
  return lines;
}

// Groups together diffs that are triggered from the same schema instance (we could have multiple interactions or array items that trigger a custom schema error)
// The reason we need to group these diffs and not the patches, is because once a patchable diff is hit the in-memory spec used to continue diffing never generates the second diff.
// In the case of unpatchable diffs, we get all interactions that would have caused this issue
async function groupUnpatchableDiffs(
  collectedPatches: (SpecPatch | UnpatchableDiff)[]
): Promise<AsyncIterable<SpecPatch | GroupedUnpatchableDiff>> {
  const patchesOrGroupedDiffs: (SpecPatch | GroupedUnpatchableDiff)[] = [];
  const relatedErrorToIdx = new Map<string, number>();

  for (let i = 0; i < collectedPatches.length; i++) {
    const patchOrDiff = collectedPatches[i];
    if ('unpatchable' in patchOrDiff) {
      const errorId = `${patchOrDiff.validationError.schemaPath}${patchOrDiff.validationError.keyword}`;
      const relatedIdx = relatedErrorToIdx.get(errorId);
      if (typeof relatedIdx === 'number') {
        const relatedDiff = patchesOrGroupedDiffs[relatedIdx];
        if ('unpatchable' in relatedDiff) {
          relatedDiff.examples.push(patchOrDiff.example);
        } else {
          throw new Error('Invalid index for patchesOrGroupedDiffs');
        }
      } else {
        relatedErrorToIdx.set(errorId, patchesOrGroupedDiffs.length);
        const { example, ...withoutExample } = patchOrDiff;
        patchesOrGroupedDiffs.push({
          ...withoutExample,
          examples: [example],
        });
      }
    } else {
      patchesOrGroupedDiffs.push(patchOrDiff);
    }
  }

  return (async function* () {
    for (const patchOrDiff of patchesOrGroupedDiffs) {
      yield patchOrDiff;
    }
  })();
}

export async function diffExistingEndpoint(
  interactions: CapturedInteractions,
  parseResult: ParseResult,
  coverage: ApiCoverageCounter,
  endpoint: {
    path: string;
    method: string;
  },
  options: {
    update?: 'documented' | 'interactive' | 'automatic';
    verbose: boolean;
  }
) {
  const patchSummaries: string[] = [];
  function addPatchSummary(patchOrDiff: SpecPatch | GroupedUnpatchableDiff) {
    coverage.shapeDiff(patchOrDiff);
    const summarized =
      'unpatchable' in patchOrDiff
        ? summarizeUnpatchableDiff(patchOrDiff, parseResult, {
            mode: options.update ? 'update' : 'verify',
            verbose: options.verbose,
          })
        : summarizePatch(patchOrDiff, parseResult, {
            mode: options.update ? 'update' : 'verify',
            verbose: options.verbose,
          });

    if (summarized.length) {
      if (logger.getLevel() <= 1 && patchOrDiff.interaction) {
        patchSummaries.push(
          `Originating request: ${JSON.stringify(patchOrDiff.interaction)}`
        );
      }
      patchSummaries.push(...summarized);
    }
  }
  const groupedDiffs = await groupUnpatchableDiffs(
    await AT.collect(
      generateEndpointSpecPatches(
        interactions,
        { spec: parseResult.jsonLike },
        endpoint,
        { coverage }
      )
    )
  );

  const specPatches: AsyncIterable<SpecPatch> = AT.filter(
    (patchOrDiff: SpecPatch | GroupedUnpatchableDiff) => {
      return !('unpatchable' in patchOrDiff);
    }
  )(AT.tap(addPatchSummary)(groupedDiffs)) as AsyncIterable<SpecPatch>;

  if (options.update) {
    const operations = await jsonOpsFromSpecPatches(specPatches);
    await writePatchesToFiles(operations, parseResult.sourcemap);
  } else {
    for await (const _ of specPatches) {
    }
  }

  return { patchSummaries, hasDiffs: patchSummaries.length > 0 };
}
