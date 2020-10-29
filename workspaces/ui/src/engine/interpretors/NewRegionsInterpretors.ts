import { ParsedDiff } from '../parse-diff';
import { IChangeType, ISuggestion, plain } from '../interfaces/interpretors';
import {
  DiffTypes,
  IUnmatchedRequestBodyShape,
  IUnmatchedResponseBodyContentType,
} from '../interfaces/diffs';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { DiffRfcBaseState } from '../interfaces/diff-rfc-base-state';

//only ever take 1 diff at a time
export function newRegionInterpreters(
  diff: ParsedDiff,
  learnedBodies: ILearnedBodies,
  services: DiffRfcBaseState
): ISuggestion[] {
  if (
    diff.isA(DiffTypes.UnmatchedRequestBodyContentType) ||
    diff.isA(DiffTypes.UnmatchedResponseBodyContentType)
  ) {
    // return [newContentType(diff, learnedBodies, services)];
  }

  return [];
}

function newContentType(
  udiff: ParsedDiff,
  learnedBodies: ILearnedBodies,
  rfcBaseState: DiffRfcBaseState
): ISuggestion {
  const location = udiff.location(rfcBaseState);
  if (udiff.isA(DiffTypes.UnmatchedRequestBodyContentType)) {
    const diff = (udiff.raw() as IUnmatchedRequestBodyShape)
      .UnmatchedRequestBodyShape;
    const learnedBody = learnedBodies.requests.find(
      (i) => i.contentType === location.inRequest.contentType
    );

    return {
      action: {
        activeTense: [plain('Todo Add request content type')],
        pastTense: [],
      },
      commands: [],
      changeType: IChangeType.Added,
    };
  } else if (udiff.isA(DiffTypes.UnmatchedResponseBodyContentType)) {
    const diff = (udiff.raw() as IUnmatchedResponseBodyContentType)
      .UnmatchedResponseBodyContentType;
    //learn status code too.... currently missing
    const learnedBody = learnedBodies.responses.find(
      (i) => i.contentType === location.inResponse.contentType
    );
    return {
      action: {
        activeTense: [plain('Todo add response content type')],
        pastTense: [],
      },
      commands: [],
      changeType: IChangeType.Added,
    };
  }
}
