import { it, describe, expect } from '@jest/globals';
import { requestBodyPatches } from './request-body';
import {
  diffInteractionByOperation,
  OperationDiffResultKind,
} from '../../diffs';
import { OpenAPIV3 } from '../../../specs';
import { Operation, HttpMethods } from '../../';
import { CapturedInteraction, CapturedBody } from '../../../captures';
import { OperationPatch } from '..';

describe('requestBodyPatches', () => {
  it('generates a patch for an unspecified request body', () => {
    let operationWithoutRequestBody = operationFixture(null);
    let interactionWithRequestBody = interactionFixture(
      CapturedBody.fromJSON({}, 'application/json')
    );

    let [diff] = [
      ...diffInteractionByOperation(
        interactionWithRequestBody,
        operationWithoutRequestBody
      ),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.UnmatchedRequestBody);

    let patches = [...requestBodyPatches(diff, operationWithoutRequestBody)];
    expect(patches).toHaveLength(1);
    expect(patches).toMatchSnapshot();

    for (let patch of patches) {
      let patchedOperation = OperationPatch.applyTo(
        patch,
        operationWithoutRequestBody
      ).expect('operation patch should apply to operation');

      expect(patchedOperation).toMatchSnapshot();

      expect([
        ...diffInteractionByOperation(
          interactionWithRequestBody,
          patchedOperation
        ),
      ]).toHaveLength(0);
    }
  });

  it('generates a patch for a missing request body', () => {
    const operationWithRequestBody = operationFixture({
      content: {
        'application/json': {},
      },
      required: true,
    });

    const requestWithoutBody = interactionFixture(null);

    let [diff] = [
      ...diffInteractionByOperation(
        requestWithoutBody,
        operationWithRequestBody
      ),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.MissingRequestBody);

    let patches = [...requestBodyPatches(diff, operationWithRequestBody)];
    expect(patches).toHaveLength(1);
    expect(patches).toMatchSnapshot();

    for (let patch of patches) {
      let patchedOperation = OperationPatch.applyTo(
        patch,
        operationWithRequestBody
      ).expect('operation patch should apply to operation');

      expect(patchedOperation).toMatchSnapshot();

      expect([
        ...diffInteractionByOperation(requestWithoutBody, patchedOperation),
      ]).toHaveLength(0);
    }
  });

  it('generates a patch for a unmatched request body content type', () => {
    const operationWithJsonBody = operationFixture({
      content: {
        'application/json': {},
      },
      required: true,
    });

    const csvRequest = interactionFixture(
      CapturedBody.from('item1,item2', 'text/csv')
    );

    let [diff] = [
      ...diffInteractionByOperation(csvRequest, operationWithJsonBody),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.UnmatchedRequestBody);

    let patches = [...requestBodyPatches(diff, operationWithJsonBody)];
    expect(patches).toHaveLength(1);
    expect(patches).toMatchSnapshot();

    for (let patch of patches) {
      let patchedOperation = OperationPatch.applyTo(
        patch,
        operationWithJsonBody
      ).expect('operation patch should apply to operation');

      expect(patchedOperation).toMatchSnapshot();
      expect([
        ...diffInteractionByOperation(csvRequest, patchedOperation),
      ]).toHaveLength(0);
    }
  });

  it('does not generate new patches for captured bodies with an unknown content type', () => {
    const operationWithJsonBody = operationFixture({
      content: {
        'application/json': {},
      },
      required: true,
    });

    const missingContentTypeRequest = interactionFixture(
      CapturedBody.from('test-body')
    );

    let [diff] = [
      ...diffInteractionByOperation(
        missingContentTypeRequest,
        operationWithJsonBody
      ),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.UnmatchedRequestBody);

    let patches = [...requestBodyPatches(diff, operationWithJsonBody)];
    expect(patches).toHaveLength(0);
  });

  it('does not generate new patches in the context of a non 2xx or 3xx status code', () => {
    const operationWithoutRequestBody = operationFixture(null);

    const request = interactionFixture(
      CapturedBody.fromJSON({ id: 'test' }, 'application/json')
    );

    let [diff] = [
      ...diffInteractionByOperation(request, operationWithoutRequestBody),
    ];
    expect(diff.kind).toBe(OperationDiffResultKind.UnmatchedRequestBody);

    let patches = [
      ...requestBodyPatches(diff, operationWithoutRequestBody, {
        statusCode: '101',
      }),
    ];
    expect(patches).toHaveLength(0);

    patches = [
      ...requestBodyPatches(diff, operationWithoutRequestBody, {
        statusCode: '200',
      }),
    ];
    expect(patches).toHaveLength(1);

    patches = [
      ...requestBodyPatches(diff, operationWithoutRequestBody, {
        statusCode: '302',
      }),
    ];
    expect(patches).toHaveLength(1);

    patches = [
      ...requestBodyPatches(diff, operationWithoutRequestBody, {
        statusCode: '400',
      }),
    ];
    expect(patches).toHaveLength(0);
  });
});

function operationFixture(
  requestBody: OpenAPIV3.RequestBodyObject | null
): Operation {
  return {
    requestBody: requestBody ?? undefined,
    method: HttpMethods.POST,
    pathPattern: '/some-path',
    responses: {
      '200': {
        description: 'success',
      },
    },
  };
}

function interactionFixture(
  requestBody: CapturedBody | null
): CapturedInteraction {
  return {
    request: {
      host: 'optic.test',
      method: HttpMethods.POST,
      path: '/some-path',
      body: requestBody,
    },
    response: {
      statusCode: '200',
      body: null,
    },
  };
}
