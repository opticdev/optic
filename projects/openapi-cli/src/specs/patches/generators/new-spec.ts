import { OperationGroup, PatchImpact, SpecPatch } from '..';
import { OpenAPIV3 } from '../../';

export function* newSpecPatches<T>(
  info: OpenAPIV3.InfoObject,
  openAPIversion: string = '3.0.3'
): IterableIterator<SpecPatch> {
  const newSpec: OpenAPIV3.Document = {
    openapi: openAPIversion,
    info,
    paths: {},
  };

  yield {
    impact: [PatchImpact.BackwardsCompatibilityUnknown],
    description: `create a new spec`,
    groupedOperations: [
      OperationGroup.create(`setup minimal viable OpenAPI spec file`, {
        op: 'add',
        path: '/',
        value: newSpec,
      }),
    ],
  };
}
