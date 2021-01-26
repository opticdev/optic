import { ParsedDiff } from '../parse-diff';
import {
  code,
  IChangeType,
  ISuggestion,
  plain,
} from '../interfaces/interpretors';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { JsonHelper, opticEngine } from '@useoptic/domain';
import { DiffRfcBaseState } from '@useoptic/cli-shared/build/diffs/diff-rfc-base-state';
import {
  DiffTypes,
  IUnmatchedRequestBodyShape,
  IUnmatchedResponseBodyContentType,
} from '@useoptic/cli-shared/build/diffs/diffs';

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
    return [newContentType(diff, learnedBodies, services)];
  }

  return [];
}

function newContentType(
  udiff: ParsedDiff,
  learnedBodies: ILearnedBodies,
  rfcBaseState: DiffRfcBaseState
): ISuggestion {
  const {
    AddRequest,
    SetRequestBodyShape,
    ShapedBodyDescriptor,
    SetResponseBodyShape,
    AddResponseByPathAndMethod,
  } = opticEngine.com.useoptic.contexts.requests.Commands;

  const location = udiff.location(rfcBaseState);
  if (udiff.isA(DiffTypes.UnmatchedRequestBodyContentType)) {
    const diff = (udiff.raw() as IUnmatchedRequestBodyShape)
      .UnmatchedRequestBodyShape;

    const { commands } = learnedBodies.requests.find(
      (i) => i.contentType === location.inRequest.contentType
    );

    return {
      action: {
        activeTense: [
          plain('document request body'),
          code(location.inRequest.contentType || 'No Body'),
        ],
        pastTense: [
          plain('Documented'),
          code(location.inRequest.contentType || 'No Body'),
          plain('request'),
        ],
      },
      commands: commands,
      changeType: IChangeType.Added,
    };
  } else if (udiff.isA(DiffTypes.UnmatchedResponseBodyContentType)) {
    const diff = (udiff.raw() as IUnmatchedResponseBodyContentType)
      .UnmatchedResponseBodyContentType;
    //learn status code too.... currently missing
    const { commands } = learnedBodies.responses.find(
      (i) =>
        i.contentType === location.inResponse.contentType &&
        i.statusCode === location.inResponse.statusCode
    );

    return {
      action: {
        activeTense: [
          plain('document'),
          code(location.inResponse!.statusCode.toString()),
          plain('response with'),
          code(location.inResponse.contentType || 'No Body'),
        ],
        pastTense: [
          plain('Documented'),
          code(location.inResponse!.statusCode.toString()),
          plain('response with'),
          code(location.inResponse.contentType || 'No Body'),
        ],
      },
      commands,
      changeType: IChangeType.Added,
    };
  }
}
