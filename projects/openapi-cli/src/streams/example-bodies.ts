import { IFact, OpenApiFact } from '@useoptic/openapi-utilities';

import * as Facts from './facts';

export type ExampleBody = {};

export async function* fromOpenAPIFacts(
  facts: AsyncIterable<IFact<OpenApiFact>>
): AsyncIterable<ExampleBody> {
  let exampleFacts = Facts.bodyExamples(facts);

  for await (let exampleFact of exampleFacts) {
    yield {}; // TODO: map example fact to an ExampleBody once we figure out what that is
  }
}
