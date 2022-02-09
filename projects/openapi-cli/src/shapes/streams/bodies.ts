import { IFact, OpenApiFact } from '@useoptic/openapi-utilities';

import * as Facts from './facts';
import { Body } from '../events/body';

export async function* fromBodyExampleFacts(
  facts: AsyncIterable<IFact<OpenApiFact>>
): AsyncIterable<Body> {
  let exampleFacts = Facts.bodyExamples(facts);

  for await (let exampleFact of exampleFacts) {
    // TODO: parse string-encoded json for json content types
    yield {
      contentType: exampleFact.value.contentType,
      value: exampleFact.value.value,
    };
  }
}
