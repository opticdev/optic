import { parseAddOperations } from './document';

it('can parse from input string', () => {
  const toAdd = parseAddOperations('get /todos, post /todos/{status}/');
  expect(toAdd.unwrap()).toMatchInlineSnapshot(`
    Array [
      Object {
        "methods": Array [
          "get",
        ],
        "pathPattern": "/todos",
      },
      Object {
        "methods": Array [
          "post",
        ],
        "pathPattern": "/todos/{status}",
      },
    ]
  `);
});

it('invalid input strings empty', () => {
  const toAdd = parseAddOperations('DeTTE /todos');
  expect(toAdd.err).toBe(true);
});
