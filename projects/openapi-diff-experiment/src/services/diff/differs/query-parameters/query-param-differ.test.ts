import { ApiTraffic } from '../../../traffic/types';
import { OpenAPIV3 } from 'openapi-types';
import { openApiQueries } from '../../../read/queries';
import { queryParametersDiffer } from './index';
import HttpMethods = OpenAPIV3.HttpMethods;

const makeRequestWithQueryString = (query: string) => {
  const traffic: ApiTraffic = {
    path: '/example',
    method: OpenAPIV3.HttpMethods.GET,
    queryString: query,
    response: {
      statusCode: '200',
      body: {},
    },
  };
  return traffic;
};

const emptySpecWithAParameterAlreadyDefined: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: { title: 'empty', version: '0.0.0' },
  paths: {
    '/example': {
      get: {
        parameters: [
          {
            in: 'query',
            name: 'param1',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            in: 'query',
            name: 'param2',
            required: true,
          },
        ],
        responses: {},
      },
    },
  },
};

const operationMatch = {
  path: '/example',
  urlPath: '/example',
  method: OpenAPIV3.HttpMethods.GET,
  pathParameterValues: {},
};

describe('query parameters differ', () => {
  const specQueries = openApiQueries(emptySpecWithAParameterAlreadyDefined);
  const differ = queryParametersDiffer(specQueries);

  it('returns a diff for new query parameters', () => {
    const request = makeRequestWithQueryString('search=Hello');
    expect(differ.queryParamDiffs(request, operationMatch)).toMatchSnapshot();
  });

  it('[known limitation] returns no diff for missing required', () => {
    const request = makeRequestWithQueryString('');
    expect(differ.queryParamDiffs(request, operationMatch)).toMatchSnapshot();
  });

  it('[known limitation] returns no diff when documented params are sent with incorrect type', () => {
    const request = makeRequestWithQueryString('param1=12');
    expect(differ.queryParamDiffs(request, operationMatch)).toMatchSnapshot();
  });
});
