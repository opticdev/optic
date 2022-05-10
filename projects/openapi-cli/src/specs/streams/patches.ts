import { OpenAPIV3 } from '..';
import { filter, flatMap, Subject } from '../../lib/async-tools';
import JsonPatch from 'fast-json-patch';
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
import { DocumentedInteractions, OperationPatches } from '../../operations';
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
      const operationPatches =
        OperationPatches.generateRequestResponseAdditions(
          documentedInteraction
        );

      let patchedSpec = spec;
      for (let patch of operationPatches) {
        const specPatch = SpecPatch.fromOperationPatch(
          patch,
          documentedInteraction.specJsonPath
        );

        patchedSpec = SpecPatch.applyPatch(specPatch, patchedSpec);
        yield specPatch;
      }
      spec = patchedSpec;
      updatingSpec.onNext(spec);
    }

    updatingSpec.onCompleted();
  }
}
