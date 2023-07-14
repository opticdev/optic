import { test, expect } from '@jest/globals';
import { openAPI as petStoreBase } from '../../../../../../openapi-utilities/src/examples/petstore-base';
import { openAPI as petStoreUpdated } from '../../../../../../openapi-utilities/src/examples/petstore-updated';
import { jsonChangelog } from '../json-changelog';
import { diff, groupDiffsByEndpoint } from '@useoptic/openapi-utilities';
import { loadSpec } from '../../../../utils/spec-loaders';

test('json changelog collects changes properly', () => {
  const diffs = diff(petStoreBase, petStoreUpdated);
  const specs = {
    from: petStoreBase,
    to: petStoreUpdated,
  };
  const groupedDiffs = groupDiffsByEndpoint(specs, diffs, []);
  const output = jsonChangelog(
    {
      from: petStoreBase,
      to: petStoreUpdated,
    },
    groupedDiffs
  );

  expect(output).toMatchSnapshot('jsonChangelog');
});

test('json changelog with parameter changes', async () => {
  const { jsonLike: before } = await loadSpec(
    './src/commands/diff/changelog-renderers/__tests__/fixtures/params-old.yaml',
    {} as any,
    { strict: false, denormalize: true }
  );
  const { jsonLike: after } = await loadSpec(
    './src/commands/diff/changelog-renderers/__tests__/fixtures/params-new.yaml',
    {} as any,
    { strict: false, denormalize: true }
  );

  const diffs = diff(before, after);
  const specs = {
    from: before,
    to: after,
  };
  const groupedDiffs = groupDiffsByEndpoint(specs, diffs, []);
  const output = jsonChangelog(
    {
      from: before,
      to: after,
    },
    groupedDiffs
  );

  expect(output).toMatchSnapshot('parameters');
});
