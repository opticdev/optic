import { IFact, OpenApiFact } from '@useoptic/openapi-utilities';
import { forkable } from '../../lib/async-tools';

import * as Facts from '../../specs/streams/facts';
import { DocumentedBody } from '../body';

export async function* fromBodyExampleFacts(
  facts: AsyncIterable<IFact<OpenApiFact>>
): AsyncIterable<DocumentedBody> {
  let forkableFacts = forkable(facts);
  let exampleFacts = Facts.bodyExamples(forkableFacts.fork());

  forkableFacts.start();

  for await (let exampleFact of exampleFacts) {
    // const exampleBody =
    // TODO: parse string-encoded json for json content types
    // yield {
    //   contentType: exampleFact.value.contentType,
    //   value: exampleFact.value.value,
    // };
  }
}
