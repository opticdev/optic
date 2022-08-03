import { ApiTraffic } from '../../../traffic/types';
import { OpenAPIV3 } from 'openapi-types';
import { newAddAllQueryParameters } from './new-query-parameters';
import { jsonPatcher } from '../../../patch/incremental-json-patch/json-patcher';

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

const emptySpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: { title: 'empty', version: '0.0.0' },
  paths: {
    '/example': {
      get: {
        responses: {},
      },
    },
  },
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
            name: 'pre-existing',
            required: true,
          },
        ],
        responses: {},
      },
    },
  },
};

describe('query parameters', () => {
  describe('init', () => {
    it('can document all query parameters for traffic', () => {
      const patch = jsonPatcher(emptySpec);
      const request = makeRequestWithQueryString('search=Hello&limit=30');
      newAddAllQueryParameters(
        patch,
        OpenAPIV3.HttpMethods.GET,
        '/example',
        request
      );

      expect(patch.currentDocument()).toMatchSnapshot();
    });

    it('can document all query parameters for traffic when 1 query param already in spec', () => {
      const patch = jsonPatcher(emptySpecWithAParameterAlreadyDefined);
      const request = makeRequestWithQueryString('search=Hello&limit=30');
      newAddAllQueryParameters(
        patch,
        OpenAPIV3.HttpMethods.GET,
        '/example',
        request
      );

      expect(patch.currentDocument()).toMatchSnapshot();
    });

    it('empty query string will document empty', () => {
      const patch = jsonPatcher(emptySpec);
      const request = makeRequestWithQueryString('');
      newAddAllQueryParameters(
        patch,
        OpenAPIV3.HttpMethods.GET,
        '/example',
        request
      );

      expect(patch.currentDocument()).toMatchSnapshot();
    });
  });
});
