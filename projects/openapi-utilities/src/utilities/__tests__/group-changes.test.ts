import {
  factsToChangelog,
  OpenAPI3Traverser,
  groupChangesAndRules,
} from '../../index';
import { openAPI as petStoreBase } from '../../examples/petstore-base';
import { openAPI as petStoreUpdated } from '../../examples/petstore-updated';

test('groupChangesAndRules diffs and groups changes between two open api files', () => {
  const baseTraverser = new OpenAPI3Traverser();
  baseTraverser.traverse(petStoreBase);

  const targetTraverser = new OpenAPI3Traverser();
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
