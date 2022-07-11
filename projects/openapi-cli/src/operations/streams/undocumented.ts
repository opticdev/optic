import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { UndocumentedOperation, UndocumentedOperationType } from '..';
import { CapturedInteraction, CapturedInteractions } from '../../captures';
import { OpenAPIV3 } from '../../specs';
import { diffOperationWithSpec, OperationDiffResultKind } from '../diffs';
import * as AT from '../../lib/async-tools';

export interface UndocumentedOperations
  extends AsyncIterable<UndocumentedOperation> {}

interface OperationPair {
  pathPattern: string;
  methods: OpenAPIV3.HttpMethods[];
}

export class UndocumentedOperations {
  static async *fromPairs(
    operations: AsyncIterable<OperationPair>,
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

  static async *fromCapturedInteractions(
    interactions: CapturedInteractions,
    spec: OpenAPIV3.Document,
    specUpdates?: AsyncIterable<OpenAPIV3.Document>
  ): UndocumentedOperations {
    const operations = AT.map<CapturedInteraction, OperationPair>(
      (interaction) => {
        return {
          pathPattern: interaction.request.path,
          methods: [interaction.request.method],
        };
      }
    )(interactions);

    yield* UndocumentedOperations.fromPairs(operations, spec, specUpdates);
  }
}
