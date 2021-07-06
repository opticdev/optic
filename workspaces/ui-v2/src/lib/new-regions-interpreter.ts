import * as Sentry from '@sentry/react';

import {
  CurrentSpecContext,
  IInterpretation,
  IParsedLocation,
  IPatchChoices,
} from './Interfaces';
import { ParsedDiff } from './parse-diff';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { DiffTypes } from '@useoptic/cli-shared/build/diffs/diffs';
import { IOpticDiffService } from '@useoptic/spectacle';
import { code, plain } from '<src>/pages/diffs/components/ICopyRender';
import { descriptionForNewRegions } from '<src>/lib/diff-description-interpreter';

//only ever take 1 diff at a time
export async function newRegionInterpreters(
  diff: ParsedDiff,
  opticDiffService: IOpticDiffService,
  currentSpecContext: CurrentSpecContext
): Promise<IInterpretation | undefined> {
  if (
    diff.isA(DiffTypes.UnmatchedRequestBodyContentType) ||
    diff.isA(DiffTypes.UnmatchedResponseBodyContentType) ||
    diff.isA(DiffTypes.UnmatchedQueryParameters)
  ) {
    const location = diff.location(currentSpecContext);
    const { pathId, method } = location;
    const learnedBodies = await opticDiffService.learnUndocumentedBodies(
      pathId,
      method,
      []
    );

    return newContentType(diff, location, learnedBodies);
  }
}

function newContentType(
  udiff: ParsedDiff,
  location: IParsedLocation,
  learnedBodies: ILearnedBodies
): IInterpretation {
  if (udiff.isA(DiffTypes.UnmatchedRequestBodyContentType)) {
    const learnedRequestBody = learnedBodies.requests.find(
      (i) => i.contentType === location.inRequest?.contentType
    );

    if (!learnedRequestBody) {
      console.error(
        `Could not learn body for request with content type ${location.inRequest?.contentType}`
      );
      Sentry.captureEvent({
        message: 'No learned request body was found',
        extra: {
          learnedBodies,
          location,
          udiff,
        },
      });
    }

    const commands = learnedRequestBody ? learnedRequestBody.commands : [];

    return {
      previewTabs: [
        {
          allowsExpand: false,
          assertion: [],
          ignoreRule: {
            newBodyInRequest: location.inRequest,
            diffHash: udiff.diffHash,
          },
          interactionPointers: udiff.interactions,
          invalid: true,
          jsonTrailsByInteractions: {},
          title: `${location.inRequest?.contentType || 'No Body'} Request`,
        },
      ],
      diffDescription: descriptionForNewRegions(udiff, location),
      updateSpecChoices: {
        includeNewBody: true,
        isNewRegionDiff: true,
        shapes: [],
        copy: [
          plain('Document'),
          code(location.inRequest!.contentType || 'null'),
          plain('Request'),
        ],
      },
      toCommands(choices?: IPatchChoices): any[] {
        if (choices?.includeNewBody) {
          return commands;
        } else return [];
      },
    };
  } else if (udiff.isA(DiffTypes.UnmatchedResponseBodyContentType)) {
    //learn status code too.... currently missing
    const learnedResponseBody = learnedBodies.responses.find(
      (i) =>
        i.contentType === location.inResponse?.contentType &&
        i.statusCode === location.inResponse?.statusCode
    );

    if (!learnedResponseBody) {
      console.error(
        `Could not learn body for response with status code ${location.inResponse?.statusCode} content type ${location.inResponse?.contentType}`
      );
      Sentry.captureEvent({
        message: 'No learned response body was found',
        extra: {
          learnedBodies,
          location,
          udiff,
        },
      });
    }

    const commands = learnedResponseBody ? learnedResponseBody.commands : [];

    return {
      previewTabs: [
        {
          allowsExpand: false,
          assertion: [],
          ignoreRule: {
            newBodyInRequest: location.inRequest,
            diffHash: udiff.diffHash,
          },
          interactionPointers: udiff.interactions,
          invalid: true,
          jsonTrailsByInteractions: {},
          title: `${location.inResponse?.statusCode} ${
            location.inResponse?.contentType || ''
          } Response`,
        },
      ],
      diffDescription: descriptionForNewRegions(udiff, location),
      updateSpecChoices: {
        includeNewBody: true,
        isNewRegionDiff: true,
        shapes: [],
        copy: [
          plain('Document'),
          code(location.inResponse!.statusCode.toString()),
          plain('Response'),
        ],
      },
      toCommands(choices?: IPatchChoices): any[] {
        if (choices?.includeNewBody) {
          return commands;
        } else return [];
      },
    };
  } else if (udiff.isA(DiffTypes.UnmatchedQueryParameters)) {
    // TODO QPB to implement
    return {} as IInterpretation;
  }

  throw new Error('new regions must match either a request or a response');
}
