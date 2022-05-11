import { OpenAPIV3 } from '..';
import { filter, flatMap, Subject } from '../../lib/async-tools';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  SpecPatch,
  PatchImpact,
  Operation,
  OperationGroup,
  newSpecPatches,
  templatePatches,
} from '../patches';
import { SpecTemplate } from '../templates';
import {
  DocumentedBodies,
  DocumentedBody,
  SchemaObject,
  ShapePatches,
} from '../../shapes';
import {
  DocumentedInteractions,
  OperationPatches,
  OperationPatch,
} from '../../operations';
import { CapturedInteractions } from '../../captures';

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

  static async *generateForNewSpec<T>(info: OpenAPIV3.InfoObject): SpecPatches {
    yield* newSpecPatches(info);
  }

  static async *fromDocumentedBodies(
    documentedBodies: DocumentedBodies
  ): SpecPatches {
    const updatedSchemasByPath: Map<string, SchemaObject> = new Map();

    for await (let documentedBody of documentedBodies) {
      let { specJsonPath, shapeLocation } = documentedBody;

      if (updatedSchemasByPath.has(specJsonPath)) {
        documentedBody.schema = updatedSchemasByPath.get(specJsonPath)!;
      }

      for (let patch of ShapePatches.generateBodyAdditions(documentedBody)) {
        documentedBody = DocumentedBody.applyShapePatch(documentedBody, patch);
        yield SpecPatch.fromShapePatch(patch, specJsonPath, shapeLocation!);
      }

      updatedSchemasByPath.set(specJsonPath, documentedBody.schema!);
    }
  }

  static async *fromInteractions(
    interactions: CapturedInteractions,
    spec: OpenAPIV3.Document
  ): SpecPatches {
    const updatingSpec = new Subject<OpenAPIV3.Document>();
    const specUpdates = updatingSpec.iterator;

    const documentedInteractions =
      DocumentedInteractions.fromCapturedInteractions(
        interactions,
        spec,
        specUpdates
      );

    for await (let documentedInteraction of documentedInteractions) {
      // phase one: operation patches
      const operationPatches =
        OperationPatches.generateRequestResponseAdditions(
          documentedInteraction
        );

      let patchedSpec = spec;

      let patchedOperation = documentedInteraction.operation;
      for (let patch of operationPatches) {
        patchedOperation = OperationPatch.applyTo(
          patch,
          patchedOperation
        ).expect('generated operation patch should apply to operation');
        const specPatch = SpecPatch.fromOperationPatch(
          patch,
          documentedInteraction.specJsonPath
        );

        patchedSpec = SpecPatch.applyPatch(specPatch, patchedSpec);
        yield specPatch;
      }

      // phase two: body patches
      documentedInteraction.operation = patchedOperation;
      const documentedBodies = DocumentedBodies.fromDocumentedInteraction(
        documentedInteraction
      );
      const bodySpectPatches =
        SpecPatches.fromDocumentedBodies(documentedBodies);

      for await (let patch of bodySpectPatches) {
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
      }

      spec = patchedSpec;
      updatingSpec.onNext(spec);
    }

    updatingSpec.onCompleted();
  }
}
