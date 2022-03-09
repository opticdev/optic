import { PatchImpact, SpecPatch, OperationGroup } from '..';
import { OpenAPIV3 } from '../..';
import JsonPatch from 'fast-json-patch';

export interface SpecUpdatePlugin<T> {
  (
    spec: OpenAPIV3.Document,
    options: T,
    context: SpecUpdatePluginContext
  ): void;
}

export interface SpecUpdatePluginContext {}

export function* updatePluginPatches<T>(
  spec: OpenAPIV3.Document,
  plugin: SpecUpdatePlugin<T>,
  options: T
): IterableIterator<SpecPatch> {
  let observer = JsonPatch.observe<OpenAPIV3.Document>(spec);

  plugin(spec, options, {}); // TODO: error handling

  let operations = JsonPatch.generate(observer);

  yield {
    impact: [PatchImpact.BackwardsCompatibilityUnknown],
    description: 'changes made by plugin', // TODO: identify plugin
    groupedOperations: [
      OperationGroup.create(
        'update spec from plugin', // TODO: identify intent of changes
        ...operations
      ),
    ],
  };
}
