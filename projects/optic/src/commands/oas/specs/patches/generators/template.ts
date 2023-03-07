import { PatchImpact, SpecPatch, OperationGroup } from '..';
import { OpenAPIV3 } from '../..';
import JsonPatch from 'fast-json-patch';
import { SpecTemplate } from '../..';

export interface ObservedSpecPatchGenerator<T> {
  (
    spec: OpenAPIV3.Document,
    options: T,
    context: ObservedSpecPatchGeneratorContext
  ): void;
}

export interface ObservedSpecPatchGeneratorContext {}

export function* templatePatches<T>(
  spec: OpenAPIV3.Document,
  template: SpecTemplate<T>,
  options: T
): IterableIterator<SpecPatch> {
  let observer = JsonPatch.observe<OpenAPIV3.Document>(spec);

  template.patchGenerator(spec, options, {}); // TODO: error handling

  let operations = JsonPatch.generate(observer);

  yield {
    impact: [PatchImpact.BackwardsCompatibilityUnknown],
    diff: undefined,
    path: '/',
    description: `changes made through applying '${template.name}' template`, // TODO: allow template control more specifically
    groupedOperations: [
      OperationGroup.create(
        `match changes made through applying '${template.name}' template`, // TODO: identify intent of changes
        ...operations
      ),
    ],
  };
}
