import { CapturedInteraction } from '../../captures';
import { OperationQueries } from '../../operations/queries';
import { OpenAPIV3, SpecFactsIterable } from '..';
import { SpecDiffResult } from './result';
// import { visitRequestBody, visitResponses } from './visitors';

export class SpecDiffTraverser {
  private operation?: {
    pathPattern: string;
    methods: OpenAPIV3.HttpMethods[];
  };
  private queries?: OperationQueries;

  traverse(operation, spec) {
    this.operation = operation;
    // TODO: figure out whether the cost of rebuilding queries from facts for each
    // traversal is acceptable
    let facts = SpecFactsIterable.fromOpenAPISpec(spec);
    this.queries = OperationQueries.fromFacts(facts);
  }

  *results(): IterableIterator<SpecDiffResult> {
    if (!this.operation || !this.queries) return;
    const { operation, queries } = this;

    let documentedPathOption = queries
      .findPathPattern(operation.pathPattern)
      .expect('path pattern should be able to be matched against spec');

    // yield* visitPath(operation.pathPattern, documentedPathOption)

    if (documentedPathOption.some) {
      let documentedPath = documentedPathOption.val;

      for (let method of operation.methods) {
        // yield* visitMethod(method, documentedPath)
      }
    }
  }
}
