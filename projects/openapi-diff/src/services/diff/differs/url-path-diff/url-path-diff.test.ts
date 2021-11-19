import { pathParameterNamesForPathPattern, urlPathDiffFromSpec } from './index';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import {
  OpenAPIDiffingQuestions,
  openApiDiffingQuestionsTestingStub,
} from '../../../read/types';

const gitHubOpenApiPaths = require('../../../../test-data/githubpaths.json');

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
