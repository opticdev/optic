import { test, expect } from '@jest/globals';
import { openAPI as petStoreBase } from '../../../../../../openapi-utilities/src/examples/petstore-base';
import { openAPI as petStoreUpdated } from '../../../../../../openapi-utilities/src/examples/petstore-updated';
import { jsonChangelog } from '../json-changelog';
import { diff, groupDiffsByEndpoint } from '@useoptic/openapi-utilities';

test('json changelog collects changes properly', () => {
  const diffs = diff(petStoreBase, petStoreUpdated);
  const specs = {
    from: petStoreBase,
    to: petStoreUpdated,
  };
  const groupedDiffs = groupDiffsByEndpoint(specs, diffs);
  const output = jsonChangelog(
    {
      from: petStoreBase,
      to: petStoreUpdated,
    },
    groupedDiffs
  );

  expect(output).toMatchSnapshot('jsonChangelog');
});
