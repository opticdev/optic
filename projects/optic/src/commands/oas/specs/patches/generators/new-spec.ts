import { OpenAPIV3 } from '../../';
import {
  OperationGroup,
  PatchImpact,
  SpecPatch,
} from '../../../../capture/patches/patchers/spec/patches';

export function* newSpecPatches<T>(
  info: OpenAPIV3.InfoObject,
  openAPIversion: string = '3.0.3'
): IterableIterator<SpecPatch> {
  const newSpec: OpenAPIV3.Document = {
    openapi: openAPIversion,
    info,
    // @ts-ignore
    'x-optic-path-ignore': ['**/*.+(ico|png|jpeg|jpg|gif)'],
    paths: {},
  };

  yield {
    impact: [PatchImpact.BackwardsCompatibilityUnknown],
    description: `create a new spec`,
    path: '/',
    diff: undefined,
    groupedOperations: [
      OperationGroup.create(`setup minimal viable OpenAPI spec file`, {
        op: 'add',
        path: '',
        value: newSpec,
      }),
    ],
  };
}
