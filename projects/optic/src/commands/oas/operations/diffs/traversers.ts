import { OperationDiffResult } from '../../../capture/patches/patchers/spec/types';
import {
  OperationQueries,
  specToOperations,
} from '../../../capture/operations/queries';
import { OpenAPIV3 } from '../../specs';
import { visitPath, visitMethod } from './visitors/index';
import { Some, None } from 'ts-results';

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
    this.queries = new OperationQueries(specToOperations(spec));
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
