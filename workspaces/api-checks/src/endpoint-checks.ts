import path from 'path';
import Spectacle from './spectacle';
import {
  CheckFunction,
  EndpointChangeChecksOptions,
  CheckFunctionRegistry,
} from './types';

export class EndpointChangeChecks {
  public sinceBatchCommitId: string;
  public spectacle: any;
  public checks: CheckFunctionRegistry = {
    added: [],
    updated: [],
    removed: [],
  };

  constructor({ sinceBatchCommitId, spectacle }: EndpointChangeChecksOptions) {
    this.sinceBatchCommitId = sinceBatchCommitId;
    this.spectacle = spectacle;
  }

  static async withSpectacle(
    specFilename: string,
    options: { sinceBatchCommitId: string }
  ) {
    const spectacle = await Spectacle.fromFile(path.join('..', specFilename));
    return new EndpointChangeChecks({ ...options, spectacle });
  }

  on(action: keyof CheckFunctionRegistry, check: CheckFunction) {
    this.checks[action].push(check);
    return this; // for chaining
  }

  async run() {
    const endpointChangesQuery = await this.spectacle.getEndpointChanges(
      this.sinceBatchCommitId
    );
    const checkResults = new CheckResults();
    for (const endpointChange of endpointChangesQuery.data.endpointChanges
      .endpoints) {
      const matchingRequest = await this.spectacle.getMatchingRequest(
        endpointChange
      );
      for (const check of this.checks[
        endpointChange.change.category as keyof CheckFunctionRegistry
      ]) {
        const checkResult = await check({
          endpointChange,
          // We pass this in as endpoint because in the context of a check the name makes more sense
          endpoint: matchingRequest,
        });
        checkResults.handleResult(checkResult);
      }
    }
    return checkResults;
  }
}

export class CheckResults {
  constructor(public results: string[] = []) {}

  all() {
    return this.results;
  }

  handleResult(result?: string) {
    if (result) this.results.push(result);
  }

  hasFailures() {
    return Boolean(this.results.length);
  }
}

// export function displayResults(results: CheckResults) {
//   if (results.hasFailures()) {
//     console.log('API checks failed');
//     for (const result of results.all()) {
//       console.log(`- ${result}`);
//     }
//   } else {
//     console.log('Passes all design guidelines');
//   }
// }
