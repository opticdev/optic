import { assign, Machine, spawn } from 'xstate';
// @ts-ignore
import * as niceTry from 'nice-try';
import { pathToRegexp } from 'path-to-regexp';
import { parseIgnore } from '@useoptic/cli-config/build/helpers/ignore-parser';
import { BodyShapeDiff, ParsedDiff } from '../../../lib/parse-diff';
import { CurrentSpecContext } from '../../../lib/Interfaces';
import { DiffSet } from '../../../lib/diff-set';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { AssembleCommands } from '../../../lib/assemble-commands';
import { newInitialBodiesMachine } from './LearnInitialBodiesMachine';

export const newSharedDiffMachine = (
  currentSpecContext: CurrentSpecContext,
  parsedDiffs: ParsedDiff[],
  undocumentedUrls: IUndocumentedUrl[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash,
  allSamples: any[],
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
        undocumentedUrls: undocumentedUrls,
        displayedUndocumentedUrls: undocumentedUrls,
        parsedDiffs: parsedDiffs,
        trailValues,
        diffsGroupedByEndpoint: groupDiffsByTheirEndpoints(
          currentSpecContext,
          parsedDiffs,
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
                      ref: spawn(
                        newInitialBodiesMachine(
                          currentSpecContext,
                          event.pattern,
                          event.method,
                          () => {},
                          allSamples,
                        ),
                      ),
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
                    (i) => i.id !== event.id,
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
          RESET: {
            actions: [
              assign({
                pendingEndpoints: (ctx, event) => [],
                browserDiffHashIgnoreRules: (ctx, event) => [],
                choices: (ctx, event) => ({ approvedSuggestions: {} }),
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
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
                    ctx.pendingEndpoints,
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
  ctx: SharedDiffStateContext,
): SharedDiffStateContext['results'] {
  return {
    undocumentedUrls: ctx.results.undocumentedUrls,
    displayedUndocumentedUrls: filterDisplayedUndocumentedUrls(
      ctx.results.undocumentedUrls,
      ctx.pendingEndpoints,
      ctx.browserAppliedIgnoreRules,
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
  parsedDiffs: ParsedDiff[],
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
      (e) => e.pathId === i.pathId && e.method === i.method,
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
  ignoreRules: string[],
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
    }
  | {
      type: 'RESET';
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
  ref: any;
}

export interface IUndocumentedUrl {
  path: string;
  method: string;
  count: number;
  hide?: boolean;
}
