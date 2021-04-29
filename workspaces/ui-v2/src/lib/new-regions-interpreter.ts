import {
  CurrentSpecContext,
  IInterpretation,
  IPatchChoices,
} from './Interfaces';
import { ParsedDiff } from './parse-diff';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { DiffTypes } from '@useoptic/cli-shared/build/diffs/diffs';

//only ever take 1 diff at a time
export async function newRegionInterpreters(
  diff: ParsedDiff,
  currentSpecContext: CurrentSpecContext
): Promise<IInterpretation | undefined> {
  if (
    diff.isA(DiffTypes.UnmatchedRequestBodyContentType) ||
    diff.isA(DiffTypes.UnmatchedResponseBodyContentType)
  ) {
    //bring in real service
    const learnedBodies: ILearnedBodies = {
      pathId: '',
      method: '',
      requests: [],
      responses: [],
    };

    return newContentType(diff, learnedBodies, currentSpecContext);
  }
}

function newContentType(
  udiff: ParsedDiff,
  learnedBodies: ILearnedBodies,
  currentSpecContext: CurrentSpecContext
): IInterpretation {
  // const {
  //   AddRequest,
  //   SetRequestBodyShape,
  //   ShapedBodyDescriptor,
  //   SetResponseBodyShape,
  //   AddResponseByPathAndMethod,
  // } = opticEngine.com.useoptic.contexts.requests.Commands;

  const location = udiff.location(currentSpecContext);
  if (udiff.isA(DiffTypes.UnmatchedRequestBodyContentType)) {
    const { commands } = learnedBodies.requests.find(
      (i) => i.contentType === location.inRequest?.contentType
    )!;

    return {
      previewTabs: [],
      toCommands(choices?: IPatchChoices): any[] {
        return commands;
      },
    };
  } else if (udiff.isA(DiffTypes.UnmatchedResponseBodyContentType)) {
    //learn status code too.... currently missing
    const { commands } = learnedBodies.responses.find(
      (i) =>
        i.contentType === location.inResponse?.contentType &&
        i.statusCode === location.inResponse?.statusCode
    )!;

    return {
      previewTabs: [],
      toCommands(choices?: IPatchChoices): any[] {
        return commands;
      },
    };
  }

  throw new Error('new regions must match either a request or a response');
}
