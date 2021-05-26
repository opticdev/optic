import { assign, Machine, spawn } from 'xstate';
// @ts-ignore
import * as niceTry from 'nice-try';
import { pathToRegexp } from 'path-to-regexp';
import { parseIgnore } from '@useoptic/cli-config/build/helpers/ignore-parser';
import {
  AddContributionType,
  CQRSCommand,
  IOpticConfigRepository,
  IOpticDiffService,
} from '@useoptic/spectacle';
import { BodyShapeDiff, ParsedDiff } from '<src>/lib/parse-diff';
import { CurrentSpecContext } from '<src>/lib/Interfaces';
import { DiffSet } from '<src>/lib/diff-set';
import uniqby from 'lodash.uniqby';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { AssembleCommands } from '<src>/lib/assemble-commands';
import { newInitialBodiesMachine } from './LearnInitialBodiesMachine';
import { generatePathCommands } from '<src>/lib/stable-path-batch-generator';

function transformDiffs(
  currentSpecContext: CurrentSpecContext,
  parsedDiffs: ParsedDiff[] = [],
  undocumentedUrls: IUndocumentedUrl[] = [],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash
) {
  const knownUndocumented = includeUndocumented(
    parsedDiffs,
    currentSpecContext
  );

  const additionalUndocumentedUrls = knownUndocumented.map((i) => {
    const asUndocumentedUrl: IUndocumentedUrl = {
      path: i.fullPath,
      method: i.method,
      isKnownPath: true,
      count: 1,
    };
    return asUndocumentedUrl;
  });

  const initialDisplayUndocumented = [
    ...additionalUndocumentedUrls,
    ...undocumentedUrls,
  ];

  return {
    undocumentedUrls: initialDisplayUndocumented,
    knownPathUndocumented: knownUndocumented,
    displayedUndocumentedUrls: initialDisplayUndocumented,
    parsedDiffs: parsedDiffs,
    trailValues,
    diffsGroupedByEndpoint: groupDiffsByTheirEndpoints(
      currentSpecContext,
      parsedDiffs
    ),
  };
}

