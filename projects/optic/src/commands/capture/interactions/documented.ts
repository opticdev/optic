import fs from 'node:fs/promises';
import chalk from 'chalk';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { ParseResult } from '../../../utils/spec-loaders';
import { generateEndpointSpecPatches } from '../patches/patches';

import { updateSpecFiles } from '../../oas/diffing/document';
import { SpecPatch } from '../../oas/specs';
import { CapturedInteractions } from '../sources/captured-interactions';
import { ApiCoverageCounter } from '../coverage/api-coverage';
import * as AT from '../../oas/lib/async-tools';

function summarizePatch(
  patch: SpecPatch,
  spec: ParseResult['jsonLike'],
  mode: 'update' | 'verify'
): string | null {
  const { diff, path, groupedOperations } = patch;
  const parts = jsonPointerHelpers.decode(path);
  if (!diff || groupedOperations.length === 0) return null;
  if (
    diff.kind === 'UnmatchdResponseBody' ||
    diff.kind === 'UnmatchedRequestBody' ||
    diff.kind === 'UnmatchedResponseStatusCode'
  ) {
    const location =
      diff.kind === 'UnmatchedRequestBody'
        ? '[request body]'
        : `[${diff.statusCode} response body]`;
    const action = mode === 'update' ? 'has been added' : 'is not documented';
    const color = mode === 'update' ? chalk.green : chalk.red;
    return color(`${location} body ${action}`);
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
        return null;

      const action = mode === 'update' ? 'has been added' : 'is not documented';
      const color = mode === 'update' ? chalk.green : chalk.red;
      return color(`${location} '${diff.key}' ${action}`);
    } else if (diff.kind === 'UnmatchedType') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return null;
      let action: string;
      if (diff.keyword === 'oneOf') {
        action =
          mode === 'update' ? 'now matches schema' : `does not match schema`;
      } else {
        action =
          mode === 'update'
            ? `is now type ${diff.expectedType}`
            : `does not match type ${diff.expectedType}}. Received ${diff.example}`;
      }
      const color = mode === 'update' ? chalk.yellow : chalk.red;

      return color(`${location} '${diff.key}' ${action}`);
    } else if (diff.kind === 'MissingRequiredProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return null;

      const action =
        mode === 'update' ? `is now optional` : `is required and missing`;
      const color = mode === 'update' ? chalk.yellow : chalk.red;

      return color(`${location} '${diff.key}' ${action}`);
    }
  }

  return null;
}

export async function updateExistingEndpoint(
  interactions: CapturedInteractions,
  parseResult: ParseResult,
  coverage: ApiCoverageCounter,
  endpoint: {
    path: string;
    method: string;
  },
  options: {
    update: boolean;
  }
) {
  const patchSummaries: string[] = [];

  const specPatches = AT.tap((patch: SpecPatch) => {
    coverage.shapeDiff(patch);
    const summarized = summarizePatch(
      patch,
      parseResult.jsonLike,
      options.update ? 'update' : 'verify'
    );
    if (summarized) patchSummaries.push(summarized);
  })(
    generateEndpointSpecPatches(
      interactions,
      { spec: parseResult.jsonLike },
      endpoint,
      { coverage }
    )
  );
  let hasDiffs = false;

  if (options.update) {
    let { results: updatedSpecFiles } = updateSpecFiles(
      specPatches,
      parseResult.sourcemap
    );

    for await (const { path, contents } of updatedSpecFiles) {
      await fs.writeFile(path, contents);
    }
  } else {
    for await (const _ of specPatches) {
      hasDiffs = true;
    }
  }

  return { patchSummaries, hasDiffs };
}
