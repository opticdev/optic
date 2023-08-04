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
import { SpecPatch } from '../../oas/specs';
import { ShapeDiffResult } from '../../oas/shapes/diffs';
import { jsonPointerLogger } from '@useoptic/openapi-io';

function getShapeDiffDetails(
  diff: ShapeDiffResult,
  pathToHighlight: string,
  error: string,
  pointerLogger: ReturnType<typeof jsonPointerLogger>,
  method: string,
  pathPattern: string
): string {
  const lines = `${chalk.bgRed('  Diff  ')} ${diff.description}
operation: ${chalk.bold(`${method} ${pathPattern}`)}  
${pointerLogger.log(pathToHighlight, {
  highlightColor: 'yellow',
  observation: error,
})}\n`;
  return lines;
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
  const parts = jsonPointerHelpers.decode(path);
  const [_, pathPattern, method] = parts;
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
    // expected patterns:
    // /paths/:path/:method/requestBody
    // /paths/:path/:method/responses/:statusCode
    const location =
      parts[3] === 'requestBody'
        ? '[request body]'
        : parts[3] === 'responses' && parts[4]
        ? `[${parts[4]} response body]`
        : '';

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
      return [color(`${location} '${diff.key}' ${action}`)];
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

      const lines = [color(`${location} '${diff.key}' ${action}`)];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `[Actual] ${JSON.stringify(diff.example)}`,
            pointerLogger,
            method,
            pathPattern
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

      const lines = [color(`${location} '${diff.key}' ${action}`)];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `missing`,
            pointerLogger,
            method,
            pathPattern
          )
        );
      }
      return lines;
    }
  }

  return [];
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

  const specPatches = AT.tap((patch: SpecPatch) => {
    coverage.shapeDiff(patch);
    const summarized = summarizePatch(patch, parseResult, {
      mode: options.update ? 'update' : 'verify',
      verbose: options.verbose,
    });
    if (summarized.length) {
      patchSummaries.push(...summarized);
    } else {
      logger.debug(`skipping patch:`);
      logger.debug(patch);
    }
  })(
    generateEndpointSpecPatches(
      interactions,
      { spec: parseResult.jsonLike },
      endpoint,
      { coverage }
    )
  );

  if (options.update) {
    const operations = await jsonOpsFromSpecPatches(specPatches);
    await writePatchesToFiles(operations, parseResult.sourcemap);
  } else {
    for await (const _ of specPatches) {
    }
  }

  return { patchSummaries, hasDiffs: patchSummaries.length > 0 };
}
