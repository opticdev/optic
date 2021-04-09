import { assign, Machine } from 'xstate';
// @ts-ignore
import * as niceTry from 'nice-try';
import { pathToRegexp } from 'path-to-regexp';
import { parseIgnore } from '@useoptic/cli-config/build/helpers/ignore-parser';
import { BodyShapeDiff, ParsedDiff } from '../../../lib/parse-diff';
import { CurrentSpecContext } from '../../../lib/Interfaces';
import { DiffSet } from '../../../lib/diff-set';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '../../../../../cli-shared/build/diffs/initial-types';
import { IgnoreRule } from '../../../lib/ignore-rule';
import { AssembleCommands } from '../../../lib/assemble-commands';

export const newSharedDiffMachine = (
  currentSpecContext: CurrentSpecContext,
  parsedDiffs: ParsedDiff[] = exampleParsedDiffs,
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash = learnedTrails
) => {
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
      simulatedCommands: [],
      choices: {
        approvedSuggestions: {},
      },
      results: {
        undocumentedUrls: exampleUrls,
        displayedUndocumentedUrls: exampleUrls,
        parsedDiffs: exampleParsedDiffs,
        trailValues,
        diffsGroupedByEndpoint: groupDiffsByTheirEndpoints(
          currentSpecContext,
          parsedDiffs
        ),
      },
      pendingEndpoints: [],
      browserAppliedIgnoreRules: [],
      browserDiffHashIgnoreRules: [],
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
          ADD_PATH_IGNORE_RULE: {
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
          ADD_DIFF_HASH_IGNORE: {
            actions: [
              assign({
                browserDiffHashIgnoreRules: (ctx, event) => [
                  ...ctx.browserDiffHashIgnoreRules,
                  event.diffHash,
                ],
              }),
            ],
          },
          // shape diffs
          COMMANDS_APPROVED_FOR_DIFF: {
            actions: [
              assign({
                choices: (ctx, event) => ({
                  ...ctx.choices,
                  approvedSuggestions: {
                    ...ctx.choices.approvedSuggestions,
                    [event.diffHash]: event.commands,
                  },
                }),
              }),
              assign({
                simulatedCommands: (ctx) =>
                  AssembleCommands(
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints
                  ),
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
    parsedDiffs: ctx.results.parsedDiffs,
    trailValues: ctx.results.trailValues,
    diffsGroupedByEndpoint: ctx.results.diffsGroupedByEndpoint,
  };
}

export interface EndpointDiffGrouping {
  pathId: string;
  method: string;
  fullPath: string;
  newRegionDiffs: ParsedDiff[];
  shapeDiffs: BodyShapeDiff[];
}

function groupDiffsByTheirEndpoints(
  currentSpecContext: CurrentSpecContext,
  parsedDiffs: ParsedDiff[]
  // endpoint id method+pathId -> hashes
): EndpointDiffGrouping[] {
  const set = new DiffSet(parsedDiffs, currentSpecContext);
  const byEndpoint = set.groupedByEndpoint();
  return byEndpoint.map((i) => {
    const newRegionDiffs = new DiffSet(i.diffs, currentSpecContext)
      .newRegions()
      .iterator();
    const shapeDiffs = new DiffSet(i.diffs, currentSpecContext)
      .shapeDiffs()
      .groupedByEndpointAndShapeTrail()
      .map((i) => i.diffs[0].asShapeDiff(currentSpecContext)!);

    const fullPath = currentSpecContext.currentSpecEndpoints.find(
      (e) => e.pathId === i.pathId && e.method === i.method
    )!.fullPath;

    return {
      pathId: i.pathId,
      method: i.method,
      fullPath,
      newRegionDiffs,
      shapeDiffs,
    };
  });
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
      type: 'ADD_PATH_IGNORE_RULE';
      rule: string;
    }
  | {
      type: 'PENDING_ENDPOINT_STAGED';
      id: string;
    }
  | {
      type: 'PENDING_ENDPOINT_DISCARDED';
      id: string;
    }
  | {
      type: 'COMMANDS_APPROVED_FOR_DIFF';
      diffHash: string;
      commands: any[];
    }
  | {
      type: 'ADD_DIFF_HASH_IGNORE';
      diffHash: string;
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
    parsedDiffs: ParsedDiff[];
    trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
    diffsGroupedByEndpoint: EndpointDiffGrouping[];
  };
  choices: {
    approvedSuggestions: { [key: string]: any[] };
  };
  simulatedCommands: any[];
  pendingEndpoints: IPendingEndpoint[];
  browserAppliedIgnoreRules: string[];
  browserDiffHashIgnoreRules: string[];
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

const exampleParsedDiffs: ParsedDiff[] = [
  {
    serialized_diff: {
      UnmatchedRequestBodyContentType: {
        interactionTrail: {
          path: [
            { Url: { path: '/api/todos/abcdfeg' } },
            { Method: { method: 'GET' } },
            { RequestBody: { contentType: 'application/json' } },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_it2OyjUysW' } },
      },
    },
    interactions: [
      '8eff95b1-4f6d-4d3c-ba71-5e37923780ce4',
      '8eff95b1-4f6d-4d3c-ba71-5e37923780ce4',
    ],
    diffType: 'UnmatchedRequestBodyContentType',
    diffHash: '48b9c0094ee8694e07f49d37a48c28650cb82029',
  },
  {
    serialized_diff: {
      UnmatchedResponseBodyContentType: {
        interactionTrail: {
          path: [
            { Method: { method: 'GET' } },
            {
              ResponseBody: {
                contentType: 'application/json',
                statusCode: 200,
              },
            },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_it2OyjUysW' } },
      },
    },
    interactions: [
      '8eff95b1-4f6d-4d3c-ba71-5e37923780ce4',
      '8eff95b1-4f6d-4d3c-ba71-5e37923780ce4',
    ],
    diffType: 'UnmatchedResponseBodyContentType',
    diffHash: 'a39bbdce2d74b25e1815653cb4fa6282f6c7b0f3',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyShape: {
        interactionTrail: {
          path: [{ RequestBody: { contentType: 'application/json' } }],
        },
        requestsTrail: { SpecRequestBody: { requestId: 'request_3kjV3YMXdP' } },
        shapeDiffResult: {
          UnmatchedShape: {
            jsonTrail: {
              path: [
                { JsonArrayItem: { index: 1 } },
                { JsonObjectKey: { key: 'dueDate' } },
              ],
            },
            shapeTrail: {
              rootShapeId: 'shape_FMLvgzBZRK',
              path: [
                {
                  ListItemTrail: {
                    listShapeId: 'shape_FMLvgzBZRK',
                    itemShapeId: 'shape_M3jePX8HMF',
                  },
                },
                {
                  ObjectFieldTrail: {
                    fieldId: 'field_oQxruSbdCD',
                    fieldShapeId: 'shape_YtXLm2ULc3',
                  },
                },
              ],
            },
          },
        },
      },
    },
    interactions: ['fa0def9226-abf8-41a7-ba1f-7fd09c509090'],
    diffType: 'UnmatchedRequestBodyShape',
    diffHash: '16d1fe3075a7d6a81170756d1e4be4cd7dd02563',
  },
  {
    serialized_diff: {
      UnmatchedResponseBodyShape: {
        interactionTrail: {
          path: [
            {
              ResponseBody: {
                contentType: 'application/json',
                statusCode: 200,
              },
            },
          ],
        },
        requestsTrail: {
          SpecResponseBody: { responseId: 'response_dE2gzm1TWj' },
        },
        shapeDiffResult: {
          UnmatchedShape: {
            jsonTrail: {
              path: [
                { JsonArrayItem: { index: 1 } },
                { JsonObjectKey: { key: 'dueDate' } },
              ],
            },
            shapeTrail: {
              rootShapeId: 'shape_atTrTmH6j9',
              path: [
                {
                  ListItemTrail: {
                    listShapeId: 'shape_atTrTmH6j9',
                    itemShapeId: 'shape_w9f5rUduX2',
                  },
                },
                {
                  ObjectFieldTrail: {
                    fieldId: 'field_MxN4prqQaf',
                    fieldShapeId: 'shape_5Htez4BFKO',
                  },
                },
              ],
            },
          },
        },
      },
    },
    interactions: ['fa0def9226-abf8-41a7-ba1f-7fd09c509090'],
    diffType: 'UnmatchedResponseBodyShape',
    diffHash: 'c1e2d600f2350e9c9ce96cf7c32071cc578d6a63',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyContentType: {
        interactionTrail: {
          path: [
            { Url: { path: '/api/todos/aa5exvbk000' } },
            { Method: { method: 'PATCH' } },
            { RequestBody: { contentType: 'application/json' } },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_it2OyjUysW' } },
      },
    },
    interactions: ['2488a433-85f6-4b1f-bd80-23c2c4ds6a5c87'],
    diffType: 'UnmatchedRequestBodyContentType',
    diffHash: '936d9d11771fbbe181aa3521c2fa46ca0d76c1dc',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyContentType: {
        interactionTrail: {
          path: [
            { Url: { path: '/api/todos/5ebk000' } },
            { Method: { method: 'PATCH' } },
            { RequestBody: { contentType: 'application/json' } },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_it2OyjUysW' } },
      },
    },
    interactions: ['2488a433-85f6-4b1fdsa-bd80-23c2c46a5c87'],
    diffType: 'UnmatchedRequestBodyContentType',
    diffHash: '8bf3c03b10b16ea657fec4ee9da8961007cad13d',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyContentType: {
        interactionTrail: {
          path: [
            { Url: { path: '/api/todos' } },
            { Method: { method: 'POST' } },
            { RequestBody: { contentType: 'application/json' } },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_UOIsxzICu5' } },
      },
    },
    interactions: ['a5eaf726-5548-4e37-8bc8-d5fb2accb2e9'],
    diffType: 'UnmatchedRequestBodyContentType',
    diffHash: '0542a11f07c372ef06b72f775e0834a58ecac215',
  },
  {
    serialized_diff: {
      UnmatchedResponseBodyContentType: {
        interactionTrail: {
          path: [
            { Method: { method: 'POST' } },
            {
              ResponseBody: {
                contentType: 'application/json',
                statusCode: 200,
              },
            },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_UOIsxzICu5' } },
      },
    },
    interactions: ['a5eaf726-5548-4e37-8bc8-d5fb2accb2e9'],
    diffType: 'UnmatchedResponseBodyContentType',
    diffHash: '73e71376e31d1bb62d3d020866c46cbe156b8488',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyContentType: {
        interactionTrail: {
          path: [
            { Url: { path: '/api/todos/5exvbk000' } },
            { Method: { method: 'PATCH' } },
            { RequestBody: { contentType: 'application/json' } },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_it2OyjUysW' } },
      },
    },
    interactions: [
      '2488a433-85f6-4b1f-bd80-23c2c46a5c87',
      '75f97fe4-4b0c-47e3-834f-ba991dd525a7',
    ],
    diffType: 'UnmatchedRequestBodyContentType',
    diffHash: '85591ed7d6cc4a4a675fc0945710e7aa5783f7b1',
  },
  {
    serialized_diff: {
      UnmatchedResponseBodyContentType: {
        interactionTrail: {
          path: [
            { Method: { method: 'PATCH' } },
            {
              ResponseBody: {
                contentType: 'application/json',
                statusCode: 200,
              },
            },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_it2OyjUysW' } },
      },
    },
    interactions: [
      '2488a433-85f6-4b1f-bd80-23c2c46a5c87',
      '2488a433-85f6-4b1f-bd80-23c2c4ds6a5c87',
      '2488a433-85f6-4b1fdsa-bd80-23c2c46a5c87',
      '75f97fe4-4b0c-47e3-834f-ba991dd525a7',
    ],
    diffType: 'UnmatchedResponseBodyContentType',
    diffHash: '5926127d791e4efd3d4675965846bc010a5024c4',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyShape: {
        interactionTrail: {
          path: [{ RequestBody: { contentType: 'application/json' } }],
        },
        requestsTrail: { SpecRequestBody: { requestId: 'request_gwQEFrHpO0' } },
        shapeDiffResult: {
          UnmatchedShape: {
            jsonTrail: {
              path: [
                { JsonArrayItem: { index: 1 } },
                { JsonObjectKey: { key: 'dueDate' } },
              ],
            },
            shapeTrail: {
              rootShapeId: 'shape_cEkQAVQ3ib',
              path: [
                {
                  ListItemTrail: {
                    listShapeId: 'shape_cEkQAVQ3ib',
                    itemShapeId: 'shape_f7gQgQ8p7G',
                  },
                },
                {
                  ObjectFieldTrail: {
                    fieldId: 'field_5GCvc8KB2p',
                    fieldShapeId: 'shape_owJFnZQJeS',
                  },
                },
              ],
            },
          },
        },
      },
    },
    interactions: [
      '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4',
      '1c0b722f-107c-4082-abe7-f3cdd1d92475',
      '1c47baf2-0b1d-43a1-a5c5-64f9249801a5',
      '1c47baf2-0b1d-43a1-a5c5-64f9249801a5',
      'e930e3f5-a006-46d8-85ae-447ce3150906',
      'a3af782f-8e44-4e17-806d-025c8fb0a4fd',
    ],
    diffType: 'UnmatchedRequestBodyShape',
    diffHash: '705c9a0bf998ab8a6d5f4dd5298680ef31be9984',
  },
  {
    serialized_diff: {
      UnmatchedResponseBodyShape: {
        interactionTrail: {
          path: [
            {
              ResponseBody: {
                contentType: 'application/json',
                statusCode: 200,
              },
            },
          ],
        },
        requestsTrail: {
          SpecResponseBody: { responseId: 'response_Zv48g7lL5e' },
        },
        shapeDiffResult: {
          UnmatchedShape: {
            jsonTrail: {
              path: [
                { JsonArrayItem: { index: 1 } },
                { JsonObjectKey: { key: 'dueDate' } },
              ],
            },
            shapeTrail: {
              rootShapeId: 'shape_0xeeapZ7UZ',
              path: [
                {
                  ListItemTrail: {
                    listShapeId: 'shape_0xeeapZ7UZ',
                    itemShapeId: 'shape_Fr2jskGj0G',
                  },
                },
                {
                  ObjectFieldTrail: {
                    fieldId: 'field_cOmYY7RoTV',
                    fieldShapeId: 'shape_FVWIcOgFGF',
                  },
                },
              ],
            },
          },
        },
      },
    },
    interactions: [
      '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4',
      '1c0b722f-107c-4082-abe7-f3cdd1d92475',
      '1c47baf2-0b1d-43a1-a5c5-64f9249801a5',
      'e930e3f5-a006-46d8-85ae-447ce3150906',
      'a3af782f-8e44-4e17-806d-025c8fb0a4fd',
    ],
    diffType: 'UnmatchedResponseBodyShape',
    diffHash: 'ac39daa7f953bf4c332b2368a4a0dbf68b5b661e',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyContentType: {
        interactionTrail: {
          path: [
            { Url: { path: '/api/lists/list123' } },
            { Method: { method: 'GET' } },
            { RequestBody: { contentType: 'application/json' } },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_AsEexQkVwC' } },
      },
    },
    interactions: ['a3af782f-8e44-4e17-806d-032323fb0a4fd'],
    diffType: 'UnmatchedRequestBodyContentType',
    diffHash: '6fcb3707ef006c15dc829ab8bc3b5aec02b11f64',
  },
  {
    serialized_diff: {
      UnmatchedResponseBodyContentType: {
        interactionTrail: {
          path: [
            { Method: { method: 'GET' } },
            {
              ResponseBody: {
                contentType: 'application/json',
                statusCode: 200,
              },
            },
          ],
        },
        requestsTrail: { SpecPath: { pathId: 'path_AsEexQkVwC' } },
      },
    },
    interactions: ['a3af782f-8e44-4e17-806d-032323fb0a4fd'],
    diffType: 'UnmatchedResponseBodyContentType',
    diffHash: '759a4df02ed6d5ae3bd7a496a37f27fa70cf1753',
  },
  {
    serialized_diff: {
      UnmatchedRequestBodyShape: {
        interactionTrail: {
          path: [{ RequestBody: { contentType: 'application/json' } }],
        },
        requestsTrail: { SpecRequestBody: { requestId: 'request_SqY61Qc9Mi' } },
        shapeDiffResult: {
          UnmatchedShape: {
            jsonTrail: {
              path: [
                { JsonArrayItem: { index: 1 } },
                { JsonObjectKey: { key: 'dueDate' } },
              ],
            },
            shapeTrail: {
              rootShapeId: 'shape_Lx1MrhWlFb',
              path: [
                {
                  ListItemTrail: {
                    listShapeId: 'shape_Lx1MrhWlFb',
                    itemShapeId: 'shape_QU1rtECeM2',
                  },
                },
                {
                  ObjectFieldTrail: {
                    fieldId: 'field_eHl286agXw',
                    fieldShapeId: 'shape_PTjiKnpFzQ',
                  },
                },
              ],
            },
          },
        },
      },
    },
    interactions: ['a3af782f-8e44-4e1327-806d-032323fb0a4fd'],
    diffType: 'UnmatchedRequestBodyShape',
    diffHash: 'c8432ee3c00bfe3b4c714a30c88b6a956ee5b6c0',
  },
  {
    serialized_diff: {
      UnmatchedResponseBodyShape: {
        interactionTrail: {
          path: [
            {
              ResponseBody: {
                contentType: 'application/json',
                statusCode: 200,
              },
            },
          ],
        },
        requestsTrail: {
          SpecResponseBody: { responseId: 'response_RkkvxIt2RG' },
        },
        shapeDiffResult: {
          UnmatchedShape: {
            jsonTrail: {
              path: [
                { JsonArrayItem: { index: 1 } },
                { JsonObjectKey: { key: 'dueDate' } },
              ],
            },
            shapeTrail: {
              rootShapeId: 'shape_ToF242uYVA',
              path: [
                {
                  ListItemTrail: {
                    listShapeId: 'shape_ToF242uYVA',
                    itemShapeId: 'shape_ohd8yFyzEg',
                  },
                },
                {
                  ObjectFieldTrail: {
                    fieldId: 'field_TxVlnhtLaa',
                    fieldShapeId: 'shape_3Xt9wp5UxL',
                  },
                },
              ],
            },
          },
        },
      },
    },
    interactions: ['a3af782f-8e44-4e1327-806d-032323fb0a4fd'],
    diffType: 'UnmatchedResponseBodyShape',
    diffHash: '564b7c1aa1908494eead92a0ab1f1a4c051d0ce9',
  },
  //@ts-ignore
].map((i: any) => new ParsedDiff(i.serialized_diff, i.interactions));

const learnedTrails = {
  '16d1fe3075a7d6a81170756d1e4be4cd7dd02563': {
    affordances: [
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'task' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [
          ['task', 'dueDate', 'isDone', 'id'],
          ['task', 'isDone', 'id'],
        ],
        wasNumber: false,
        trail: { path: [{ JsonArrayItem: { index: 0 } }] },
        wasArray: false,
        wasObject: true,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'id' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: { path: [] },
        wasArray: true,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'isDone' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: true,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'dueDate' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
    ],
    interactions: {
      wasArrayTrails: {},
      wasString: ['fa0def9226-abf8-41a7-ba1f-7fd09c509090'],
      wasNumber: [],
      wasNullTrails: {},
      wasBooleanTrails: {},
      wasArray: [],
      wasObject: [],
      wasStringTrails: {
        'fa0def9226-abf8-41a7-ba1f-7fd09c509090': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasNull: [],
      wasMissing: ['fa0def9226-abf8-41a7-ba1f-7fd09c509090'],
      wasNumberTrails: {},
      wasMissingTrails: {
        'fa0def9226-abf8-41a7-ba1f-7fd09c509090': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasBoolean: [],
      wasObjectTrails: {},
    },
  },
  c1e2d600f2350e9c9ce96cf7c32071cc578d6a63: {
    affordances: [
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'task' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [
          ['task', 'dueDate', 'isDone', 'id'],
          ['task', 'isDone', 'id'],
        ],
        wasNumber: false,
        trail: { path: [{ JsonArrayItem: { index: 0 } }] },
        wasArray: false,
        wasObject: true,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'id' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: { path: [] },
        wasArray: true,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'isDone' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: true,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'dueDate' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
    ],
    interactions: {
      wasArrayTrails: {},
      wasString: ['fa0def9226-abf8-41a7-ba1f-7fd09c509090'],
      wasNumber: [],
      wasNullTrails: {},
      wasBooleanTrails: {},
      wasArray: [],
      wasObject: [],
      wasStringTrails: {
        'fa0def9226-abf8-41a7-ba1f-7fd09c509090': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasNull: [],
      wasMissing: ['fa0def9226-abf8-41a7-ba1f-7fd09c509090'],
      wasNumberTrails: {},
      wasMissingTrails: {
        'fa0def9226-abf8-41a7-ba1f-7fd09c509090': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasBoolean: [],
      wasObjectTrails: {},
    },
  },
  '705c9a0bf998ab8a6d5f4dd5298680ef31be9984': {
    affordances: [
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'task' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [
          ['task', 'dueDate', 'isDone', 'id'],
          ['task', 'isDone', 'id'],
        ],
        wasNumber: false,
        trail: { path: [{ JsonArrayItem: { index: 0 } }] },
        wasArray: false,
        wasObject: true,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'id' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: { path: [] },
        wasArray: true,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'isDone' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: true,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: true,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'dueDate' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
    ],
    interactions: {
      wasArrayTrails: {},
      wasString: [
        '1c0b722f-107c-4082-abe7-f3cdd1d92475',
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4',
        '1c47baf2-0b1d-43a1-a5c5-64f9249801a5',
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd',
        'e930e3f5-a006-46d8-85ae-447ce3150906',
      ],
      wasNumber: ['1c47baf2-0b1d-43a1-a5c5-64f9249801a5'],
      wasNullTrails: {},
      wasBooleanTrails: {},
      wasArray: [],
      wasObject: [],
      wasStringTrails: {
        '1c0b722f-107c-4082-abe7-f3cdd1d92475': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        '1c47baf2-0b1d-43a1-a5c5-64f9249801a5': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'e930e3f5-a006-46d8-85ae-447ce3150906': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasNull: [],
      wasMissing: [
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4',
        '1c0b722f-107c-4082-abe7-f3cdd1d92475',
        'e930e3f5-a006-46d8-85ae-447ce3150906',
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd',
      ],
      wasNumberTrails: {
        '1c47baf2-0b1d-43a1-a5c5-64f9249801a5': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasMissingTrails: {
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        '1c0b722f-107c-4082-abe7-f3cdd1d92475': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'e930e3f5-a006-46d8-85ae-447ce3150906': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasBoolean: [],
      wasObjectTrails: {},
    },
  },
  ac39daa7f953bf4c332b2368a4a0dbf68b5b661e: {
    affordances: [
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'task' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [
          ['task', 'dueDate', 'isDone', 'id'],
          ['task', 'isDone', 'id'],
        ],
        wasNumber: false,
        trail: { path: [{ JsonArrayItem: { index: 0 } }] },
        wasArray: false,
        wasObject: true,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'id' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: { path: [] },
        wasArray: true,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'isDone' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: true,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'dueDate' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
    ],
    interactions: {
      wasArrayTrails: {},
      wasString: [
        '1c0b722f-107c-4082-abe7-f3cdd1d92475',
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4',
        '1c47baf2-0b1d-43a1-a5c5-64f9249801a5',
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd',
        'e930e3f5-a006-46d8-85ae-447ce3150906',
      ],
      wasNumber: [],
      wasNullTrails: {},
      wasBooleanTrails: {},
      wasArray: [],
      wasObject: [],
      wasStringTrails: {
        '1c0b722f-107c-4082-abe7-f3cdd1d92475': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        '1c47baf2-0b1d-43a1-a5c5-64f9249801a5': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'e930e3f5-a006-46d8-85ae-447ce3150906': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasNull: [],
      wasMissing: [
        '1c0b722f-107c-4082-abe7-f3cdd1d92475',
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4',
        '1c47baf2-0b1d-43a1-a5c5-64f9249801a5',
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd',
        'e930e3f5-a006-46d8-85ae-447ce3150906',
      ],
      wasNumberTrails: {},
      wasMissingTrails: {
        '1c0b722f-107c-4082-abe7-f3cdd1d92475': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        '8eff95b1-4f6d-4d3c-ba71-5e3792780ce4': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        '1c47baf2-0b1d-43a1-a5c5-64f9249801a5': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'a3af782f-8e44-4e17-806d-025c8fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
        'e930e3f5-a006-46d8-85ae-447ce3150906': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasBoolean: [],
      wasObjectTrails: {},
    },
  },
  c8432ee3c00bfe3b4c714a30c88b6a956ee5b6c0: {
    affordances: [
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'task' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [
          ['task', 'dueDate', 'isDone', 'id'],
          ['task', 'isDone', 'id'],
        ],
        wasNumber: false,
        trail: { path: [{ JsonArrayItem: { index: 0 } }] },
        wasArray: false,
        wasObject: true,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'id' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: { path: [] },
        wasArray: true,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'isDone' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: true,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'dueDate' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
    ],
    interactions: {
      wasArrayTrails: {},
      wasString: ['a3af782f-8e44-4e1327-806d-032323fb0a4fd'],
      wasNumber: [],
      wasNullTrails: {},
      wasBooleanTrails: {},
      wasArray: [],
      wasObject: [],
      wasStringTrails: {
        'a3af782f-8e44-4e1327-806d-032323fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasNull: [],
      wasMissing: ['a3af782f-8e44-4e1327-806d-032323fb0a4fd'],
      wasNumberTrails: {},
      wasMissingTrails: {
        'a3af782f-8e44-4e1327-806d-032323fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasBoolean: [],
      wasObjectTrails: {},
    },
  },
  '564b7c1aa1908494eead92a0ab1f1a4c051d0ce9': {
    affordances: [
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'task' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [
          ['task', 'dueDate', 'isDone', 'id'],
          ['task', 'isDone', 'id'],
        ],
        wasNumber: false,
        trail: { path: [{ JsonArrayItem: { index: 0 } }] },
        wasArray: false,
        wasObject: true,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'id' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: { path: [] },
        wasArray: true,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
      {
        wasString: false,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'isDone' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: true,
      },
      {
        wasString: true,
        fieldSet: [],
        wasNumber: false,
        trail: {
          path: [
            { JsonArrayItem: { index: 0 } },
            { JsonObjectKey: { key: 'dueDate' } },
          ],
        },
        wasArray: false,
        wasObject: false,
        wasNull: false,
        wasBoolean: false,
      },
    ],
    interactions: {
      wasArrayTrails: {},
      wasString: ['a3af782f-8e44-4e1327-806d-032323fb0a4fd'],
      wasNumber: [],
      wasNullTrails: {},
      wasBooleanTrails: {},
      wasArray: [],
      wasObject: [],
      wasStringTrails: {
        'a3af782f-8e44-4e1327-806d-032323fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 0 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasNull: [],
      wasMissing: ['a3af782f-8e44-4e1327-806d-032323fb0a4fd'],
      wasNumberTrails: {},
      wasMissingTrails: {
        'a3af782f-8e44-4e1327-806d-032323fb0a4fd': [
          {
            path: [
              { JsonArrayItem: { index: 1 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 2 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 3 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
          {
            path: [
              { JsonArrayItem: { index: 4 } },
              { JsonObjectKey: { key: 'dueDate' } },
            ],
          },
        ],
      },
      wasBoolean: [],
      wasObjectTrails: {},
    },
  },
};
