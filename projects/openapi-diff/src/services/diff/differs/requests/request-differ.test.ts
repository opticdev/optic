import {
  openApiDiffingQuestionsTestingStub,
  RequestBodyMatchType,
  ResponseMatchType,
} from '../../../read/types';
import { BodyLocation, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { makeExample } from '../../../traffic/traffic/debug-simple';
import { requestsDiffer } from './index';
import { DebugTraffic } from '../../../../test/scenarios/traffic';

const noResponsesFixture = requestsDiffer({
  ...openApiDiffingQuestionsTestingStub,
  requestBodiesForOperation(
    method: OpenAPIV3.HttpMethods,
    path: string
  ): RequestBodyMatchType[] {
    return [];
  },
});

const aJsonRequestFixture = requestsDiffer({
  ...openApiDiffingQuestionsTestingStub,
  requestBodiesForOperation(
    method: OpenAPIV3.HttpMethods,
    path: string
  ): RequestBodyMatchType[] {
    return [
      {
        contentType: 'application/json',
        schema: { type: 'object', properties: { hello: { type: 'string' } } },
        location: mockLocation('application/json'),
        jsonPath: '',
      },
    ];
  },
});

const exampleMatch = {
  pathParameterValues: {},
  method: OpenAPIV3.HttpMethods.POST,
  path: '/example',
  urlPath: '/example',
};

const mockLocation = (contentType: string): BodyLocation => ({
  path: '/example',
  method: OpenAPIV3.HttpMethods.POST,
  inRequest: {
    body: {
      contentType,
    },
  },
});

describe('requests differ', () => {
  it('matches a known request content type', () => {
    const result = aJsonRequestFixture.requestContentDiffsForTraffic(
      DebugTraffic(OpenAPIV3.HttpMethods.POST, '/example').withJsonRequest({
        hello: 'world',
      }),
      exampleMatch
    );

    expect(result).toMatchSnapshot();
  });

  // @todo this is known incorrect behavior. We don't enforce required yet
  it('does not enforce required yet', () => {
    const result = aJsonRequestFixture.requestContentDiffsForTraffic(
      DebugTraffic(OpenAPIV3.HttpMethods.POST, '/example'),
      exampleMatch
    );

    expect(result).toMatchSnapshot();
  });

  // @todo this is known incorrect behavior. We don't add/update non-json bodies yet
  it('will not emit a diff for a new kind of body that is not json', () => {
    const result = aJsonRequestFixture.requestContentDiffsForTraffic(
      DebugTraffic(OpenAPIV3.HttpMethods.POST, '/example').withTextRequest(),
      exampleMatch
    );

    expect(result).toMatchSnapshot();
  });

  it('will emit shape diffs in matched requestBody', () => {
    const result = aJsonRequestFixture.requestContentDiffsForTraffic(
      DebugTraffic(OpenAPIV3.HttpMethods.POST, '/example').withJsonRequest({
        hello: 'world',
        newField: 123,
      }),
      exampleMatch
    );

    expect(result).toMatchSnapshot();
  });
});
