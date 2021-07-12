import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { ChangeType, IEndpoint } from '<src>/types';
import { getEndpointId } from '<src>/utils';

// TODO QPB - figure out a better way to keep this in sync with the local-cli status command
export const AllEndpointsQuery = `{
  requests {
    id
    pathId
    absolutePathPatternWithParameterNames
    pathComponents {
      id
      name
      isParameterized
      contributions
      isRemoved
    }
    method
    pathContributions
    requestContributions
    isRemoved
    query {
      id
      rootShapeId
      isRemoved
      contributions
    }
    bodies {
      contentType
      rootShapeId
    }
    responses {
      id
      statusCode
      contributions
      bodies {
        contentType
        rootShapeId
      }
    }
  }
}`;

export const EndpointChangeQuery = `query X($sinceBatchCommitId: String) {
  endpointChanges(sinceBatchCommitId: $sinceBatchCommitId) {
    endpoints {
      change {
        category
      }
      pathId
      method
    }
  }
}`;

type EndpointChangelog = {
  change: {
    category: ChangeType;
  };
  pathId: string;
  method: string;
};

type EndpointChangeQueryResults = {
  endpointChanges: {
    endpoints: EndpointChangelog[];
  };
};

type HttpBody = {
  contentType: string;
  rootShapeId: string;
};

export type EndpointQueryResults = {
  requests: {
    id: string;
    pathId: string;
    absolutePathPatternWithParameterNames: string;
    pathComponents: {
      id: string;
      name: string;
      isParameterized: boolean;
      contributions: Record<string, string>;
      isRemoved: boolean;
    }[];
    method: string;
    pathContributions: Record<string, string>;
    requestContributions: Record<string, string>;
    isRemoved: boolean;
    bodies: HttpBody[];
    query?: {
      id: string;
      rootShapeId: string;
      isRemoved: boolean;
      contributions: Record<string, string>;
    };
    responses: {
      id: string;
      statusCode: number;
      contributions: Record<string, string>;
      bodies: HttpBody[];
    }[];
  }[];
};

export const endpointQueryResultsToJson = (
  { requests }: EndpointQueryResults,
  endpointChanges: EndpointChangeQueryResults | null
): {
  endpoints: IEndpoint[];
  changes: Record<string, ChangeType>;
} => {
  const changes: Record<string, ChangeType> = {};
  const endpoints = requests.map((request) => {
    return {
      pathId: request.pathId,
      method: request.method,
      fullPath: request.absolutePathPatternWithParameterNames,
      pathParameters: request.pathComponents.map((path) => ({
        id: path.id,
        name: path.name,
        isParameterized: path.isParameterized,
        description: path.contributions.description || '',
        endpointId: `${request.pathId}.${request.method}`,
      })),
      description: request.pathContributions.description || '',
      purpose: request.pathContributions.purpose || '',
      isRemoved: request.isRemoved,
      query: request.query
        ? {
            queryParametersId: request.query.id,
            rootShapeId: request.query.rootShapeId,
            isRemoved: request.query.isRemoved,
            description: request.query.contributions.description || '',
          }
        : null,
      requestBodies: request.bodies.map((body) => ({
        requestId: request.id,
        contentType: body.contentType,
        rootShapeId: body.rootShapeId,
        pathId: request.pathId,
        method: request.method,
        description: request.requestContributions.description || '',
      })),
      responseBodies: request.responses
        .flatMap((response) => {
          return response.bodies.map((body) => {
            return {
              statusCode: response.statusCode,
              responseId: response.id,
              contentType: body.contentType,
              rootShapeId: body.rootShapeId,
              pathId: request.pathId,
              method: request.method,
              description: response.contributions.description || '',
            };
          });
        })
        .sort((a, b) => a.statusCode - b.statusCode),
    };
  });

  if (endpointChanges) {
    endpointChanges.endpointChanges.endpoints.forEach(
      ({ pathId, method, change }) => {
        const endpointId = getEndpointId({ pathId, method });
        changes[endpointId] = change.category;
      }
    );
  }

  return { endpoints, changes };
};

export const fetchEndpoints = createAsyncThunk<
  ReturnType<typeof endpointQueryResultsToJson>,
  { spectacle: IForkableSpectacle; sinceBatchCommitId?: string }
>('FETCH_ENDPOINTS', async ({ spectacle, sinceBatchCommitId }) => {
  try {
    const resultsPromise = spectacle.query<EndpointQueryResults>({
      query: AllEndpointsQuery,
      variables: {},
    });

    const endpointChangesPromise = sinceBatchCommitId
      ? spectacle.query<
          EndpointChangeQueryResults,
          {
            sinceBatchCommitId?: string;
          }
        >({
          query: EndpointChangeQuery,
          variables: { sinceBatchCommitId },
        })
      : Promise.resolve(null);

    const [results, endpointChanges] = await Promise.all([
      resultsPromise,
      endpointChangesPromise,
    ]);

    if (results.errors) {
      console.error(results.errors);
      throw new Error(JSON.stringify(results.errors));
    }
    if (endpointChanges && endpointChanges.errors) {
      console.error(endpointChanges.errors);
      throw new Error(JSON.stringify(endpointChanges.errors));
    }
    return endpointQueryResultsToJson(
      results.data!,
      endpointChanges?.data || null
    );
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw e;
  }
});
