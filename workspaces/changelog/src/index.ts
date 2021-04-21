import * as OpticEngine from '@useoptic/diff-engine-wasm/engine/build';
import { makeSpectacle } from '@useoptic/spectacle';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';

export async function generateEndpointChanges(
  initialEvents: any[] = [],
  currentEvents: any[],
): Promise<any> {
  let query;

  // We only need to add a "since" to the query if there are initial events.
  if (initialEvents.length) {
    const initialOpticContext = await InMemoryOpticContextBuilder.fromEvents(
      OpticEngine,
      initialEvents,
    );
    const initialSpectacle = await makeSpectacle(initialOpticContext);

    const batchCommitResults = await initialSpectacle({
      query: `{
        batchCommits {
          createdAt
          batchId
        }
      }`,
      variables: {},
    });

    // TODO: consider making this into a query
    const latestBatchCommit = batchCommitResults.data!.batchCommits!.reduce(
      (result: any, batchCommit: any) => {
        return batchCommit.createdAt > result.createdAt ? batchCommit : result;
      },
    );

    query = `{
      endpointChanges(sinceBatchCommitId: "${latestBatchCommit.batchId}") {
        endpoints {
          change {
            category
          }
          path
          method
        }
      }
    }`;
  } else {
    query = `{
      endpointChanges {
        endpoints {
          change {
            category
          }
          path
          method
        }
      }
    }`;
  }

  const currentOpticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    currentEvents,
  );
  const currentSpectacle = await makeSpectacle(currentOpticContext);

  return await currentSpectacle({
    query,
    variables: {},
  });
}
