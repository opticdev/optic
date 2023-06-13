import { test, expect } from '@jest/globals';
import { openAPI as petStoreBase } from '../../../examples/petstore-base';
import { openAPI as petStoreUpdated } from '../../../examples/petstore-updated';
import { jsonChangelog } from '../json-changelog';
import { groupDiffsByEndpoint } from '../../../openapi3/group-diff';
import { diff } from '../../../diff/diff';

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
