import { OpenAPIV3 } from '..';
import { filter, flatMap } from '../../lib/async-tools';
import { SpecPatch, PatchImpact, Operation, OperationGroup } from '../patches';
import {
  updatePluginPatches,
  SpecUpdatePlugin,
} from '../patches/generators/update-plugin';

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

  static async *generateByUpdatePlugin<T>(
    spec: OpenAPIV3.Document,
    plugin: SpecUpdatePlugin<T>,
    options: T
  ): SpecPatches {
    yield* updatePluginPatches(spec, plugin, options);
  }
}
