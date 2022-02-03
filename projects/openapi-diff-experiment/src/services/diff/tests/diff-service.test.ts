import { PassThroughSpecReader } from '../../read/debug-implementations';
import { createDiffServiceWithCachingProjections } from '../diff-service';
import { makeExample } from '../../traffic/traffic/debug-simple';
import { IDiffService } from '../types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { specWithPaths } from './spec-with-paths';

describe('diff service', () => {
  describe('path matching', () => {
    it('emits unmatched path diff', async () => {
      const diffService = await diffServiceFixture;
      const result = await diffService.compare(
        makeExample('/other-resource/123', OpenAPIV3.HttpMethods.GET)
      );
      expect(result.diffs).toHaveLength(1);
      expect(result).toMatchSnapshot();
    });

    it('emit a path diff for a partial match', async () => {
      const diffService = await diffServiceFixture;
      const result = await diffService.compare(
        makeExample(
          '/users/{username}/packages-not-right',
          OpenAPIV3.HttpMethods.GET
        )
      );
      expect(result.diffs).toHaveLength(1);
      expect(result).toMatchSnapshot();
    });
  });

  describe.skip('responses', () => {
    it('diff for unmatched responses', async () => {
      const diffService = await diffServiceExampleSpecFixture;

      const results = await diffService.compare(
        makeExample('/examples', 'get', '200', { items: ['world'], count: 1 })
      );

      expect(results.diffs).toHaveLength(1);
    });
  });
});

const diffServiceFixture: Promise<IDiffService> = new Promise(
  async (resolve) => {
    const gitHubOpenApiPaths = require('../../../test/githubpaths-subset.json');
    const gitHubPathsSpecReader = new PassThroughSpecReader(
      specWithPaths(gitHubOpenApiPaths)
    );

    const diffService = createDiffServiceWithCachingProjections(
      await gitHubPathsSpecReader.questions()
    );

    resolve(diffService);
  }
);
const diffServiceExampleSpecFixture: Promise<IDiffService> = new Promise(
  async (resolve) => {
    const simpleExample = require('../../../test/simple-example-with-200.json');
    const gitHubPathsSpecReader = new PassThroughSpecReader(simpleExample);

    const diffService = createDiffServiceWithCachingProjections(
      await gitHubPathsSpecReader.questions()
    );

    resolve(diffService);
  }
);
