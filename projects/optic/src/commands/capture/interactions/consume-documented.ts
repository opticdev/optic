import fs from 'node:fs/promises';
import { ParseResult } from '../../../utils/spec-loaders';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';

import { updateSpecFiles } from '../../oas/diffing/document';
import { SpecPatch, SpecPatches } from '../../oas/specs';
import { CapturedInteractions } from '../../oas/captures';
import { DocumentedInteraction, Operation } from '../../oas/operations';
import { DocumentedBodies } from '../../oas/shapes';
import { ApiCoverageCounter } from '../../oas/coverage/api-coverage';
import * as AT from '../../oas/lib/async-tools';
import chalk from 'chalk';

async function* generateSpecPatches(
  interactions: CapturedInteractions,
  spec: ParseResult['jsonLike'],
  endpoint: { method: string; path: string },
  coverage: ApiCoverageCounter
) {
  const openAPIVersion = checkOpenAPIVersion(spec);
  let patchedSpec = spec;
  const jsonPath = jsonPointerHelpers.compile([
    'paths',
    endpoint.path,
    endpoint.method,
  ]);
  const operation = Operation.fromOperationObject(
    endpoint.path,
    endpoint.method,
    jsonPointerHelpers.get(spec, jsonPath) as any
  );
  for await (const interaction of interactions) {
    let documentedInteraction: DocumentedInteraction = {
      interaction,
      operation,
      specJsonPath: jsonPath,
    };

    coverage.operationInteraction(
      documentedInteraction.operation.pathPattern,
      documentedInteraction.operation.method,
      !!documentedInteraction.interaction.request.body,
      documentedInteraction.interaction.response?.statusCode
    );

    // phase one: operation patches, making sure all requests / responses are documented
    let opPatches = SpecPatches.operationAdditions(documentedInteraction);

    for await (let patch of opPatches) {
      patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
      yield patch;
    }

    // phase two: shape patches, describing request / response bodies in detail
    documentedInteraction = DocumentedInteraction.updateOperation(
      documentedInteraction,
      patchedSpec
    );
    let documentedBodies = DocumentedBodies.fromDocumentedInteraction(
      documentedInteraction
    );

    let shapePatches = SpecPatches.shapeAdditions(
      documentedBodies,
      openAPIVersion
    );

    for await (let patch of shapePatches) {
      patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
      yield patch;
    }
  }
}

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

export async function consumeDocumentedInteractions(
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
    generateSpecPatches(interactions, parseResult.jsonLike, endpoint, coverage)
  );

  if (options.update) {
    let { results: updatedSpecFiles } = updateSpecFiles(
      specPatches,
      parseResult.sourcemap
    );

    for await (const { path, contents } of updatedSpecFiles) {
      await fs.writeFile(path, contents);
    }
  }

  return { patchSummaries };
}
