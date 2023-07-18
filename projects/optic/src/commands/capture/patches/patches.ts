import { Operation as JsonOps } from 'fast-json-patch';
import { ParseResult } from '../../../utils/spec-loaders';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';

import { ApiCoverageCounter } from '../coverage/api-coverage';
import { OpenAPIV3, SpecPatch, SpecPatches } from '../../oas/specs';
import { CapturedInteractions } from '../sources/captured-interactions';
import { DocumentedInteraction, Operation } from '../../oas/operations';
import { DocumentedBodies } from '../../oas/shapes';
import { createMissingMethodPatch } from '../../oas/specs/patches/generators/missing-method';
import { createMissingPathPatches } from '../../oas/specs/patches/generators/missing-path';
import { UndocumentedOperationType } from '../../oas/operations';
import { SchemaInventory } from './patchers/closeness/schema-inventory';

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
) {
  const openAPIVersion = checkOpenAPIVersion(specHolder.spec);
  const jsonPath = jsonPointerHelpers.compile([
    'paths',
    endpoint.path,
    endpoint.method,
  ]);
  const operation = Operation.fromOperationObject(
    endpoint.path,
    endpoint.method,
    jsonPointerHelpers.get(specHolder.spec, jsonPath) as any
  );
  for await (const interaction of interactions) {
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
      opts.schemaAdditionsSet?.add(patch.path);
      specHolder.spec = SpecPatch.applyPatch(patch, specHolder.spec);
      yield patch;
    }
  }
}

// Creates a new ref or uses an existing ref for added paths
export async function* generateRefRefactorPatches(
  specHolder: {
    spec: ParseResult['jsonLike'];
  },
  schemaAdditionsSet: Set<string>
) {
  const schemaInventory = new SchemaInventory();
  schemaInventory.addSchemas(
    jsonPointerHelpers.compile(['components', 'schemas']),
    specHolder.spec.components?.schemas || ({} as any)
  );

  const refRefactors = schemaInventory.refsForAdditions(
    schemaAdditionsSet,
    specHolder.spec
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
