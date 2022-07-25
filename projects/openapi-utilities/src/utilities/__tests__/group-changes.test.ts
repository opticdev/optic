import { factsToChangelog, OpenAPITraverser, groupChanges } from '../../index';
import { openAPI as petStoreBase } from '../../examples/petstore-base';
import { openAPI as petStoreUpdated } from '../../examples/petstore-updated';

test('groupChanges diffs and groups changes between two open api files', () => {
  const baseTraverser = new OpenAPITraverser();
  baseTraverser.traverse(petStoreBase);

  const targetTraverser = new OpenAPITraverser();
  targetTraverser.traverse(petStoreUpdated);

  const baseFacts = [...baseTraverser.facts()];
  const targetFacts = [...targetTraverser.facts()];

  expect(
    groupChanges({
      toFacts: targetFacts,
      changes: factsToChangelog(baseFacts, targetFacts),
    })
  ).toMatchSnapshot('pet store grouped changes');
});
