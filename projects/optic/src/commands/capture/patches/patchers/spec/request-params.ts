import { CapturedInteraction } from '../../../sources/captured-interactions';
import { PatchImpact, SpecPatches } from './patches';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Operation } from '../../../../oas/operations';
import { PatchOperationGroup } from '../../patch-operations';
import { OperationDiffResultKind } from './types';

export async function* generateRequestParameterPatches(
  interaction: CapturedInteraction,
  operation: Operation
): SpecPatches {
  const hasAnyQueryOrHeader =
    interaction.request.query.length > 0 ||
    interaction.request.headers.length > 0;
  const specPath = jsonPointerHelpers.compile([
    'paths',
    operation.pathPattern,
    operation.method,
  ]);
  if (hasAnyQueryOrHeader) {
    if (!operation.parameters) {
      yield {
        description: 'add parameters array to operation',
        impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
        diff: {
          kind: OperationDiffResultKind.MissingRequestParametersArray,
        },
        path: specPath,
        groupedOperations: [
          PatchOperationGroup.create('add parameters array', {
            op: 'add',
            path: jsonPointerHelpers.append(specPath, 'parameters'),
            value: [],
          }),
        ],
        interaction,
      };
    }

    const params = [
      ...interaction.request.query.map((q) => ({ location: 'query', ...q })),
      ...interaction.request.headers.map((h) => ({ location: 'header', ...h })),
    ];

    for (const { location, name } of params) {
      const existingParam = operation.parameters?.find(
        (p) => !('$ref' in p) && p.in === location && p.name === name
      );

      if (!existingParam) {
        yield {
          description: `add ${name} ${location} parameter`,
          impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
          diff: {
            kind: OperationDiffResultKind.UnmatchedRequestParameter,
            in: location as 'query' | 'header',
            name,
          },
          path: jsonPointerHelpers.append(specPath, 'parameters'),
          groupedOperations: [
            PatchOperationGroup.create(`add ${name} ${location} parameter`, {
              op: 'add',
              path: jsonPointerHelpers.append(specPath, 'parameters', '/-'),
              value: {
                schema: { type: 'string' }, // we assume everything is a string
                in: location,
                name,
                required: true, // we assume everything is required until we see something is not required
              },
            }),
          ],
          interaction,
        };
      }
      // In the future we can check for parameter type and or format and generate schema diffs here
    }
  }

  const operationParams = operation.parameters ?? [];
  for (let i = 0; i < operationParams.length; i++) {
    const param = operationParams[i];
    if ('$ref' in param) continue;
    if (!(param.in === 'query' || param.in === 'header')) continue;
    if (!param.required) continue;

    const paramsToLookIn =
      param.in === 'query'
        ? interaction.request.query
        : interaction.request.headers;
    if (!paramsToLookIn.find((p) => p.name !== param.name)) {
      const paramPath = jsonPointerHelpers.append(
        specPath,
        'parameters',
        String(i)
      );
      yield {
        description: `make ${param.name} ${location} parameter optional`,
        impact: [PatchImpact.BackwardsCompatible],
        diff: {
          kind: OperationDiffResultKind.MissingRequiredRequiredParameter,
          in: param.in,
          name: param.name,
        },
        path: paramPath,
        groupedOperations: [
          PatchOperationGroup.create(
            `make ${param.name} ${location} parameter optional`,
            {
              op: 'replace',
              path: jsonPointerHelpers.append(paramPath, 'required'),
              value: false,
            }
          ),
        ],
        interaction,
      };
    }
  }
}
