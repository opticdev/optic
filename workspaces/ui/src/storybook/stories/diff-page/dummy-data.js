function dummyEndpoint(method, fullPath, name, stats, requests, responses) {
  const hasCoverage =
    requests.some((i) => i.hasCoverage) || responses.some((i) => i.hasCoverage);
  const hasDiff =
    requests.some((i) => i.hasDiff) || responses.some((i) => i.hasDiff);

  return {
    method,
    hasCoverage,
    name,
    id: method + fullPath,
    stats,
    hasDiff,
    fullPath,
    requests,
    responses,
  };
}

function dummyStatus({ handled, added, changed, removed }) {
  return { handled, added, changed, removed };
}

export const dummyData = [
  dummyEndpoint(
    'GET',
    '/todos/:todoId',
    'Get todo by ID',
    { handled: false, added: 0, changed: 0 },
    [],
    [coverageDot({ hasCoverage: true }), coverageDot({})]
  ),
  dummyEndpoint(
    'PATCH',
    '/todos/:todoId',
    'Update a todo by ID',
    { handled: false, added: 0, changed: 0 },
    [coverageDot({ hasCoverage: true })],
    [coverageDot({ hasCoverage: true }), coverageDot({})]
  ),
  dummyEndpoint(
    'GET',
    '/todos',
    'Get all todos for this user',
    { handled: false, added: 0, changed: 0 },
    [],
    [coverageDot({ hasCoverage: true }), coverageDot({})]
  ),
  dummyEndpoint(
    'POST',
    '/todos',
    'Add a new todo',
    { handled: false, added: 4, changed: 12 },
    [{ hasCoverage: true }],
    [
      coverageDot({ hasCoverage: true }),
      coverageDot({ hasDiff: true }),
      coverageDot({ hasCoverage: true }),
    ]
  ),
  dummyEndpoint(
    'POST',
    '/todos/:todoId',
    'Assign a todo to a user',
    { handled: false, added: 4, changed: 12 },
    [{ hasCoverage: true }],
    [
      coverageDot({ hasCoverage: true }),
      coverageDot({ hasDiff: true }),
      coverageDot({ hasCoverage: true }),
    ]
  ),
  dummyEndpoint(
    'GET',
    '/todos/:todoId/status',
    'Get the status of a todo',
    { handled: false, added: 1, removed: 1 },
    [{ hasCoverage: true }],
    [
      coverageDot({ hasCoverage: true }),
      coverageDot({ hasDiff: true }),
      coverageDot({ hasCoverage: true }),
    ]
  ),
  dummyEndpoint(
    'POST',
    '/lists',
    'Create a new list',
    { handled: true, added: 2, removed: 5 },
    [{ hasCoverage: true }],
    [
      coverageDot({ hasCoverage: true }),
      coverageDot({ hasDiff: true }),
      coverageDot({ hasCoverage: true }),
    ]
  ),
  dummyEndpoint(
    'GET',
    '/lists/:listId/unfinished',
    'Get all unfinished items on a list',
    { handled: false },
    [],
    [coverageDot({ hasCoverage: true }), coverageDot({ hasCoverage: false })]
  ),
  dummyEndpoint(
    'GET',
    '/lists/:listId/completed',
    'Get all completed items on a list',
    { handled: false },
    [],
    [coverageDot({ hasCoverage: false }), coverageDot({ hasCoverage: false })]
  ),
];

export function coverageDot({ hasDiff, hasCoverage }) {
  return { hasDiff, hasCoverage };
}
