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
      let result = OperationPatch.applyTo(patch, operationWithoutRequestBody);

      result.expect('operation patch should apply to operation');
    }
  });
});

function operationFixture(
  requestBody: OpenAPIV3.RequestBodyObject | null
): Operation {
  return {
    requestBody,
    method: HttpMethods.POST,
    pathPattern: '/some-path',
    responses: {},
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
