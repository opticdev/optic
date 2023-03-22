import { it, expect } from '@jest/globals';
import { parseAddOperations } from './document';

it('can parse from input string', () => {
  const toAdd = parseAddOperations(['get /todos', 'post /todos/{status}/']);
  expect(toAdd.unwrap()).toMatchInlineSnapshot(`
    [
      {
        "methods": [
          "get",
        ],
        "pathPattern": "/todos",
      },
      {
        "methods": [
          "post",
        ],
        "pathPattern": "/todos/{status}",
      },
    ]
  `);
});

it('invalid input strings empty', () => {
  const toAdd = parseAddOperations(['DeTTE /todos']);
  expect(toAdd.err).toBe(true);
});
