import { ParsedDiff } from '../../engine/parse-diff';
import { InteractiveDiffSessionConfig } from '../../engine/interactive-diff-session';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import {
  ICopy,
  IDiffDescription,
  ISuggestion,
  plain,
} from '../../engine/interfaces/interpretors';
import { newRegionInterpreters } from '../../engine/interpretors/NewRegionsInterpretors';
import { descriptionForDiffs } from '../../engine/interpretors/DiffDescriptionInterpretors';
import { shapeDiffInterpretors } from '../../engine/interpretors/ShapeDiffInterpretors';
import { InteractiveSessionConfig } from '../../engine/interfaces/session';

interface InteractionPreviewTab {
  title: ICopy[];
  allowsIgnore: boolean;
  allowsExpand: boolean;
  interactions: any[];
  renderBody: (interaction) => any;
  interactionPointers: any[];
  diff: ParsedDiff;
}

export interface IDiffSuggestionPreview {
  for: 'shape' | 'region';
  diffDescription: IDiffDescription;
  tabs: InteractionPreviewTab[];
  suggestions: ISuggestion[];
}

export function initialTitleForNewRegions(diff: ParsedDiff) {
  const location = diff.location();
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

  const tab1: InteractionPreviewTab = {
    diff: diff,
    title: [plain('New Regions')],
    allowsExpand: true,
    allowsIgnore: true,
    interactions: diff.interactions,
    interactionPointers: diff.interactions,
    renderBody: (interaction) => {}, // this should provide the input needed to render just one body or a preview
  };

  return {
    for: 'region',
    tabs: [tab1],
    diffDescription: descriptionForDiffs([diff]),
    suggestions: newRegionInterpreters(diff, learnedBodies),
  };
}

export async function prepareShapeDiffSuggestionPreview(
  diffs: ParsedDiff[],
  services: InteractiveSessionConfig,
  learnedTrails: IValueAffordanceSerializationWithCounter
): Promise<IDiffSuggestionPreview> {
  return {
    for: 'shape',
    tabs: [],
    diffDescription: descriptionForDiffs(diffs),
    suggestions: shapeDiffInterpretors(
      diffs,
      learnedTrails,
      services.rfcBaseState
    ),
  };
}
