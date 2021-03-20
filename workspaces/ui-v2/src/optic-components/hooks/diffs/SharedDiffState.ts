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

const gitHubApiUrls = [
  '/users/benkeen/orgs',
  '/users/reactjs-bot/orgs',
  '/users/reactjs-bot/repos',
  '/users/karolisdzeja/received_events',
  '/repos/facebook/react/deployments/52814129/statuses',
  '/users/reactjs-bot/followers',
  '/repos/facebook/react/deployments/52941334',
  '/repos/facebook/react/deployments/52833904',
  '/users/mlebrun/followers',
  '/users/reactjs-bot',
  '/users/facebook/received_events',
  '/repos/facebook/react',
  '/repos/facebook/react/deployments/52802744',
  '/users/willklein/subscriptions',
  '/users/folletto',
  '/users/reactjs-bot/received_events',
  '/licenses/mit',
  '/users/bvaughn/repos',
  '/users/MarkReeder',
  '/users/reactjs-bot/subscriptions',
  '/users/mmalecki/subscriptions',
  '/users/imgntn/received_events',
  '/users/benkeen/repos',
  '/users/karolisdzeja/orgs',
  '/repos/facebook/react/deployments/52809932',
  '/users/folletto/received_events',
  '/users/facebook/followers',
  '/users/bvaughn/orgs',
  '/users/nick-jonas/orgs',
  '/users/soulashell/subscriptions',
  '/users/gaearon/repos',
  '/repos/facebook/react/deployments/52893794/statuses',
  '/users/Tgemayel',
  '/repos/greysonwhite1985/react/languages',
  '/users/bangkok47/followers',
  '/repos/Tigaren/react/deployments',
  '/users/acdlite',
  '/repos/facebook/react/deployments/52911460',
  '/repos/todesstoss/react/tags',
  '/repos/pavloffcom/react/subscribers',
  '/users/greysonwhite1985/subscriptions',
  '/repos/facebook/react/deployments/50370163/statuses',
  '/users/tomkriz/received_events',
  '/repos/facebook/react/subscribers',
  '/users/douglasbeer2021/received_events',
  '/users/Dean110/orgs',
  '/users/aifreedom/followers',
  '/repos/FranciscoVon1985/react/downloads',
  '/repos/leonardlarkin1/react/forks',
  '/repos/kojad666/react/tags',
  '/repos/cuobiezi/react/subscribers',
  '/users/andreevsm/orgs',
  '/users/bvaughn/received_events',
  '/users/facebook/orgs',
  '/repos/lorenpaulsen/react/stargazers',
  '/repos/ceceliawisoky/react/deployments',
  '/repos/maryamrmz/react/subscribers',
  '/users/Crazywy1990/repos',
  '/repos/henrib81/react',
  '/users/flarnie/orgs',
  '/repos/cuobiezi/react/forks',
  '/repos/facebook/react/deployments/52829828',
  '/repos/andreevsm/react/deployments',
  '/users/jordansinger/repos',
  '/repos/Dean110/react/languages',
  '/users/nick-jonas/received_events',
  '/users/tomkriz/followers',
  '/users/FranciscoVon1985',
  '/users/folletto/subscriptions',
  '/repos/cuobiezi/react/downloads',
  '/repos/kojad666/react/subscribers',
  '/users/mlebrun',
  '/users/flarnie',
  '/repos/northy/react/events',
  '/repos/koevlu/react/contributors',
  '/repos/greysonwhite1985/react/stargazers',
  '/repos/facebook/react/deployments/52898511/statuses',
  '/users/mmalecki/received_events',
  '/repos/everetteoreilly/react/stargazers',
  '/users/FranciscoVon1985/received_events',
  '/users/imgntn/followers',
  '/users/MarkReeder/subscriptions',
  '/users/ceceliawisoky/followers',
  '/repos/facebook/react/deployments/52898627/statuses',
  '/users/lorenpaulsen/subscriptions',
  '/users/hstemplewski/subscriptions',
  '/users/willklein/followers',
  '/repos/leonardlarkin1/react/stargazers',
  '/users/jordansinger/received_events',
  '/repos/todesstoss/react/stargazers',
  '/users/dhwanilk203/received_events',
  '/users/koevlu/received_events',
  '/users/e-Koldev/orgs',
  '/repos/douglasbeer2021/react/contributors',
  '/users/ahmetb',
  '/repos/henrib81/react/tags',
  '/users/northy',
  '/users/adxc/repos',
  '/users/FranciscoVon1985/followers',
  '/users/twilson63/followers',
  '/repos/dhwanilk203/react/contributors',
  '/repos/dhwanilk203/react/deployments',
  '/repos/KenMan79/react/contributors',
  '/repos/chengtsui/react/deployments',
  '/users/mdcclv/orgs',
  '/repos/facebook/react/deployments/52898627',
  '/repos/koevlu/react/events',
  '/users/leonardlarkin1/followers',
  '/users/maryamrmz',
  '/repos/pavloffcom/react/forks',
  '/users/tomkriz',
  '/repos/ceceliawisoky/react/forks',
  '/users/folletto/followers',
  '/users/Dean110/repos',
  '/repos/KenMan79/react/events',
  '/repos/gelipundio/react/tags',
  '/users/flarnie/followers',
  '/users/danthamotheram/repos',
  '/repos/koevlu/react/tags',
  '/repos/everetteoreilly/react',
  '/repos/bangkok47/react/subscribers',
  '/users/cbmd/repos',
  '/users/gaearon',
  '/repos/facebook/componentkit',
];

const exampleUrls = gitHubApiUrls.map((url) => {
  return {
    count: 1,
    method: 'GET',
    path: url,
  };
});
