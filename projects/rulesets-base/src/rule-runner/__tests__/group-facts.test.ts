import { test, expect } from '@jest/globals';
import { groupFacts } from '../group-facts';
import {
  before as petstoreBefore,
  after as petstoreAfter,
  changes as petstoreChanges,
} from './examples/petstore';

test('groupFacts for petstore example', () => {
  expect(
    groupFacts({
      beforeFacts: petstoreBefore,
      afterFacts: petstoreAfter,
      changes: petstoreChanges,
    })
  ).toMatchSnapshot();
});
