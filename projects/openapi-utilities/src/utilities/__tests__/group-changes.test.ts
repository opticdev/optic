import { test, expect } from '@jest/globals';
import {
  factsToChangelog,
  OpenAPITraverser,
  groupChangesAndRules,
} from '../../index';
import { openAPI as petStoreBase } from '../../examples/petstore-base';
import { openAPI as petStoreUpdated } from '../../examples/petstore-updated';

test('groupChangesAndRules diffs and groups changes between two open api files', () => {
  const baseTraverser = new OpenAPITraverser();
  baseTraverser.traverse(petStoreBase);

  const targetTraverser = new OpenAPITraverser();
  targetTraverser.traverse(petStoreUpdated);

  const baseFacts = [...baseTraverser.facts()];
  const targetFacts = [...targetTraverser.facts()];

  expect(
    groupChangesAndRules({
      toFacts: targetFacts,
      changes: factsToChangelog(baseFacts, targetFacts),
      rules: [],
    })
  ).toMatchSnapshot('pet store grouped changes');
});
