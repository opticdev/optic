import { CapturedInteraction } from '../../captures';
import { Operation } from '..';
import { OperationDiffResult } from './result';
import { OperationQueries } from '../queries';
import { OpenAPIV3, SpecFactsIterable } from '../../specs';
import { visitRequestBody, visitResponses } from './visitors/index';
import { visitPath, visitMethod } from './visitors/index';
import { Some, None } from 'ts-results';

export class OperationInteractionDiffTraverser {
  private interaction?: CapturedInteraction;
  private operation?: Operation;

  traverse(interaction, operation) {
    this.interaction = interaction;
    this.operation = operation;
  }

  *results(): IterableIterator<OperationDiffResult> {
    if (!this.interaction || !this.operation) return;

    const { operation, interaction } = this;

    yield* visitRequestBody(interaction.request, operation.requestBody);

    yield* visitResponses(interaction.response, operation.responses);
  }
}

export class SpecOperationDiffTraverser {
  private operation?: {
    pathPattern: string;
    methods: OpenAPIV3.HttpMethods[];
  };
  private spec?: OpenAPIV3.Document;
  private queries?: OperationQueries;

  traverse(operation, spec) {
    this.operation = operation;
    this.spec = spec;
    // TODO: figure out whether the cost of rebuilding queries from facts for each
    // traversal is acceptable
    let facts = SpecFactsIterable.fromOpenAPISpec(spec);
    this.queries = OperationQueries.fromFacts(facts);
  }

  *results(): IterableIterator<OperationDiffResult> {
    if (!this.operation || !this.queries || !this.spec) return;
    const { operation, queries, spec } = this;

    let pathPatternOption = queries
      .findPathPattern(operation.pathPattern)
      .expect('path pattern should be able to be matched against spec');

    let pathSpecOption = pathPatternOption.map(
      (pathPattern): OpenAPIV3.PathItemObject => spec.paths[pathPattern]!
    );

    yield* visitPath(operation.pathPattern, pathSpecOption, {
      pathPattern: pathPatternOption,
    });

    if (pathSpecOption.some && pathPatternOption.some) {
      let pathSpec = pathSpecOption.val;
      let pathPattern = pathPatternOption.val;

      for (let method of operation.methods) {
        let methodSpec = pathSpec[method];

        yield* visitMethod(method, methodSpec ? Some(methodSpec) : None, {
          pathPattern,
        });
      }
    }
  }
}
