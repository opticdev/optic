import { CapturedInteraction } from '../../../sources/captured-interactions';
import { PatchImpact, SpecPatches } from './patches';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Operation } from '../../../../oas/operations';
import { PatchOperationGroup } from '../../patch-operations';
import { OperationDiffResultKind } from './types';

export async function* generateResponseHeaderPatches(
  interaction: CapturedInteraction,
  operation: Operation
): SpecPatches {
  if (!interaction.response) return;

  const responseObject = operation.responses[interaction.response.statusCode];
  const responsePath = jsonPointerHelpers.compile([
    'paths',
    operation.pathPattern,
    operation.method,
    'responses',
    interaction.response.statusCode,
  ]);

  if (interaction.response.headers.length > 0) {
    if (!responseObject.headers) {
      yield {
        description: 'add response headers object to operation',
        impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
        diff: {
          kind: OperationDiffResultKind.MissingResponseHeadersObject,
          statusCode: interaction.response.statusCode,
        },
        path: responsePath,
        groupedOperations: [
          PatchOperationGroup.create('add parameters array', {
            op: 'add',
            path: jsonPointerHelpers.append(responsePath, 'headers'),
            value: {},
          }),
        ],
        interaction,
      };
    }

    for (const { name } of interaction.response.headers) {
      const maybeHeader = responseObject.headers?.[name];
      if (!maybeHeader) {
        const headerPath = jsonPointerHelpers.append(
          responsePath,
          'headers',
          name
        );
        yield {
          description: `add ${name} response header to ${interaction.response.statusCode} response`,
          impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
          diff: {
            kind: OperationDiffResultKind.UnmatchedResponseHeader,
            statusCode: interaction.response.statusCode,
            name,
          },
          path: headerPath,
          groupedOperations: [
            PatchOperationGroup.create(
              `add ${name} response header to ${interaction.response.statusCode} response`,
              {
                op: 'add',
                path: headerPath,
                value: {
                  schema: { type: 'string' }, // we assume everything is a string
                  name,
                  required: true, // we assume everything is required until we see something is not required
                },
              }
            ),
          ],
          interaction,
        };
      }
      // In the future we can check for parameter type and or format and generate schema diffs here
    }
  }

  for (const [key, value] of Object.entries(responseObject.headers ?? {})) {
    if ('$ref' in value) continue;
    if (!value.required) continue;

    if (!interaction.response.headers.find((h) => h.name === key)) {
      const headerPath = jsonPointerHelpers.append(
        responsePath,
        'headers',
        key
      );
      yield {
        description: `make ${key} response header in ${interaction.response.statusCode} response optional`,
        impact: [PatchImpact.BackwardsCompatible],
        diff: {
          kind: OperationDiffResultKind.MissingRequiredResponseHeader,
          statusCode: interaction.response.statusCode,
          name: key,
        },
        path: headerPath,
        groupedOperations: [
          PatchOperationGroup.create(
            `make ${key} response header in ${interaction.response.statusCode} response optional`,
            {
              op: 'replace',
              path: jsonPointerHelpers.append(headerPath, 'required'),
              value: false,
            }
          ),
        ],
        interaction,
      };
    }
  }
}
