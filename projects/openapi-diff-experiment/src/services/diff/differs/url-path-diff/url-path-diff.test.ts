import { pathParameterNamesForPathPattern, urlPathDiffFromSpec } from './index';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import {
  OpenAPIDiffingQuestions,
  openApiDiffingQuestionsTestingStub,
} from '../../../read/types';

const gitHubOpenApiPaths = require('../../../../test/githubpaths.json');

const stub: OpenAPIDiffingQuestions = {
  ...openApiDiffingQuestionsTestingStub,
  paths(): string[] {
    return gitHubOpenApiPaths;
  },
};

const pathDiffer = urlPathDiffFromSpec(stub);

describe('url path differ', () => {
  it('will not match paths outside of set', async () => {
    const result = pathDiffer.compareToPath(
      OpenAPIV3.HttpMethods.GET,
      '/random-example'
    );
    expect(result).toMatchSnapshot();
  });

  it('can match /', async () => {
    const result = pathDiffer.compareToPath(OpenAPIV3.HttpMethods.GET, '/');
    expect(result).toMatchSnapshot();
  });

  it('will match concrete paths in set', async () => {
    const result = pathDiffer.compareToPath(
      OpenAPIV3.HttpMethods.GET,
      '/app/hook/config'
    );
    expect(result).toMatchSnapshot();
  });

  it('will match concrete paths with parameters set', async () => {
    const result = pathDiffer.compareToPath(
      OpenAPIV3.HttpMethods.GET,
      '/orgs/aidans-org/actions/runner-groups/group-5/runners/id-5'
    );
    expect(result).toMatchSnapshot();
  });
  it('will match concrete paths with parameters set 2', async () => {
    const result = pathDiffer.compareToPath(
      OpenAPIV3.HttpMethods.GET,
      '/repos/aidan-org/repo-1/pulls/15/reviews/23/dismissals'
    );
    expect(result).toMatchSnapshot();
  });

  it('will not match, but will find closest path with parameters set 2', async () => {
    const result = pathDiffer.compareToPath(
      OpenAPIV3.HttpMethods.GET,
      '/repos/aidan-org/repo-1/pulls/15/reviews/23/not-real'
    );
    expect(result).toMatchSnapshot();
  });

  /*
  known limitation -- nested ambiguous may not work properly
   */
  describe('ambiguous paths', () => {
    const stub: OpenAPIDiffingQuestions = {
      ...openApiDiffingQuestionsTestingStub,
      paths(): string[] {
        return ['/venues/top', '/venues/featured', '/venues/{venueId}'];
      },
    };

    const ambiguousPathDiffer = urlPathDiffFromSpec(stub);
    it('will match absolute path', () => {
      const result = ambiguousPathDiffer.compareToPath(
        OpenAPIV3.HttpMethods.GET,
        '/venues/top'
      );
      expect(result).toMatchSnapshot();
    });

    it('will match parameterized path', () => {
      const result = ambiguousPathDiffer.compareToPath(
        OpenAPIV3.HttpMethods.GET,
        '/venues/venue123'
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('path parameters from pattern', () => {
    it('can be extracted', () => {
      expect(
        pathParameterNamesForPathPattern('/example/{exampleId}/status/{action}')
      ).toMatchSnapshot();
    });
    it('empty if constants', () => {
      expect(
        pathParameterNamesForPathPattern('/example/list')
      ).toMatchSnapshot();
    });
  });
});
