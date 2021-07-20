import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { ChangeType, IEndpoint } from '<src>/types';
import { getEndpointId } from '<src>/utils';

export const AllEndpointsQuery = `{
  endpoints {
    id
    pathId
    method
    pathComponents {
      id
      name
      isParameterized
      contributions
      isRemoved
    }
    pathPattern
    query {
      id
      rootShapeId
      isRemoved
      contributions
    }
    requests {
      id
      body {
        contentType
        rootShapeId
      }
      contributions
      isRemoved
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
    isRemoved
    contributions
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
  endpoints: {
    id: string;
    pathId: string;
    method: string;
    pathPattern: string;
    pathComponents: {
      id: string;
      name: string;
      isParameterized: boolean;
      contributions: Record<string, string>;
      isRemoved: boolean;
    }[];
    query?: {
      id: string;
      rootShapeId: string;
      isRemoved: boolean;
      contributions: Record<string, string>;
    };
    requests: {
      id: string;
      body?: HttpBody;
      contributions: Record<string, string>;
      isRemoved: boolean;
    }[];
    responses: {
      id: string;
      statusCode: number;
      contributions: Record<string, string>;
      bodies: HttpBody[];
    }[];
    isRemoved: boolean;
    contributions: Record<string, string>;
  }[];
};

export const endpointQueryResultsToJson = (
  { endpoints }: EndpointQueryResults,
  endpointChanges: EndpointChangeQueryResults | null
): {
  endpoints: IEndpoint[];
  changes: Record<string, ChangeType>;
} => {
  const changes: Record<string, ChangeType> = {};
  const mappedEndpoints = endpoints.map((endpoint) => ({
    id: endpoint.id,
    pathId: endpoint.pathId,
    method: endpoint.method,
    description: endpoint.contributions.description || '',
    purpose: endpoint.contributions.purpose || '',
    isRemoved: endpoint.isRemoved,
    fullPath: endpoint.pathPattern,
    pathParameters: endpoint.pathComponents.map((path) => ({
      id: path.id,
      name: path.name,
      isParameterized: path.isParameterized,
      description: path.contributions.description || '',
      endpointId: endpoint.id,
    })),
    query: endpoint.query
      ? {
          queryParametersId: endpoint.query.id,
          rootShapeId: endpoint.query.rootShapeId,
          isRemoved: endpoint.query.isRemoved,
          description: endpoint.query.contributions.description || '',
          endpointId: endpoint.id,
          pathId: endpoint.pathId,
          method: endpoint.method,
        }
      : null,
    requests: endpoint.requests.map((request) => ({
      requestId: request.id,
      body: request.body
        ? {
            rootShapeId: request.body.rootShapeId,
            contentType: request.body.contentType,
          }
        : null,
      description: request.contributions.description || '',
      endpointId: endpoint.id,
      pathId: endpoint.pathId,
      method: endpoint.method,
    })),
    responses: endpoint.responses
      .map((response) => ({
        responseId: response.id,
        statusCode: response.statusCode,
        description: response.contributions.description || '',
        endpointId: endpoint.id,
        pathId: endpoint.pathId,
        method: endpoint.method,
        bodies: response.bodies.map((body) => ({
          rootShapeId: body.rootShapeId,
          contentType: body.contentType,
        })),
      }))
      .sort((a, b) => a.statusCode - b.statusCode),
  }));

  if (endpointChanges) {
    endpointChanges.endpointChanges.endpoints.forEach(
      ({ pathId, method, change }) => {
        const endpointId = getEndpointId({ pathId, method });
        changes[endpointId] = change.category;
      }
    );
  }

  return { endpoints: mappedEndpoints, changes };
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
