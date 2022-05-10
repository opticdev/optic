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
  ): AsyncIterable<DocumentedInteraction> {
    // assumption: no new operations will be added over the life-time of this stream
    const facts = SpecFacts.fromOpenAPISpec(spec);
    const operationFacts = await collect(SpecFacts.operationFacts(facts));
    const queries = OperationQueries.fromFacts(operationFacts);

    const specUpdatesIterator =
      specUpdates && specUpdates[Symbol.asyncIterator]();

    for await (let interaction of interactions) {
      // find matching interaction operation by matching path and method
      const matchedOperationResult = queries.findSpecPath(
        interaction.request.path,
        interaction.request.method
      );

      if (matchedOperationResult.err) {
        console.warn(
          'Could not conclusively match interaction to operation from spec:',
          matchedOperationResult.val
        );
        continue;
      } else if (matchedOperationResult.val.none) {
        continue; // no match
      }
      const matchedOperation = matchedOperationResult.unwrap().unwrap();

      let operation = jsonPointerHelpers.get(
        spec,
        matchedOperation.specPath
      ) as OpenAPIV3.OperationObject; // given the validation we've done above, this should be safe

      yield {
        interaction,
        operation: {
          pathPattern: matchedOperation.pathPattern,
          method: matchedOperation.method,
          ...operation,
        },
        specJsonPath: matchedOperation.specPath,
      };

      if (specUpdatesIterator) {
        let newSpec = await specUpdatesIterator.next();
        spec = newSpec.value;
      }
    }
  }
}
