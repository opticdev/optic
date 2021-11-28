import {
  openApiDiffingQuestionsTestingStub,
  ResponseMatchType,
} from '../../../read/types';
import { BodyLocation, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { responsesDiffer } from './index';
import { makeExample } from '../../../traffic/traffic/debug-simple';

const noResponsesFixture = responsesDiffer({
  ...openApiDiffingQuestionsTestingStub,
  responsesForOperation(
    method: OpenAPIV3.HttpMethods,
    path: string
  ): ResponseMatchType[] {
    return [];
  },
});

const someResponsesFixture = responsesDiffer({
  ...openApiDiffingQuestionsTestingStub,
  responsesForOperation(
    method: OpenAPIV3.HttpMethods,
    path: string
  ): ResponseMatchType[] {
    return [
      {
        statusCodeMatcher: '200',
        contentTypes: [],
      },
      { statusCodeMatcher: '4xx', contentTypes: [] },
      { statusCodeMatcher: 'default', contentTypes: [] },
    ];
  },
});

const exampleWithStatusCode = (statusCode: string) =>
  makeExample('/example', OpenAPIV3.HttpMethods.GET, statusCode);

const exampleMatch = {
  pathParameterValues: {},
  method: OpenAPIV3.HttpMethods.GET,
  path: '/example',
  urlPath: '/example',
};

const mockLocation = (
  statusCode: string,
  contentType: string
): BodyLocation => ({
  path: '/example',
  method: OpenAPIV3.HttpMethods.GET,
  inResponse: {
    statusCode,
    body: {
      contentType,
    },
  },
});

describe('response differ', () => {
  it('matches a known response by exact status code', () => {
    expect(
      someResponsesFixture.responseDiffsForTraffic(
        exampleWithStatusCode('200'),
        exampleMatch
      )
    ).toMatchSnapshot();
  });

  it('matches a known response by range of status code', () => {
    expect(
      someResponsesFixture.responseDiffsForTraffic(
        exampleWithStatusCode('404'),
        exampleMatch
      )
    ).toMatchSnapshot();
  });

  it('matches default response status code if not other matches', () => {
    expect(
      someResponsesFixture.responseDiffsForTraffic(
        exampleWithStatusCode('201'),
        exampleMatch
      )
    ).toMatchSnapshot();
  });

  it('diff for new status code', () => {
    expect(
      noResponsesFixture.responseDiffsForTraffic(
        exampleWithStatusCode('200'),
        exampleMatch
      )
    ).toMatchSnapshot();
  });

  it('no diff for 500 range status code', () => {
    expect(
      noResponsesFixture.responseDiffsForTraffic(
        exampleWithStatusCode('500'),
        exampleMatch
      )
    ).toMatchSnapshot();
  });

  const someResponsesWithBodiesFixture = responsesDiffer({
    ...openApiDiffingQuestionsTestingStub,
    responsesForOperation(
      method: OpenAPIV3.HttpMethods,
      path: string
    ): ResponseMatchType[] {
      return [
        {
          statusCodeMatcher: '200',
          contentTypes: [
            {
              jsonPath: '',
              contentType: 'application/json',
              schema: {
                type: 'object',
                properties: { one: { type: 'string' } },
              },
              location: mockLocation('200', 'application/json'),
            },
          ],
        },
        {
          statusCodeMatcher: '4xx',
          contentTypes: [
            {
              jsonPath: '',
              contentType: 'text/plain',
              location: mockLocation('4xx', 'text/plain'),
            },
          ],
        },
        { statusCodeMatcher: 'default', contentTypes: [] },
      ];
    },
  });

  it('json schema diffs found in responses', () => {
    const traffic = makeExample('/example', OpenAPIV3.HttpMethods.GET, '200', {
      one: 12,
      two: 'owt',
    });
    const match = someResponsesWithBodiesFixture.responseDiffsForTraffic(
      traffic,
      exampleMatch
    );

    expect(
      someResponsesWithBodiesFixture.responseContentDiffsForTraffic(
        traffic,
        match.context
      )
    ).toMatchSnapshot();
  });
});
