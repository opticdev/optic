import { test, expect } from '@jest/globals';
import {
  factsToChangelog,
  OpenAPITraverser,
  groupChangesAndRules,
} from '../../index';
import { openAPI as petStoreBase } from '../../examples/petstore-base';
import { openAPI as petStoreUpdated } from '../../examples/petstore-updated';
import { jsonChangelog } from '../json-changelog';

test('json changelog collects changes properly', () => {
  const baseTraverser = new OpenAPITraverser();
  baseTraverser.traverse(petStoreBase);

  const targetTraverser = new OpenAPITraverser();
  targetTraverser.traverse(petStoreUpdated);

  const baseFacts = [...baseTraverser.facts()];
  const targetFacts = [...targetTraverser.facts()];

  const output = jsonChangelog(
    groupChangesAndRules({
      toFacts: targetFacts,
      changes: factsToChangelog(baseFacts, targetFacts),
      rules: [],
    })
  );

  expect(output).toMatchSnapshot('jsonChangelog');
});
