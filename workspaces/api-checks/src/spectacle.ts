import fs from 'fs';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import OpticEngine from '@useoptic/optic-engine-wasm';
import { makeSpectacle } from '@useoptic/spectacle';

export default class Spectacle {
  constructor(public spectacle: any) {}

  static async fromFile(filename: string) {
    const events = JSON.parse(fs.readFileSync(filename).toString());
    return await Spectacle.fromEvents(events);
  }

  static async fromEvents(events: any[]) {
    const initialOpticContext = await InMemoryOpticContextBuilder.fromEvents(
      OpticEngine,
      events
    );
    const spectacle = await makeSpectacle(initialOpticContext);
    return new Spectacle(spectacle);
  }

  async getEndpointChanges(sinceBatchCommitId: string) {
    return await this.spectacle.queryWrapper({
      query: `query GetEndpointChanges($sinceBatchCommitId: String!) {
        endpointChanges(sinceBatchCommitId: $sinceBatchCommitId) {
          endpoints {
            change {
              category
            }
            pathId
            path
            method
          }
        }
      }`,
      variables: { sinceBatchCommitId },
    });
  }

  async getMatchingRequest(endpointChange: any) {
    return (
      await this.spectacle.queryWrapper({
        query: `{
        requests {
          absolutePathPatternWithParameterNames
          method
          pathId
          responses {
            id
            statusCode
          }
        }
      }`,
        variables: {},
      })
    ).data.requests.find(
      (request: any) =>
        request.pathId === endpointChange.pathId &&
        request.method === endpointChange.method
    );
  }

  async getBatchCommits() {
    return await this.spectacle.queryWrapper({
      query: `{
        batchCommits {
          createdAt
          batchId
        }
      }`,
      variables: {},
    });
  }
}

export async function getSinceBatchCommitId(
  specFilename: string
): Promise<string> {
  const baseSpec = JSON.parse(fs.readFileSync(specFilename).toString());
  const spectacle = await Spectacle.fromEvents(baseSpec);
  const batchCommitResults = await spectacle.getBatchCommits();
  return batchCommitResults.data?.batchCommits?.reduce(
    (result: any, batchCommit: any) => {
      return batchCommit.createdAt > result.createdAt ? batchCommit : result;
    }
  ).batchId as string;
}
