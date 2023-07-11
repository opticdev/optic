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

  // TODO handle spec patch summarization
  const specPatches = AT.tap((patch: SpecPatch) => {
    coverage.shapeDiff(patch);
    if (options.update) {
    } else {
    }
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
