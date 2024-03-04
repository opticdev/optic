import { DocumentedInteraction, Operation } from '..';
import { OpenAPIV3 } from '../../specs';
import {
  OperationQueries,
  specToOperations,
} from '../../../capture/operations/queries';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Option, Some, None } from 'ts-results';
import { ParsedOperation } from '../../diffing/document';
import { CapturedInteractions } from '../../../capture/sources/captured-interactions';
import { FlatOpenAPIV3, FlatOpenAPIV3_1 } from '@useoptic/openapi-utilities';

export interface DocumentedInteractions
  extends AsyncIterable<DocumentedInteraction> {}

export class DocumentedInteractions {
  static async *fromCapturedInteractions(
    interactions: CapturedInteractions,
    spec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document,
    specUpdates?: AsyncIterable<
      FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document
    >,
    isAddAll: boolean = true,
    filterToOperations: ParsedOperation[] = []
  ): AsyncIterable<Option<DocumentedInteraction>> {
    // assumption: no new operations will be added over the life-time of this stream
    const queries = new OperationQueries(specToOperations(spec));

    const specUpdatesIterator =
      specUpdates && specUpdates[Symbol.asyncIterator]();

    for await (let interaction of interactions) {
      // find matching interaction operation by matching path and method
      const matchedOperationResult = queries.findOperation(
        interaction.request.path,
        interaction.request.method
      );

      if (matchedOperationResult.err) {
        console.warn(
          'Could not conclusively match interaction to operation from spec:',
          matchedOperationResult.val
        );
        yield None;
        continue;
      } else if (matchedOperationResult.val.none) {
        yield None;
        continue; // no match
      }
      const matchedOperation = matchedOperationResult.unwrap().unwrap();
      const specPath = jsonPointerHelpers.compile([
        'paths',
        matchedOperation.pathPattern,
        matchedOperation.method,
      ]);
      let operationObject = jsonPointerHelpers.get(
        spec,
        specPath
      ) as OpenAPIV3.OperationObject; // given the validation we've done above, this should be safe

      if (
        isAddAll ||
        (filterToOperations.length &&
          filterToOperations.some(
            (op) =>
              op.pathPattern === matchedOperation.pathPattern &&
              op.methods.some((method) => matchedOperation.method)
          ))
      ) {
        yield Some({
          interaction,
          operation: Operation.fromOperationObject(
            matchedOperation.pathPattern,
            matchedOperation.method,
            operationObject
          ),
          specJsonPath: specPath,
        });
      } else {
        yield None;
        continue; // matched but skipped
      }
      if (specUpdatesIterator) {
        let newSpec = await specUpdatesIterator.next();
        spec = newSpec.value;
      }
    }
  }
}
