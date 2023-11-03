import { CapturedInteraction } from '../../../sources/captured-interactions';
import { PatchImpact, SpecPatches } from './patches';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Operation } from '../../../../oas/operations';
import { OperationDiffResultKind } from './types';

export async function* generateRequestParameterPatches(
  interaction: CapturedInteraction,
  operation: Operation
): SpecPatches {
  const interactionParams = [
    ...interaction.request.query.map((q) => ({ location: 'query', ...q })),
    // To learn about new headers, uncomment the line below. The reason we don't learn headers is because there are lots of headers that would be noisy / external to the API
    // We likely would want to specify an allowlist here that lets a user specify headers that they care about that we would look out for and filter for
    // ...interaction.request.headers.map((h) => ({ location: 'header', ...h })), // Turned off
  ];
  const hasAnyParam = interactionParams.length > 0;
  const specPath = jsonPointerHelpers.compile([
    'paths',
    operation.pathPattern,
    operation.method,
  ]);
  if (hasAnyParam) {
    if (!operation.parameters) {
      yield {
        description: 'add parameters array to operation',
        impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
        diff: {
          kind: OperationDiffResultKind.MissingRequestParametersArray,
        },
        path: specPath,
        groupedOperations: [
          {
            op: 'add',
            path: jsonPointerHelpers.append(specPath, 'parameters'),
            value: [],
          },
        ],
        interaction,
      };
    }

    for (const { location, name } of interactionParams) {
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
            {
              op: 'add',
              path: jsonPointerHelpers.append(specPath, 'parameters', '-'),
              value: {
                schema: { type: 'string' }, // we assume everything is a string
                in: location,
                name,
                required: true, // we assume everything is required until we see something is not required
              },
            },
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
        description: `make ${param.name} ${param.in} parameter optional`,
        impact: [PatchImpact.BackwardsCompatible],
        diff: {
          kind: OperationDiffResultKind.MissingRequiredRequiredParameter,
          in: param.in,
          name: param.name,
        },
        path: paramPath,
        groupedOperations: [
          {
            op: 'replace',
            path: jsonPointerHelpers.append(paramPath, 'required'),
            value: false,
          },
        ],
        interaction,
      };
    }
  }
}
