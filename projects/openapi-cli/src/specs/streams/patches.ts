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
  DocumentedBodies,
  DocumentedBody,
  SchemaObject,
  ShapePatches,
} from '../../shapes';
import {
  DocumentedInteraction,
  OperationPatches,
  UndocumentedOperation,
} from '../../operations';
import { SchemaInventory } from '../../shapes/closeness/schema-inventory';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export interface SpecPatches extends AsyncIterable<SpecPatch> {}

export class SpecPatches {
  static async *additions(patches: SpecPatches): SpecPatches {
    yield* filter<SpecPatch>((patch) =>
      patch.impact.includes(PatchImpact.Addition)
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
    openAPIversion: string = '3.0.3'
  ): SpecPatches {
    yield* newSpecPatches(info, openAPIversion);
  }

  static async *shapeAdditions(
    spec: OpenAPIV3.Document,
    documentedBodies: DocumentedBodies
  ): SpecPatches {
    const updatedSchemasByPath: Map<string, SchemaObject> = new Map();

    for await (let documentedBody of documentedBodies) {
      let { specJsonPath, shapeLocation } = documentedBody;

      if (updatedSchemasByPath.has(specJsonPath)) {
        documentedBody.schema = updatedSchemasByPath.get(specJsonPath)!;
      }

      const inventory = new SchemaInventory();
      // only inventory the existing component schemas.
      // you could potentially use sourcemap ones or broaden to other data
      inventory.addSchemas(
        jsonPointerHelpers.compile(['components', 'schemas']),
        (spec.components?.schemas || {}) as any
      );

      for (let patch of ShapePatches.generateBodyAdditions(documentedBody)) {
        documentedBody = DocumentedBody.applyShapePatch(documentedBody, patch);

        const matchingRef = documentedBody.schema
          ? inventory.findClosest(documentedBody.schema as any)
          : null;

        if (matchingRef) {
          // override this with a $ref pointer
          yield SpecPatch.fromShapePatch(patch, specJsonPath, shapeLocation!);
        } else {
          yield SpecPatch.fromShapePatch(patch, specJsonPath, shapeLocation!);
        }
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
