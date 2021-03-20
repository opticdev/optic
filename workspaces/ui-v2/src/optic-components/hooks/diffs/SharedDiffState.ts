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
    }
  | {
      type: 'ADD_IGNORE_RULE';
      rule: string;
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
  matchesPattern: (url: string, method: string) => boolean;
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
  {
    path:
      '/todos/553/reset/becoming/123e839745387893247183297492381/xyz/infinity/squred/by2',
    method: 'POST',
    count: 5,
  },
  {
    path: '/todos/789/status',
    method: 'GET',
    count: 5,
  },
];
