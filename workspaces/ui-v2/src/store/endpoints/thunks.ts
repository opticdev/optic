import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { ChangeType, IEndpoint } from '<src>/types';

// All endpoints
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
      rootShapeId
      isRemoved
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

const AllEndpointsQueryWithChanges = `
query X($sinceBatchCommitId: String) {
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
      rootShapeId
      isRemoved
    }
    bodies {
      contentType
      rootShapeId
    }
    changes(sinceBatchCommitId: $sinceBatchCommitId) {
      added
      changed
    }
    responses {
      id
      statusCode
      contributions
      bodies {
        contentType
        rootShapeId
      }
      changes(sinceBatchCommitId: $sinceBatchCommitId) {
        added
        changed
      }  
    }
  }
}`;

type HttpBody = {
  contentType: string;
  rootShapeId: string;
};

type ChangesResponse = {
  added: boolean;
  changed: boolean;
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
    changes?: ChangesResponse;
    query?: {
      rootShapeId: string;
      isRemoved: boolean;
    };
    responses: {
      id: string;
      statusCode: number;
      contributions: Record<string, string>;
      bodies: HttpBody[];
      changes?: ChangesResponse;
    }[];
  }[];
};

const mapChangeToChangeType = (changes: ChangesResponse): ChangeType | null => {
  return changes.added ? 'added' : changes.changed ? 'updated' : null;
};

export const endpointQueryResultsToJson = ({
  requests,
}: EndpointQueryResults): {
  endpoints: IEndpoint[];
  changes: Record<string, ChangeType>;
} => {
  const changes: Record<string, ChangeType> = {};
  const endpoints = requests.map((request) => {
    if (request.changes) {
      const changeType = mapChangeToChangeType(request.changes);
      if (changeType) {
        changes[request.id] = changeType;
      }
    }
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
      query: request.query || null,
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
          if (response.changes) {
            const changeType = mapChangeToChangeType(response.changes);
            if (changeType) {
              changes[response.id] = changeType;
            }
          }
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

  return { endpoints, changes };
};

export const fetchEndpoints = createAsyncThunk<
  ReturnType<typeof endpointQueryResultsToJson>,
  { spectacle: IForkableSpectacle; sinceBatchCommitId?: string }
>('FETCH_ENDPOINTS', async ({ spectacle, sinceBatchCommitId }) => {
  try {
    const results = await spectacle.query<
      EndpointQueryResults,
      {
        sinceBatchCommitId?: string;
      }
    >({
      query: sinceBatchCommitId
        ? AllEndpointsQueryWithChanges
        : AllEndpointsQuery,
      variables: { sinceBatchCommitId },
    });
    if (results.errors) {
      console.error(results.errors);
      throw new Error(JSON.stringify(results.errors));
    }
    return endpointQueryResultsToJson(results.data!);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw e;
  }
});
