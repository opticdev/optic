import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { UndocumentedOperation, UndocumentedOperationType } from '..';
import { OpenAPIV3 } from '../../specs';
import { diffOperationWithSpec, OperationDiffResultKind } from '../diffs';

export interface UndocumentedOperations
  extends AsyncIterable<UndocumentedOperation> {}

export class UndocumentedOperations {
  static async *fromPairs(
    operations: AsyncIterable<{
      pathPattern: string;
      methods: OpenAPIV3.HttpMethods[];
    }>,
    spec: OpenAPIV3.Document,
    specUpdates?: AsyncIterable<OpenAPIV3.Document>
  ): UndocumentedOperations {
    const specUpdatesIterator =
      specUpdates && specUpdates[Symbol.asyncIterator]();

    for await (let operation of operations) {
      // TODO: figure out whether we can create queries once and update it incrementally,
      // recreating these facts constantly can get expens ive

      let diffs = diffOperationWithSpec(operation, spec);
      let yieldedResult = false; // needed as we're basically filtering

      for (let diff of diffs) {
        if (diff.kind === OperationDiffResultKind.UnmatchedPath) {
          yieldedResult = true;
          yield {
            type: UndocumentedOperationType.MissingPath,
            pathPattern: diff.subject,
            methods: operation.methods,
            specPath: jsonPointerHelpers.compile(['paths', diff.subject]),
          };
        } else if (diff.kind === OperationDiffResultKind.UnmatchedMethod) {
          yieldedResult = true;
          yield {
            type: UndocumentedOperationType.MissingMethod,
            pathPattern: diff.pathPattern,
            method: diff.subject,
            specPath: jsonPointerHelpers.compile([
              'paths',
              diff.pathPattern,
              diff.subject,
            ]),
          };
        }
      }

      if (specUpdatesIterator && yieldedResult) {
        let newSpec = await specUpdatesIterator.next();
        spec = newSpec.value;
      }
    }
  }
}
