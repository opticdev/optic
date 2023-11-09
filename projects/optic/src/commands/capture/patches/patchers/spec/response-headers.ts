import { CapturedInteraction } from '../../../sources/captured-interactions';
import { PatchImpact, SpecPatches } from './patches';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Operation } from '../../../../oas/operations';

import { OperationDiffResultKind } from './types';

export async function* generateResponseHeaderPatches(
  interaction: CapturedInteraction,
  operation: Operation
): SpecPatches {
  if (!interaction.response) return;

  const responseObject = operation.responses[interaction.response.statusCode];
  // Responses may not be documented (i.e. statusCode 500) in the document request / response bodies step
  // Need to check for responseObject truthyness here
  if (!responseObject) return;
  const responsePath = jsonPointerHelpers.compile([
    'paths',
    operation.pathPattern,
    operation.method,
    'responses',
    interaction.response.statusCode,
  ]);

  // To learn about new headers, uncomment the block below. The reason we don't learn headers is because there are lots of headers that would be noisy / external to the API
  // We likely would want to specify an allowlist here that lets a user specify headers that they care about that we would look out for and filter for
  // if (interaction.response.headers.length > 0) {
  //   if (!responseObject.headers) {
  //     yield {
  //       description: 'add response headers object to operation',
  //       impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
  //       diff: {
  //         kind: OperationDiffResultKind.MissingResponseHeadersObject,
  //         statusCode: interaction.response.statusCode,
  //       },
  //       path: responsePath,
  //       groupedOperations: [
  //         {
  //           op: 'add',
  //           path: jsonPointerHelpers.append(responsePath, 'headers'),
  //           value: {},
  //         },
  //       ],
  //       interaction,
  //     };
  //   }

  //   for (const { name } of interaction.response.headers) {
  //     const maybeHeader = responseObject.headers?.[name];
  //     if (!maybeHeader) {
  //       const headerPath = jsonPointerHelpers.append(
  //         responsePath,
  //         'headers',
  //         name
  //       );
  //       yield {
  //         description: `add ${name} response header to ${interaction.response.statusCode} response`,
  //         impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
  //         diff: {
  //           kind: OperationDiffResultKind.UnmatchedResponseHeader,
  //           statusCode: interaction.response.statusCode,
  //           name,
  //         },
  //         path: headerPath,
  //         groupedOperations: [
  //           {
  //             op: 'add',
  //             path: headerPath,
  //             value: {
  //               schema: { type: 'string' }, // we assume everything is a string
  //               name,
  //               required: true, // we assume everything is required until we see something is not required
  //             },
  //           },
  //         ],
  //         interaction,
  //       };
  //     }
  //     // In the future we can check for parameter type and or format and generate schema diffs here
  //   }
  // }

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
          {
            op: 'replace',
            path: jsonPointerHelpers.append(headerPath, 'required'),
            value: false,
          },
        ],
        interaction,
      };
    }
  }
}
