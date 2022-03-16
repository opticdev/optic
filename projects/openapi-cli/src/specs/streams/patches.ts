import { OpenAPIV3 } from '..';
import { filter, flatMap } from '../../lib/async-tools';
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
import invariant from 'ts-invariant';

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
}
