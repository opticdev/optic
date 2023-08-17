import chalk from 'chalk';
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
    const color = options.mode === 'update' ? chalk.green : chalk.red;
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
      const color = options.mode === 'update' ? chalk.green : chalk.red;
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
  diff: UnpatchableDiff,
  parseResult: ParseResult,
  options: {
    mode: 'update' | 'verify';
    verbose: boolean;
  }
): string[] {
  const pointerLogger = jsonPointerLogger(parseResult.sourcemap);

  const { path, validationError } = diff;
  const location = locationFromPath(path);
  const action =
    options.mode === 'update'
      ? `could not be automatically updated`
      : `did not match schema`;

  // TODO use AJV errors or something here
  const lines = [chalk.red(`${location} diff '${diff.bodyPath}' ${action}`)];
  if (options.verbose) {
    lines.push(
      `Failed validation with error: ${JSON.stringify(validationError)}`
    );
    lines.push(
      getShapeDiffDetails(
        'interaction did not match schema',
        path,
        ``,
        pointerLogger
      )
    );
  }
  return lines;
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
  function addPatchSummary(patchOrDiff: SpecPatch | UnpatchableDiff) {
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

  const specPatches: AsyncIterable<SpecPatch> = AT.filter(
    (patchOrDiff: SpecPatch | UnpatchableDiff) => {
      return !('unpatchable' in patchOrDiff);
    }
  )(
    AT.tap(addPatchSummary)(
      generateEndpointSpecPatches(
        interactions,
        { spec: parseResult.jsonLike },
        endpoint,
        { coverage }
      )
    )
  ) as AsyncIterable<SpecPatch>;

  if (options.update) {
    const operations = await jsonOpsFromSpecPatches(specPatches);
    await writePatchesToFiles(operations, parseResult.sourcemap);
  } else {
    for await (const _ of specPatches) {
    }
  }

  return { patchSummaries, hasDiffs: patchSummaries.length > 0 };
}
