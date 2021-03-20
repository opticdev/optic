import { assign, Machine } from 'xstate';
// @ts-ignore
import * as niceTry from 'nice-try';
import { pathToRegexp } from 'path-to-regexp';
import { parseIgnore } from '@useoptic/cli-config/build/helpers/ignore-parser';

export const newSharedDiffMachine = () => {
  return Machine<
    SharedDiffStateContext,
    SharedDiffStateSchema,
    SharedDiffStateEvent
  >({
    id: 'diff-id',
    context: {
      loading: {
        count: 0,
        total: 0,
      },
      results: {
        undocumentedUrls: exampleUrls,
        displayedUndocumentedUrls: exampleUrls,
      },
      pendingEndpoints: [],
      browserAppliedIgnoreRules: [],
    },
    initial: 'ready',
    states: {
      loadingDiffs: {},
      error: {},
      ready: {
        on: {
          DOCUMENT_ENDPOINT: {
            actions: [
              assign({
                pendingEndpoints: (ctx, event) => {
                  const regex = pathToRegexp(event.pattern, [], {
                    start: true,
                    end: true,
                  });
                  return [
                    ...ctx.pendingEndpoints,
                    {
                      pathPattern: event.pattern,
                      method: event.method,
                      id: event.pendingId,
                      matchesPattern: (url: string, method: string) => {
                        const matchesPath = niceTry(() => regex.exec(url));
                        return matchesPath && method === event.method;
                      },
                    },
                  ];
                },
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
              }),
            ],
          },
          PENDING_ENDPOINT_STAGED: {
            actions: [
              assign({
                pendingEndpoints: (ctx, event) => {
                  return [...ctx.pendingEndpoints].map((i) => {
                    if (i.id === event.id) {
                      return { ...i, staged: true };
                    } else return i;
                  });
                },
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
              }),
            ],
          },
          PENDING_ENDPOINT_DISCARDED: {
            actions: [
              assign({
                pendingEndpoints: (ctx, event) => {
                  return [...ctx.pendingEndpoints].filter(
                    (i) => i.id !== event.id
                  );
                },
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
              }),
            ],
          },
          ADD_IGNORE_RULE: {
            actions: [
              assign({
                browserAppliedIgnoreRules: (ctx, event) => [
                  ...ctx.browserAppliedIgnoreRules,
                  event.rule,
                ],
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
              }),
            ],
          },
        },
      },
    },
  });
};

///service
function updateUrlResults(
  ctx: SharedDiffStateContext
): SharedDiffStateContext['results'] {
  return {
    undocumentedUrls: ctx.results.undocumentedUrls,
    displayedUndocumentedUrls: filterDisplayedUndocumentedUrls(
      ctx.results.undocumentedUrls,
      ctx.pendingEndpoints,
      ctx.browserAppliedIgnoreRules
    ),
  };
}

function filterDisplayedUndocumentedUrls(
  all: IUndocumentedUrl[],
  pending: IPendingEndpoint[],
  ignoreRules: string[]
): IUndocumentedUrl[] {
  const allIgnores = parseIgnore(ignoreRules);

  return all.map((value) => {
    if (
      pending.some((i) => i.matchesPattern(value.path, value.method)) ||
      allIgnores.shouldIgnore(value.method, value.path)
    ) {
      return { ...value, hide: true };
    } else {
      return { ...value, hide: false };
    }
  });
}

////////////////////////////////Machine Types
export interface SharedDiffStateSchema {
  states: {
    loadingDiffs: {};
    error: {};
    ready: {};
  };
}

// The events that the machine handles
export type SharedDiffStateEvent =
  | {
      type: 'DOCUMENT_ENDPOINT';
      pattern: string;
      method: string;
      pendingId: string;
    }
  | {
      type: 'ADD_IGNORE_RULE';
      rule: string;
    }
  | {
      type: 'PENDING_ENDPOINT_STAGED';
      id: string;
    }
  | {
      type: 'PENDING_ENDPOINT_DISCARDED';
      id: string;
    };

// The context (extended state) of the machine
export interface SharedDiffStateContext {
  loading: {
    count: number;
    total: number;
  };
  results: {
    undocumentedUrls: IUndocumentedUrl[];
    displayedUndocumentedUrls: IUndocumentedUrl[];
  };
  pendingEndpoints: IPendingEndpoint[];

  browserAppliedIgnoreRules: string[];
}

////////////////////////////////Diff Types

export interface IPendingEndpoint {
  pathPattern: string;
  method: string;
  id: string;
  matchesPattern: (url: string, method: string) => boolean;
  staged?: boolean;
}

export interface IUndocumentedUrl {
  path: string;
  method: string;
  count: number;
  hide?: boolean;
}

///////////////////////////////Dummy Data
const exampleUrls = [
  {
    path: '/todos/1233/status',
    method: 'GET',
    count: 5,
  },
  {
    path: '/todos/1233/edit',
    method: 'PUT',
    count: 5,
  },
  {
    path: '/todos',
    method: 'GET',
    count: 2,
  },
  {
    path: '/todos/1233/reset',
    method: 'POST',
    count: 5,
  },
];
