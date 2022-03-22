import {
  OpenAPIV3,
  OpenAPITraverser,
  IFact,
  OpenApiFact,
  OpenApiBodyExampleFact,
  OpenApiKind,
  OpenApiBodyFact,
  OpenApiComponentSchemaExampleFact,
} from '@useoptic/openapi-utilities';

export interface SpecFacts extends AsyncIterable<IFact<OpenApiFact>> {}
export interface BodyExampleFacts
  extends AsyncIterable<IFact<OpenApiBodyExampleFact>> {}
export interface BodyFacts extends AsyncIterable<IFact<OpenApiBodyFact>> {}
export interface ComponentSchemaExampleFacts
  extends AsyncIterable<IFact<OpenApiComponentSchemaExampleFact>> {}

export type BodyExampleFact = IFact<OpenApiBodyExampleFact>;
export type ComponentSchemaExampleFact =
  IFact<OpenApiComponentSchemaExampleFact>;

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

  static async *componentSchemaExamples(
    facts: AsyncIterable<IFact<OpenApiFact>>
  ): ComponentSchemaExampleFacts {
    for await (let fact of facts) {
      if (fact.location.kind === OpenApiKind.ComponentSchemaExample) {
        yield fact as IFact<OpenApiComponentSchemaExampleFact>;
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

export class BodyExampleFacts {}
export class ComponentSchemaExampleFacts {}
