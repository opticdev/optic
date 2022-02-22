import {
  OpenAPIV3,
  OpenAPITraverser,
  IFact,
  OpenApiFact,
  OpenApiBodyExampleFact,
  OpenApiKind,
  OpenApiBodyFact,
} from '@useoptic/openapi-utilities';

export interface SpecFacts extends AsyncIterable<IFact<OpenApiFact>> {}
export interface BodyExampleFacts
  extends AsyncIterable<IFact<OpenApiBodyExampleFact>> {}
export interface BodyFacts extends AsyncIterable<IFact<OpenApiBodyFact>> {}

export class SpecFacts {
  static async *fromOpenAPISpec(spec: OpenAPIV3.Document): SpecFacts {
    const traverser = new OpenAPITraverser();
    traverser.traverse(spec);
    yield* traverser.facts();
  }

  static async *bodyExamples(
    facts: AsyncIterable<IFact<OpenApiFact>>
  ): BodyExampleFacts {
    for await (let fact of facts) {
      if (fact.location.kind === OpenApiKind.BodyExample) {
        yield fact as IFact<OpenApiBodyExampleFact>;
      }
    }
  }

  static async *bodyFacts(facts: AsyncIterable<IFact<OpenApiFact>>): BodyFacts {
    for await (let fact of facts) {
      if (fact.location.kind === OpenApiKind.Body) {
        yield fact as IFact<OpenApiBodyFact>;
      }
    }
  }
}
