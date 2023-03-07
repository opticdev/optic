import { DocumentedInteraction, Operation } from '..';
import { CapturedInteractions } from '../../captures';
import { OpenAPIV3, SpecFacts } from '../../specs';
import { OperationQueries } from '../queries';
import { collect } from '../../lib/async-tools';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Option, Some, None } from 'ts-results';

export interface DocumentedInteractions
  extends AsyncIterable<DocumentedInteraction> {}

export class DocumentedInteractions {
  static async *fromCapturedInteractions(
    interactions: CapturedInteractions,
    spec: OpenAPIV3.Document,
    specUpdates?: AsyncIterable<OpenAPIV3.Document>
  ): AsyncIterable<Option<DocumentedInteraction>> {
    // assumption: no new operations will be added over the life-time of this stream
    const facts = await collect(SpecFacts.fromOpenAPISpec(spec));
    const queries = OperationQueries.fromFacts(facts);

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

      let operationObject = jsonPointerHelpers.get(
        spec,
        matchedOperation.specPath
      ) as OpenAPIV3.OperationObject; // given the validation we've done above, this should be safe

      yield Some({
        interaction,
        operation: Operation.fromOperationObject(
          matchedOperation.pathPattern,
          matchedOperation.method,
          operationObject
        ),
        specJsonPath: matchedOperation.specPath,
      });

      if (specUpdatesIterator) {
        let newSpec = await specUpdatesIterator.next();
        spec = newSpec.value;
      }
    }
  }
}
