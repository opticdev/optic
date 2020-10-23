import { ParsedDiff } from '../parse-diff';
import { IChangeType, ISuggestion, plain } from '../interfaces/interpretors';
import {
  DiffTypes,
  IUnmatchedRequestBodyShape,
  IUnmatchedResponseBodyContentType,
} from '../interfaces/diffs';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { InteractiveSessionConfig } from '../interfaces/session';
import { DiffRfcBaseState } from '../interfaces/diff-rfc-base-state';

//only ever take 1 diff at a time
export function shapeDiffInterpretors(
  diffs: ParsedDiff[],
  learnedTrails: IValueAffordanceSerializationWithCounter,
  rfcBaseState: DiffRfcBaseState
): ISuggestion[] {
  console.warn('todo, shape diff interpretors');
  return [];
}
