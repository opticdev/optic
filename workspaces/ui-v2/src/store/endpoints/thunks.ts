import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { IEndpoint } from '<src>/types';

// All endpoints
export const AllEndpointsQuery = `{
  requests {
    id
    pathId
    absolutePathPattern
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

type HttpBody = {
  contentType: string;
  rootShapeId: string;
};

export type EndpointQueryResults = {
  requests: {
    id: string;
    pathId: string;
    absolutePathPattern: string;
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
      rootShapeId: string;
      isRemoved: boolean;
    };
    responses: {
      id: string;
      statusCode: number;
      contributions: Record<string, string>;
      bodies: HttpBody[];
    }[];
  }[];
};

export const endpointQueryResultsToJson = ({
  requests,
}: EndpointQueryResults): IEndpoint[] =>
  requests.map((request) => ({
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
    requestBody:
      request.bodies.length > 0
        ? {
            requestId: request.id,
            contentType: request.bodies[0].contentType,
            rootShapeId: request.bodies[0].rootShapeId,
            pathId: request.pathId,
            method: request.method,
            description: request.requestContributions.description || '',
          }
        : null,
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
  }));

export const fetchEndpoints = createAsyncThunk<
  ReturnType<typeof endpointQueryResultsToJson>,
  { spectacle: IForkableSpectacle }
>('FETCH_ENDPOINTS', async ({ spectacle }) => {
  try {
    const results = await spectacle.query<EndpointQueryResults>({
      query: AllEndpointsQuery,
      variables: {},
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
