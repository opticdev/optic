import { ParsedDiff } from '../../engine/parse-diff';
import { newRegionInterpreters } from '../../engine/interpretors/new-regions-interpretors';
import { descriptionForDiffs } from '../../engine/interpretors/diff-description-interpretors';
import { InteractiveSessionConfig } from '../../engine/interfaces/session';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { interpretShapeDiffs } from './interpretor-types/shape-diffs';
import {
  IDiffSuggestionPreview,
  IInteractionPreviewTab,
} from '../interfaces/interpretors';
import {
  IgnoreRule,
  transformAffordanceMappingByIgnoreRules,
} from './ignores/ignore-rule';
import { ICoreShapeKinds, IParsedLocation } from '../interfaces/interfaces';
import { DiffRfcBaseState } from '../interfaces/diff-rfc-base-state';

export function initialTitleForNewRegions(
  diff: ParsedDiff,
  rfcBaseState: DiffRfcBaseState
) {
  const location = diff.location(rfcBaseState);
  if (location.inRequest) {
    return `${
      location.inRequest.contentType || 'No Body'
    } Request observed for the first time`;
  }
  if (location.inResponse) {
    return `${location.inResponse.statusCode} Response with ${
      location.inResponse!.contentType || 'No Body'
    } observed for the first time`;
  }
}

export async function prepareNewRegionDiffSuggestionPreview(
  diff: ParsedDiff,
  services: InteractiveSessionConfig,
  learnedBodies: ILearnedBodies,
  ignoreRules: IgnoreRule[]
): Promise<IDiffSuggestionPreview> {
  const firstInteractionPointer = diff.interactions[0];

  await services.captureService.loadInteraction(firstInteractionPointer);

  const location = diff.location(services.rfcBaseState);

  const wasIgnored =
    ignoreRules.length === 1 && ignoreRules[0].diffHash === diff.diffHash;

  const name = nameForLocation(location);

  const tab1: IInteractionPreviewTab = {
    title: name,
    allowsExpand: true,
    interactionPointers: diff.interactions,
    invalid: true,
    assertion: [],
    jsonTrailsByInteractions: {},
    ignoreRule: {
      diffHash: diff.diffHash,
      newBodyInRequest: location.inRequest,
      newBodyInResponse: location.inResponse,
    },
  };

  return {
    for: 'region',
    tabs: !wasIgnored ? [tab1] : [],
    diffDescription: descriptionForDiffs(diff, services.rfcBaseState),
    suggestions: newRegionInterpreters(
      diff,
      learnedBodies,
      services.rfcBaseState
    ),
  };
}

function nameForLocation(location: IParsedLocation): string {
  if (location.inRequest) {
    return location.inRequest.contentType || 'No Body';
  } else if (location.inResponse) {
    return `${location.inResponse.statusCode} with ${
      location.inResponse.contentType || 'No Body'
    }`;
  }
}

export async function prepareShapeDiffSuggestionPreview(
  diff: ParsedDiff,
  services: InteractiveSessionConfig,
  learnedTrails: IValueAffordanceSerializationWithCounter,
  ignoreRules: IgnoreRule[]
): Promise<IDiffSuggestionPreview> {
  const trailsWithIgnored = transformAffordanceMappingByIgnoreRules(
    learnedTrails,
    diff.diffHash,
    diff.asShapeDiff(services.rfcBaseState).jsonTrail,
    ignoreRules
  );

  console.log('ignored', ignoreRules);

  const { suggestions, previewTabs, overrideTitle } = interpretShapeDiffs(
    diff,
    trailsWithIgnored,
    services
  );

  return {
    for: 'shape',
    tabs: previewTabs,
    diffDescription: descriptionForDiffs(diff, services.rfcBaseState),
    suggestions: suggestions,
    overrideTitle,
  };
}