export const newSharedDiffMachine = (
  currentSpecContext: CurrentSpecContext,
  parsedDiffs: ParsedDiff[],
  undocumentedUrls: IUndocumentedUrl[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash,
  diffService: IOpticDiffService,
  configRepository: IOpticConfigRepository
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
      newPaths: { commands: [], pendingEndpointMap: {} },
      simulatedCommands: [],
      choices: {
        approvedSuggestions: {},
        existingEndpointNameContributions: {},
        existingEndpointPathContributions: {},
      },
      results: transformDiffs(
        currentSpecContext,
        parsedDiffs,
        undocumentedUrls,
        trailValues
      ),
      pendingEndpoints: [],
      browserAppliedIgnoreRules: [],
      browserDiffHashIgnoreRules: [],
    },
    initial: 'ready',
    states: {
      error: {},
      ready: {
        on: {
          USER_FINISHED_REVIEW: {
            actions: [
              assign({
                simulatedCommands: (ctx) => {
                  console.log('flushing commands before saving');
                  return AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  );
                },
              }),
            ],
          },
          DOCUMENT_ENDPOINT: {
            actions: [
              assign({
                newPaths: (ctx, event) => {
                  const regeneratePathCommands = generatePathCommands(
                    [
                      ...ctx.pendingEndpoints,
                      {
                        pathPattern: event.pattern,
                        id: event.pendingId,
                        matchesPattern: (a, b) => true,
                        method: event.method,
                        ref: undefined,
                      },
                    ],
                    currentSpecContext
                  );
                  console.log(regeneratePathCommands);
                  return {
                    commands: regeneratePathCommands.commands,
                    pendingEndpointMap:
                      regeneratePathCommands.endpointPathIdMap,
                  };
                },
              }),
              assign({
                pendingEndpoints: (ctx, event) => {
                  const regex = pathToRegexp(event.pattern, [], {
                    start: true,
                    end: true,
                  });

                  const { commands, endpointPathIdMap } = generatePathCommands(
                    [
                      {
                        pathPattern: event.pattern,
                        id: event.pendingId,
                        matchesPattern: (a, b) => true,
                        method: event.method,
                        ref: undefined,
                      },
                    ],
                    currentSpecContext
                  );

                  return [
                    ...ctx.pendingEndpoints.filter(
                      (pendingEndpoint) =>
                        !(
                          pendingEndpoint.method === event.method &&
                          pendingEndpoint.pathPattern === event.pattern
                        )
                    ),
                    {
                      pathPattern: event.pattern,
                      method: event.method,
                      id: event.pendingId,
                      ref: spawn(
                        newInitialBodiesMachine(
                          currentSpecContext,
                          event.pattern,
                          event.method,
                          endpointPathIdMap[event.pendingId],
                          commands,
                          diffService
                        )
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
                  console.log(ctx.pendingEndpoints);
                  return [...ctx.pendingEndpoints].map((i) => {
                    if (i.id === event.id) {
                      return { ...i, staged: true };
                    } else return i;
                  });
                },
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
                simulatedCommands: (ctx) =>
                  AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  ),
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
                newPaths: (ctx, event) => {
                  const regeneratePathCommands = generatePathCommands(
                    ctx.pendingEndpoints,
                    currentSpecContext
                  );
                  console.log(regeneratePathCommands);
                  return {
                    commands: regeneratePathCommands.commands,
                    pendingEndpointMap:
                      regeneratePathCommands.endpointPathIdMap,
                  };
                },
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
                simulatedCommands: (ctx) =>
                  AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  ),
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
              (ctx, event) => configRepository.addIgnoreRule(event.rule),
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
                choices: (ctx, event) => ({
                  approvedSuggestions: {},
                  existingEndpointNameContributions: {},
                  existingEndpointPathContributions: {},
                }),
              }),
              assign({
                results: (ctx) => updateUrlResults(ctx),
                simulatedCommands: (ctx) =>
                  AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  ),
              }),
            ],
          },
          REFRESH: {
            actions: [
              assign({
                results: (ctx, event) => {
                  return transformDiffs(
                    event.currentSpecContext,
                    event.parsedDiffs,
                    event.undocumentedUrls,
                    event.trailValues
                  );
                },
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
                simulatedCommands: (ctx) => {
                  return AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  );
                },
              }),
            ],
          },
          SET_ENDPOINT_NAME: {
            actions: [
              assign({
                choices: (ctx, event) => ({
                  ...ctx.choices,
                  existingEndpointNameContributions: {
                    ...ctx.choices.existingEndpointNameContributions,
                    [event.id]: event.command,
                  },
                }),
              }),
              assign({
                simulatedCommands: (ctx) => {
                  return AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  );
                },
              }),
            ],
          },
          SET_PATH_DESCRIPTION: {
            actions: [
              assign({
                choices: (ctx, event) => ({
                  ...ctx.choices,
                  existingEndpointPathContributions: {
                    ...ctx.choices.existingEndpointPathContributions,
                    [event.pathId]: {
                      command: event.command,
                      endpointId: event.endpointId,
                    },
                  },
                }),
              }),
              assign({
                simulatedCommands: (ctx) => {
                  return AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  );
                },
              }),
            ],
          },
          UPDATE_PENDING_ENDPOINT_NAME: {
            actions: [
              assign({
                simulatedCommands: (ctx) => {
                  return AssembleCommands(
                    ctx.newPaths,
                    ctx.choices.approvedSuggestions,
                    ctx.pendingEndpoints,
                    ctx.choices.existingEndpointNameContributions,
                    ctx.choices.existingEndpointPathContributions
                  );
                },
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
    knownPathUndocumented: ctx.results.knownPathUndocumented,
    displayedUndocumentedUrls: filterDisplayedUndocumentedUrls(
      ctx.results.undocumentedUrls,
      ctx.results.knownPathUndocumented,
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

export function includeUndocumented(
  parsedDiffs: ParsedDiff[],
  currentSpecContext: CurrentSpecContext
): IKnownPathUndocumented[] {
  const undocumented = new DiffSet(parsedDiffs, currentSpecContext)
    .forUndocumented()
    .iterator();

  const knownPaths: IKnownPathUndocumented[] = undocumented.map((i) => {
    const { pathId, method } = i.location(currentSpecContext);
    return {
      pathId,
      method,
      fullPath: currentSpecContext.currentSpecPaths.find(
        (i) => i.pathId === pathId
      )!.absolutePathPatternWithParameterNames,
    };
  });

  return uniqby(knownPaths, (i) => i.pathId + i.method);
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
  knownPathsUndocumented: IKnownPathUndocumented[],
  pending: IPendingEndpoint[],
  ignoreRules: string[]
): IUndocumentedUrl[] {
  const allIgnores = parseIgnore(ignoreRules);

  return all.map((value) => {
    if (
      pending.some((i) => {
        const matchedKnown = Boolean(
          knownPathsUndocumented.find(
            (known) =>
              known.fullPath === i.pathPattern &&
              known.method === i.method &&
              known.fullPath === value.path &&
              known.method === value.method
          )
        );
        return (
          (i.matchesPattern(value.path, value.method) || matchedKnown) &&
          i.staged
        );
      }) ||
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
      commands: CQRSCommand[];
    }
  | {
      type: 'ADD_DIFF_HASH_IGNORE';
      diffHash: string;
    }
  | {
      type: 'RESET';
    }
  | {
      type: 'REFRESH';
      currentSpecContext: CurrentSpecContext;
      parsedDiffs: ParsedDiff[];
      undocumentedUrls: IUndocumentedUrl[];
      trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
    }
  | {
      type: 'USER_FINISHED_REVIEW';
    }
  | {
      type: 'SET_ENDPOINT_NAME';
      id: string;
      command: AddContributionType;
    }
  | {
      type: 'UPDATE_PENDING_ENDPOINT_NAME';
    }
  | {
      type: 'SET_PATH_DESCRIPTION';
      pathId: string;
      command: AddContributionType;
      endpointId: string;
    };

// The context (extended state) of the machine
export interface SharedDiffStateContext {
  loading: {
    count: number;
    total: number;
  };
  results: {
    undocumentedUrls: IUndocumentedUrl[];
    knownPathUndocumented: IKnownPathUndocumented[];
    displayedUndocumentedUrls: IUndocumentedUrl[];
    parsedDiffs: ParsedDiff[];
    trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
    diffsGroupedByEndpoint: EndpointDiffGrouping[];
  };
  choices: {
    approvedSuggestions: { [key: string]: CQRSCommand[] };
    existingEndpointNameContributions: { [id: string]: AddContributionType };
    existingEndpointPathContributions: {
      [id: string]: {
        command: AddContributionType;
        endpointId: string;
      };
    };
  };
  newPaths: {
    commands: CQRSCommand[];
    pendingEndpointMap: { [key: string]: string };
  };
  simulatedCommands: CQRSCommand[];
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
  isKnownPath?: boolean;
}

export interface IKnownPathUndocumented {
  pathId: string;
  method: string;
  fullPath: string;
}
