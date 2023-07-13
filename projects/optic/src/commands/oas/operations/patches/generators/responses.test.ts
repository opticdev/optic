import { it, describe, expect } from '@jest/globals';
import { responsesPatches } from './responses';
import {
  diffInteractionByOperation,
  OperationDiffResultKind,
} from '../../diffs';
import { OpenAPIV3 } from '../../../specs';
import { Operation, HttpMethods } from '../../';
import { OperationPatch } from '..';
import { CapturedBody } from '../../../../capture/sources/body';
import { CapturedInteraction } from '../../../../capture/sources/captured-interactions';

describe('responsesPatches', () => {
  it('generates a patch for an unspecified response status code', () => {
    const operation = operationFixture({
      '200': {
        description: 'success',
      },
    });

    const unspecifiedResponse = interactionFixture('400', null);

    let [diff] = [
      ...diffInteractionByOperation(unspecifiedResponse, operation),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.UnmatchedResponseStatusCode);

    let patches = [...responsesPatches(diff, operation)];
    expect(patches).toHaveLength(1);
    expect(patches).toMatchSnapshot();

    for (let patch of patches) {
      let patchedOperation = OperationPatch.applyTo(patch, operation).expect(
        'operation patch should apply to operation'
      );

      expect(patchedOperation).toMatchSnapshot();
      expect([
        ...diffInteractionByOperation(unspecifiedResponse, patchedOperation),
      ]).toHaveLength(0);
    }
  });

  it('does not generate a patch for an unspecified response status code other than 2xx, 3xx or 4xx', () => {
    const operation = operationFixture({
      '200': {
        description: 'success',
      },
    });

    const unspecifiedResponse = interactionFixture('500', null);

    let [diff] = [
      ...diffInteractionByOperation(unspecifiedResponse, operation),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.UnmatchedResponseStatusCode);

    let patches = [...responsesPatches(diff, operation)];
    expect(patches).toHaveLength(0);
  });

  it('generates a patch for an unspecified response body', () => {
    const operation = operationFixture({
      '200': {
        description: 'success',
        content: {
          'application/json': {},
        },
      },
    });

    const unspecifiedResponse = interactionFixture(
      '200',
      CapturedBody.from('test-content', 'text/plain')
    );

    let [diff] = [
      ...diffInteractionByOperation(unspecifiedResponse, operation),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.UnmatchedResponseBody);

    let patches = [...responsesPatches(diff, operation)];
    expect(patches).toHaveLength(1);
    expect(patches).toMatchSnapshot();

    for (let patch of patches) {
      let patchedOperation = OperationPatch.applyTo(patch, operation).expect(
        'operation patch should apply to operation'
      );

      expect(patchedOperation).toMatchSnapshot();
      expect([
        ...diffInteractionByOperation(unspecifiedResponse, patchedOperation),
      ]).toHaveLength(0);
    }
  });

  it('generates a patch for a missing response body', () => {
    const operation = operationFixture({
      '200': {
        description: 'success',
        content: {
          'application/json': {},
        },
      },
    });

    const emptyResponse = interactionFixture('200', null);

    let [diff] = [...diffInteractionByOperation(emptyResponse, operation)];
    expect(diff.kind).toBe(OperationDiffResultKind.MissingResponseBody);

    let patches = [...responsesPatches(diff, operation)];
    expect(patches).toHaveLength(1);
    expect(patches).toMatchSnapshot();

    for (let patch of patches) {
      let patchedOperation = OperationPatch.applyTo(patch, operation).expect(
        'operation patch should apply to operation'
      );

      expect(patchedOperation).toMatchSnapshot();
      expect([
        ...diffInteractionByOperation(emptyResponse, patchedOperation),
      ]).toHaveLength(0);
    }
  });
});

function operationFixture(
  responses: OpenAPIV3.ResponsesObject = {}
): Operation {
  return Operation.fromOperationObject('/some-path', HttpMethods.POST, {
    responses,
  });
}

function interactionFixture(
  statusCode: string,
  responseBody: CapturedBody | null
): CapturedInteraction {
  return {
    request: {
      host: 'optic.test',
      method: HttpMethods.POST,
      path: '/some-path',
      body: null,
      headers: [],
      query: [],
    },
    response: {
      statusCode,
      body: responseBody,
      headers: [],
    },
  };
}
