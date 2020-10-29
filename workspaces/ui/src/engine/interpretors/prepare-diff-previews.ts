import { ParsedDiff } from '../../engine/parse-diff';
import { newRegionInterpreters } from '../../engine/interpretors/NewRegionsInterpretors';
import { descriptionForDiffs } from '../../engine/interpretors/DiffDescriptionInterpretors';
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
  IIgnoreRule,
  transformAffordanceMappingByIgnoreRules,
} from './ignores/IIgnoreRule';
import { ICoreShapeKinds } from '../interfaces/interfaces';
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
  learnedBodies: ILearnedBodies
): Promise<IDiffSuggestionPreview> {
  const firstInteractionPointer = diff.interactions[0];

  await services.captureService.loadInteraction(firstInteractionPointer);

  const tab1: IInteractionPreviewTab = {
    title: 'New Region',
    allowsExpand: true,
    interactionPointers: diff.interactions,
    invalid: true,
    assertion: [],
    jsonTrailsByInteractions: {},
  };

  return {
    for: 'region',
    tabs: [tab1],
    diffDescription: descriptionForDiffs(diff, services.rfcBaseState),
    suggestions: newRegionInterpreters(
      diff,
      learnedBodies,
      services.rfcBaseState
    ),
  };
}

export async function prepareShapeDiffSuggestionPreview(
  diff: ParsedDiff,
  services: InteractiveSessionConfig,
  learnedTrails: IValueAffordanceSerializationWithCounter
): Promise<IDiffSuggestionPreview> {
  const { suggestions, previewTabs, overrideTitle } = interpretShapeDiffs(
    diff,
    learnedTrails,
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
