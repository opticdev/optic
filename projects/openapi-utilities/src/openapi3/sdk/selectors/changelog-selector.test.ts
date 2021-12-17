import { jsonFromFile } from '../../implementations/openapi3/openapi-traverser.test';
import {
  factsToChangelog,
  OpenApiKind,
  OpenAPITraverser,
} from '../../../index';
import { queryChangelog } from './changelog-selector';
import { OpenAPIV3 } from 'openapi-types';

async function fixture() {
  const spec1 = await jsonFromFile('./inputs/openapi3/petstore0.json')();
  const traverser1 = new OpenAPITraverser();
  const spec2 = await jsonFromFile('./inputs/openapi3/petstore1.json')();
  const traverser2 = new OpenAPITraverser();

  traverser1.traverse(spec1);
  traverser2.traverse(spec2);

  return queryChangelog(
    factsToChangelog(
      traverser1.accumulator.allFacts(),
      traverser2.accumulator.allFacts()
    )
  );
}

const fixturePromise = fixture();

describe('changelog selector', () => {
  it('filter to kind', async () => {
    const select = await fixturePromise;
    expect(select.filterKind(OpenApiKind.QueryParameter)).toMatchSnapshot();
  });
  it('find parent', async () => {
    const select = await fixturePromise;
    const query = select.filterKind(OpenApiKind.QueryParameter).changes()[0];
    expect(select.findParent(query)).toMatchSnapshot();
  });
  it('find children', async () => {
    const select = await fixturePromise;
    const query = select.filterKind(OpenApiKind.QueryParameter).changes()[0];
    const operation = select.findParent(query)!;
    expect(select.findChildren(operation)).toMatchSnapshot();
  });
  it('filter only operation', async () => {
    const select = await fixturePromise;
    expect(
      select.filterToOperation(OpenAPIV3.HttpMethods.GET, '/pet/findByStatus')
    ).toMatchSnapshot();
  });
  it('chaining multiple selectors', async () => {
    const select = await fixturePromise;
    expect(
      select.onlyAddedOrChanged().filterToQueryParameters()
    ).toMatchSnapshot();
  });
});
