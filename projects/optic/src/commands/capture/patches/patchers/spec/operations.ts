import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  DocumentedInteraction,
  findBody,
  findResponse,
} from '../../../../oas/operations';
import { PatchImpact } from './patches';
import { OperationDiffResult, OperationDiffResultKind } from './types';
import { PatchOperation } from '../../patch-operations';

export interface OperationPatch {
  description: string;
  impact: PatchImpact[];
  diff: OperationDiffResult | undefined;
  groupedOperations: PatchOperation[];
}
export interface OperationPatches extends Iterable<OperationPatch> {}

export function* generateOperationPatches(
  documentedInteraction: DocumentedInteraction
): OperationPatches {
  yield* generateRequestPatches(documentedInteraction);
  yield* generateResponsePatches(documentedInteraction);
}

function* generateRequestPatches(
  documentedInteraction: DocumentedInteraction
): OperationPatches {
  const { operation, interaction } = documentedInteraction;

  // Handle requests
  if (!interaction.request.body && operation.requestBody?.required) {
    yield {
      description: 'make request body optional',
      impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
      diff: {
        kind: OperationDiffResultKind.MissingRequestBody,
      },
      groupedOperations: [
        {
          op: 'replace',
          path: jsonPointerHelpers.compile(['requestBody', 'required']),
          value: false,
        },
      ],
    };
  } else if (
    !operation.requestBody &&
    interaction.request.body &&
    interaction.request.body.contentType
  ) {
    const contentType = interaction.request.body.contentType;

    yield {
      description: `add '${contentType}' body as a valid request body type`,
      impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
      diff: {
        kind: OperationDiffResultKind.UnmatchedRequestBody,
        contentType: contentType,
      },
      groupedOperations: [
        {
          op: 'add',
          path: jsonPointerHelpers.compile(['requestBody']),
          value: {
            content: {},
          },
        },
        {
          op: 'add',
          path: jsonPointerHelpers.compile([
            'requestBody',
            'content',
            contentType,
          ]),
          value: {
            schema: {},
          },
        },
      ],
    };
  } else if (
    operation.requestBody &&
    interaction.request.body &&
    interaction.request.body.contentType
  ) {
    const matchedRequestBody = findBody(
      operation.requestBody,
      interaction.request.body.contentType
    );

    if (!matchedRequestBody) {
      const contentType = interaction.request.body.contentType;
      let groupedOperations: PatchOperation[] = [];
      if (!operation.requestBody.content) {
        groupedOperations.push({
          op: 'add',
          path: jsonPointerHelpers.compile(['requestBody', 'content']),
          value: {},
        });
      }
      groupedOperations.push({
        op: 'add',
        path: jsonPointerHelpers.compile([
          'requestBody',
          'content',
          contentType,
        ]),
        value: {
          schema: {},
        },
      });

      yield {
        description: `add '${contentType}' body as a valid request body type`,
        impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
        diff: {
          kind: OperationDiffResultKind.UnmatchedRequestBody,
          contentType: contentType,
        },
        groupedOperations,
      };
    }
  }
}

function* generateResponsePatches(
  documentedInteraction: DocumentedInteraction
): OperationPatches {
  const { operation, interaction } = documentedInteraction;

  if (!interaction.response) return;
  const statusCode = interaction.response.statusCode;

  const responseMatch = findResponse(operation, statusCode);
  if (!responseMatch) {
    const contentType = interaction.response.body?.contentType;
    const numericalStatusCode = parseInt(statusCode, 10);
    if (
      !isNaN(numericalStatusCode) &&
      (numericalStatusCode < 200 ||
        numericalStatusCode >= 500 ||
        (numericalStatusCode >= 300 && numericalStatusCode < 400))
    ) {
      return; // only document 2xx and 4xx
    }
    const groupedOperations: PatchOperation[] = [
      {
        op: 'add',
        path: jsonPointerHelpers.compile(['responses', statusCode]),
        value: {
          description: `${statusCode} response`,
        },
      },
    ];
    if (contentType) {
      groupedOperations.push({
        op: 'add',
        path: jsonPointerHelpers.compile(['responses', statusCode, 'content']),
        value: {
          [contentType]: {},
        },
      });
    }

    yield {
      description: `add ${statusCode} response`,
      impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
      diff: {
        kind: OperationDiffResultKind.UnmatchedResponseStatusCode,
        statusCode: interaction.response.statusCode,
        contentType: contentType || null,
      },
      groupedOperations,
    };

    return; // no response, no more to diff
  }
  const [response] = responseMatch;
  const contentType = interaction.response.body?.contentType;
  const matchedBody = findBody(
    response,
    interaction.response.body?.contentType
  );

  if (!matchedBody && interaction.response.body && contentType) {
    const groupedOperations: PatchOperation[] = [];

    if (!response.content) {
      groupedOperations.push({
        op: 'add',
        path: jsonPointerHelpers.compile(['responses', statusCode, 'content']),
        value: {},
      });
    }
    groupedOperations.push({
      op: 'add',
      path: jsonPointerHelpers.compile([
        'responses',
        statusCode,
        'content',
        contentType,
      ]),
      value: {},
    });

    yield {
      description: `add ${contentType} response for ${statusCode}`,
      impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
      diff: {
        kind: OperationDiffResultKind.UnmatchedResponseBody,
        contentType: contentType,
        statusCode: statusCode,
      },
      groupedOperations,
    };
  } else if (response.content && !interaction.response.body) {
    const contentSize = [...Object.keys(response.content || {})].length;

    yield {
      description: `remove response content for ${statusCode}`,
      impact: [
        contentSize > 0
          ? PatchImpact.BackwardsIncompatible
          : PatchImpact.BackwardsCompatible,
      ],
      diff: {
        kind: OperationDiffResultKind.MissingResponseBody,
        statusCode: statusCode,
      },
      groupedOperations: [
        {
          op: 'remove',
          path: jsonPointerHelpers.compile([
            'responses',
            statusCode,
            'content',
          ]),
        },
      ],
    };
  }
}
