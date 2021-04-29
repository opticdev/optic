import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';
import { IChanges } from '../changelog/IChanges';

export function useEndpointBody(
  pathId: string,
  method: string,
  renderChangesSince?: string
): { requests: IRequestBody[]; responses: IResponseBody[] } {
  const spectacleInput =
    typeof renderChangesSince === 'undefined'
      ? {
          query: `{
    requests {
      id
      pathId
      method
      requestContributions
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
    }`,
          variables: {},
        }
      : {
          query: `query X($sinceBatchCommitId: String) {
    requests {
      id
      pathId
      method
      requestContributions
      changes(sinceBatchCommitId: $sinceBatchCommitId) {
        added
        changed
      }
      bodies {
        contentType
        rootShapeId
      }
      responses {
        id
        statusCode
        contributions
        changes(sinceBatchCommitId: $sinceBatchCommitId) {
          added
          changed
        }
        bodies {
          contentType
          rootShapeId
        }
      }
    }
    }`,
          variables: {
            sinceBatchCommitId: renderChangesSince,
          },
        };

  const { data, error } = useSpectacleQuery(spectacleInput);
  if (error) {
    console.error(error);
    debugger;
  }
  if (!data) {
    return { requests: [], responses: [] };
  } else {
    const request = data.requests.find(
      (i: any) => i.pathId === pathId && i.method === method
    );
    if (!request) {
      return { requests: [], responses: [] };
    }
    const requests: IRequestBody[] = request.bodies.map((body: any) => {
      return {
        requestId: request.id,
        contentType: body.contentType,
        rootShapeId: body.rootShapeId,
        pathId: request.pathId,
        method: request.method,
        changes: request.changes,
        description: request.requestContributions.description || '',
      };
    });
    const responses: IResponseBody[] = request.responses.flatMap(
      (response: any) => {
        return response.bodies.map((body: any) => {
          return {
            statusCode: response.statusCode,
            responseId: response.id,
            contentType: body.contentType,
            rootShapeId: body.rootShapeId,
            pathId: request.pathId,
            method: request.method,
            changes: response.changes,
            description: request.requestContributions.description || '',
          };
        });
      }
    );

    return { requests, responses };
  }
}

export interface IRequestBody {
  requestId: string;
  contentType: string;
  rootShapeId: string;
  pathId: string;
  method: string;
  description: string;
  changes?: IChanges;
}

export interface IResponseBody {
  responseId: string;
  statusCode: number;
  contentType: string;
  rootShapeId: string;
  pathId: string;
  method: string;
  description: string;
  changes?: IChanges;
}
