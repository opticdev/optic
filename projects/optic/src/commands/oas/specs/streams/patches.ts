import { OpenAPIV3 } from '..';
import { filter, flatMap } from '../../lib/async-tools';
import {
  SpecPatch,
  PatchImpact,
  Operation,
  OperationGroup,
  newSpecPatches,
  templatePatches,
  undocumentedOperationPatches,
} from '../patches';
import { SpecTemplate } from '../templates';

import {
  DocumentedInteraction,
  OperationPatches,
  UndocumentedOperation,
} from '../../operations';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import {
  DocumentedBodies,
  DocumentedBody,
} from '../../../capture/patches/patchers/shapes/documented-bodies';
import { ShapePatches } from '../../../capture/patches/patchers/shapes/patches';
import { SchemaObject } from '../../../capture/patches/patchers/shapes/schema';

export interface SpecPatches extends AsyncIterable<SpecPatch> {}

export class SpecPatches {
  static async *additions(patches: SpecPatches): SpecPatches {
    yield* filter<SpecPatch>(
      (patch) =>
        patch.impact.includes(PatchImpact.Addition) ||
        patch.impact.includes(PatchImpact.Refactor)
    )(patches);
  }

  static async *operations(patches: SpecPatches): AsyncIterable<Operation> {
    yield* flatMap<SpecPatch, Operation>(async function* (patch) {
      for (let group of patch.groupedOperations) {
        yield* OperationGroup.operations(group);
      }
    })(patches);
  }

  static async *generateByTemplate<T>(
    spec: OpenAPIV3.Document,
    template: SpecTemplate<T>,
    options: T
  ): SpecPatches {
    yield* templatePatches(spec, template, options);
  }

  static async *generateForNewSpec<T>(
    info: OpenAPIV3.InfoObject,
    openAPIVersion: string = '3.0.3'
  ): SpecPatches {
    yield* newSpecPatches(info, openAPIVersion);
  }

  static async *shapeAdditions(
    documentedBodies: DocumentedBodies,
    openAPIVersion: SupportedOpenAPIVersions
  ): SpecPatches {
    const updatedSchemasByPath: Map<string, SchemaObject> = new Map();
    for await (let documentedBody of documentedBodies) {
      let { specJsonPath, shapeLocation } = documentedBody;

      if (updatedSchemasByPath.has(specJsonPath)) {
        documentedBody.schema = updatedSchemasByPath.get(specJsonPath) ?? null;
      }

      for (let patch of ShapePatches.generateBodyAdditions(
        documentedBody,
        openAPIVersion
      )) {
        documentedBody = DocumentedBody.applyShapePatch(documentedBody, patch);
        yield SpecPatch.fromShapePatch(patch, specJsonPath, shapeLocation!);
      }

      updatedSchemasByPath.set(specJsonPath, documentedBody.schema!);
    }
  }

  static async *operationAdditions(
    documentedInteraction: DocumentedInteraction
  ) {
    const operationPatches = OperationPatches.generateRequestResponseAdditions(
      documentedInteraction
    );

    for (let patch of operationPatches) {
      const specPatch = SpecPatch.fromOperationPatch(
        patch,
        documentedInteraction.interaction,
        documentedInteraction.specJsonPath
      );

      yield specPatch;
    }
  }

  static *undocumentedOperation(undocumentedOperation: UndocumentedOperation) {
    let patches = undocumentedOperationPatches(undocumentedOperation);

    yield* patches;
  }

  static *newSpec(
    info: OpenAPIV3.InfoObject,
    openAPIversion: string = '3.0.3'
  ): IterableIterator<SpecPatch> {
    yield* newSpecPatches(info, openAPIversion);
  }
}
