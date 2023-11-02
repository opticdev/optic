import { OpenAPIV3 } from '..';
import { filter, flatMap } from '../../lib/async-tools';
import { SpecTemplate } from '../templates';

import { UndocumentedOperation } from '../../operations';
import {
  Operation,
  PatchImpact,
  SpecPatch,
  SpecPatches,
} from '../../../capture/patches/patchers/spec/patches';
import { templatePatches } from '../patches/generators/template';
import {
  newSpecPatches,
  undocumentedOperationPatches,
} from '../patches/generators';

export class LegacySpecPatches {
  static async *additions(patches: SpecPatches): SpecPatches {
    yield* filter<SpecPatch>(
      (patch) =>
        patch.impact.includes(PatchImpact.Addition) ||
        patch.impact.includes(PatchImpact.Refactor)
    )(patches);
  }

  static async *operations(patches: SpecPatches): AsyncIterable<Operation> {
    yield* flatMap<SpecPatch, Operation>(async function* (patch) {
      for (let op of patch.groupedOperations) {
        yield op;
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
