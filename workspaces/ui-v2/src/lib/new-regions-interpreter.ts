import * as Sentry from '@sentry/react';

import {
  CurrentSpecContext,
  IInterpretation,
  IPatchChoices,
} from './Interfaces';
import { ParsedDiff, DiffLocation } from './parse-diff';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { DiffTypes } from '@useoptic/cli-shared/build/diffs/diffs';
import { IOpticDiffService } from '@useoptic/spectacle';
import { CQRSCommand } from '@useoptic/optic-domain';
import { code, plain } from '<src>/pages/diffs/components/ICopyRender';
import { descriptionForNewRegions } from '<src>/lib/diff-description-interpreter';

//only ever take 1 diff at a time
export async function newRegionInterpreters(
  diff: ParsedDiff,
  opticDiffService: IOpticDiffService,
  currentSpecContext: CurrentSpecContext
): Promise<IInterpretation | null> {
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
  return null;
}

// TODO QPB - move IInterpretation generation into ParsedDiff
function newContentType(
  udiff: ParsedDiff,
  location: DiffLocation,
  learnedBodies: ILearnedBodies
): IInterpretation | null {
  if (udiff.isA(DiffTypes.UnmatchedRequestBodyContentType)) {
    const requestDescriptor = location.getRequestDescriptor();
    const contentType = requestDescriptor ? requestDescriptor.contentType : '';
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
      return null;
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
    const responseDescriptor = location.getResponseDescriptor();
    const { contentType, statusCode } = responseDescriptor
      ? responseDescriptor
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
      return null;
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
