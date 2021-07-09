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
import { CQRSCommand, IOpticDiffService } from '@useoptic/spectacle';
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

// TODO QPB - move IInterpretation generation into ParsedDiff
function newContentType(
  udiff: ParsedDiff,
  location: IParsedLocation,
  learnedBodies: ILearnedBodies
): IInterpretation {
  if (udiff.isA(DiffTypes.UnmatchedRequestBodyContentType)) {
    const contentType =
      location.data.type === 'request' ? location.data.contentType : '';
    const learnedRequestBody = learnedBodies.requests.find(
      (i) => i.contentType === contentType
    );

    if (!learnedRequestBody) {
      console.error(
        `Could not learn body for request with content type ${contentType}`
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
          assertion: [],
          interactionPointers: udiff.interactions,
          invalid: true,
          jsonTrailsByInteractions: {},
          title: `${contentType || 'No Body'} Request`,
        },
      ],
      diffDescription: descriptionForNewRegions(udiff, location),
      updateSpecChoices: {
        includeNewBody: true,
        isNewRegionDiff: true,
        shapes: [],
        copy: [
          plain('Document'),
          code(contentType || 'null'),
          plain('Request'),
        ],
      },
      toCommands(choices: IPatchChoices): CQRSCommand[] {
        if (choices?.includeNewBody) {
          return commands;
        } else return [];
      },
    };
  } else if (udiff.isA(DiffTypes.UnmatchedResponseBodyContentType)) {
    const { contentType, statusCode } =
      location.data.type === 'response'
        ? location.data
        : {
            contentType: '',
            statusCode: 0,
          };
    //learn status code too.... currently missing
    const learnedResponseBody = learnedBodies.responses.find(
      (i) => i.contentType === contentType && i.statusCode === statusCode
    );

    if (!learnedResponseBody) {
      console.error(
        `Could not learn body for response with status code ${statusCode} content type ${contentType}`
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
          assertion: [],
          interactionPointers: udiff.interactions,
          invalid: true,
          jsonTrailsByInteractions: {},
          title: `${statusCode} ${contentType} Response`,
        },
      ],
      diffDescription: descriptionForNewRegions(udiff, location),
      updateSpecChoices: {
        includeNewBody: true,
        isNewRegionDiff: true,
        shapes: [],
        copy: [
          plain('Document'),
          code(statusCode.toString()),
          plain('Response'),
        ],
      },
      toCommands(choices: IPatchChoices): CQRSCommand[] {
        if (choices?.includeNewBody) {
          return commands;
        } else return [];
      },
    };
  } else if (udiff.isA(DiffTypes.UnmatchedQueryParameters)) {
    const commands = learnedBodies.queryParameters
      ? learnedBodies.queryParameters.commands
      : [];
    if (!learnedBodies.queryParameters) {
      console.error(
        `UnmatchedQueryParameters did not have a learnedBody for queryParameters`
      );
    }
    return {
      previewTabs: [
        {
          assertion: [],
          interactionPointers: udiff.interactions,
          invalid: true,
          jsonTrailsByInteractions: {},
          title: 'Query Parameters',
        },
      ],
      diffDescription: descriptionForNewRegions(udiff, location),
      updateSpecChoices: {
        includeNewBody: true,
        isNewRegionDiff: true,
        shapes: [],
        copy: [plain('Document Query Parameters')],
      },
      toCommands(choices: IPatchChoices): CQRSCommand[] {
        if (choices?.includeNewBody) {
          return commands;
        } else return [];
      },
    };
  }

  throw new Error('new regions must match either a request or a response');
}
