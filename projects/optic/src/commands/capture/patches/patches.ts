import { Operation as JsonOps } from 'fast-json-patch';
import { ParseResult } from '../../../utils/spec-loaders';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

import { ApiCoverageCounter } from '../coverage/api-coverage';
import { SpecPatch, SpecPatches } from './patchers/spec/patches';
import { CapturedInteractions } from '../sources/captured-interactions';
import { DocumentedInteraction, Operation } from '../../oas/operations';
import { DocumentedBodies } from './patchers/shapes/documented-bodies';
import { UndocumentedOperationType } from '../../oas/operations';
import { SchemaInventory } from './patchers/closeness/schema-inventory';
import {
  createMissingPathPatches,
  createMissingMethodPatch,
} from './patchers/spec/spec';
import { UnpatchableDiff } from './patchers/shapes/diff';

export async function* generatePathAndMethodSpecPatches(
  specHolder: {
    spec: ParseResult['jsonLike'];
  },
  endpoint: { method: string; path: string }
) {
  const hasPath = !!specHolder.spec.paths[endpoint.path];
  const hasMethod = !!specHolder.spec.paths[endpoint.path]?.[endpoint.method];
  if (!hasPath) {
    const pathParameters = endpoint.path
      .split('/')
      .filter((p) => p.startsWith('{') && p.endsWith('}'))
      .map((p) => p.slice(1, -1));
    const patch = createMissingPathPatches({
      type: UndocumentedOperationType.MissingPath,
      pathPattern: endpoint.path,
      specPath: jsonPointerHelpers.compile(['paths', endpoint.path]),
      methods: [endpoint.method as OpenAPIV3.HttpMethods],
      pathParameters,
    });
    specHolder.spec = SpecPatch.applyPatch(patch, specHolder.spec);
    yield patch;
  } else if (!hasMethod) {
    const patch = createMissingMethodPatch({
      type: UndocumentedOperationType.MissingMethod,
      pathPattern: endpoint.path,
      specPath: jsonPointerHelpers.compile([
        'paths',
        endpoint.path,
        endpoint.method,
      ]),
      method: endpoint.method as OpenAPIV3.HttpMethods,
    });
    specHolder.spec = SpecPatch.applyPatch(patch, specHolder.spec);
    yield patch;
  }
}

// Generate spec patches for an endpoint in the spec
export async function* generateEndpointSpecPatches(
  interactions: CapturedInteractions,
  specHolder: {
    spec: ParseResult['jsonLike'];
  },
  endpoint: { method: string; path: string },
  opts: {
    coverage?: ApiCoverageCounter;
    schemaAdditionsSet?: Set<string>;
  } = {}
): AsyncIterable<SpecPatch | UnpatchableDiff> {
  // TODO move this to the top level
  const openAPIVersion = checkOpenAPIVersion(specHolder.spec);
  const jsonPath = jsonPointerHelpers.compile([
    'paths',
    endpoint.path,
    endpoint.method,
  ]);
  for await (const interaction of interactions) {
    const operation = Operation.fromOperationObject(
      endpoint.path,
      endpoint.method,
      jsonPointerHelpers.get(specHolder.spec, jsonPath) as any
    );
    let documentedInteraction: DocumentedInteraction = {
      interaction,
      operation,
      specJsonPath: jsonPath,
    };

    opts.coverage?.operationInteraction(
      documentedInteraction.operation.pathPattern,
      documentedInteraction.operation.method,
      !!documentedInteraction.interaction.request.body,
      documentedInteraction.interaction.response?.statusCode
    );

    // phase one: operation patches, making sure all requests / responses are documented
    let opPatches = SpecPatches.operationAdditions(documentedInteraction);

    for await (let patch of opPatches) {
      specHolder.spec = SpecPatch.applyPatch(patch, specHolder.spec);
      yield patch;
    }

    // phase two: shape patches, describing request / response bodies in detail
    documentedInteraction = DocumentedInteraction.updateOperation(
      documentedInteraction,
      specHolder.spec
    );
    let documentedBodies = DocumentedBodies.fromDocumentedInteraction(
      documentedInteraction
    );
    let shapePatches = SpecPatches.shapeAdditions(
      documentedBodies,
      openAPIVersion
    );

    for await (let patch of shapePatches) {
      if (!('unpatchable' in patch)) {
        opts.schemaAdditionsSet?.add(patch.path);
        specHolder.spec = SpecPatch.applyPatch(patch, specHolder.spec);
        yield patch;
      }
    }
  }
}

// Creates a new ref or uses an existing ref for added paths
export async function* generateRefRefactorPatches(
  specHolder: {
    spec: ParseResult['jsonLike'];
  },
  meta: {
    schemaAdditionsSet: Set<string>;
    usedExistingRef: boolean;
  }
) {
  const schemaInventory = new SchemaInventory();
  schemaInventory.addSchemas(
    jsonPointerHelpers.compile(['components', 'schemas']),
    specHolder.spec.components?.schemas || ({} as any)
  );

  const refRefactors = schemaInventory.refsForAdditions(
    meta.schemaAdditionsSet,
    specHolder.spec,
    meta
  );

  for await (let patch of refRefactors) {
    specHolder.spec = SpecPatch.applyPatch(patch, specHolder.spec);
    yield patch;
  }
}

export async function jsonOpsFromSpecPatches(specPatches: SpecPatches) {
  const ops: JsonOps[] = [];
  for await (const patch of specPatches) {
    for (const { operations } of patch.groupedOperations) {
      ops.push(...operations);
    }
  }

  return ops;
}
