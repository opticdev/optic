import {
  OpenAPIV3,
  OpenAPITraverser,
  IFact,
  OpenApiFact,
  OpenApiBodyExampleFact,
  OpenApiKind,
} from '@useoptic/openapi-utilities';

export async function* fromOpenAPISpec(
  spec: OpenAPIV3.Document
): AsyncIterable<IFact<OpenApiFact>> {
  const traverser = new OpenAPITraverser();
  traverser.traverse(spec);
  yield* traverser.facts();
}

export async function* bodyExamples(
  facts: AsyncIterable<IFact<OpenApiFact>>
): AsyncIterable<IFact<OpenApiBodyExampleFact>> {
  for await (let fact of facts) {
    if (fact.location.kind === OpenApiKind.BodyExample) {
      yield fact as IFact<OpenApiBodyExampleFact>;
    }
  }
}
