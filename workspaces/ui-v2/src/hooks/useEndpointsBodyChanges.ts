import { useSpectacleQuery } from '<src>/contexts/spectacle-provider';
import { IChanges } from '<src>/pages/changelog/IChanges';

// TODO add in changes for query parameters?
const EndpointBodyChangesQuery = `
query X($sinceBatchCommitId: String) {
  requests {
    id
    changes(sinceBatchCommitId: $sinceBatchCommitId) {
      added
      changed
    }
    responses {
      id
      changes(sinceBatchCommitId: $sinceBatchCommitId) {
        added
        changed
      }
    }
  }
}`;

type EndpointBodyChanges = Record<string, IChanges>;
type EndpointBodyChangeQueryResults = {
  requests: {
    id: string;
    changes: IChanges;
    responses: {
      id: string;
      changes: IChanges;
    }[];
  }[];
};
type EndpointBodyChangeQueryInput = {
  sinceBatchCommitId?: string;
};

const convertQueryToChanges = (
  requests: EndpointBodyChangeQueryResults['requests']
): EndpointBodyChanges => {
  const bodyChanges: EndpointBodyChanges = {};
  for (const request of requests) {
    bodyChanges[request.id] = request.changes;
    for (const response of request.responses) {
      bodyChanges[response.id] = response.changes;
    }
  }
  return bodyChanges;
};

export function useEndpointsBodyChanges(
  sinceBatchCommitId?: string
): EndpointBodyChanges {
  const queryResults = useSpectacleQuery<
    EndpointBodyChangeQueryResults,
    EndpointBodyChangeQueryInput
  >({
    query: EndpointBodyChangesQuery,
    variables: {
      sinceBatchCommitId,
    },
  });

  return convertQueryToChanges(queryResults.data?.requests || []);
}
