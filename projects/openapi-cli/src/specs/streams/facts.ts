import {
  OpenAPIV3,
  OpenAPITraverser,
  IFact,
  OpenApiKind,
  FactVariant,
  isFactVariant,
} from '@useoptic/openapi-utilities';

export interface SpecFacts extends AsyncIterable<IFact> {}
export interface SpecFactsIterable extends Iterable<IFact> {}
export interface BodyExampleFacts
  extends AsyncIterable<FactVariant<OpenApiKind.BodyExample>> {}
export interface BodyFacts
  extends AsyncIterable<FactVariant<OpenApiKind.Body>> {}
export interface ComponentSchemaExampleFacts
  extends AsyncIterable<FactVariant<OpenApiKind.ComponentSchemaExample>> {}
export interface OperationFacts
  extends AsyncIterable<FactVariant<OpenApiKind.Operation>> {}

export type BodyExampleFact = FactVariant<OpenApiKind.BodyExample>;
export type ComponentSchemaExampleFact =
  FactVariant<OpenApiKind.ComponentSchemaExample>;
export type OperationFact = FactVariant<OpenApiKind.Operation>;
export type SpecFact = FactVariant<OpenApiKind.Specification>;

export class SpecFacts {
  static async *fromOpenAPISpec(spec: OpenAPIV3.Document): SpecFacts {
    const traverser = new OpenAPITraverser();
    traverser.traverse(spec);
    yield* traverser.facts();
  }

  static async *bodyExamples(facts: AsyncIterable<IFact>): BodyExampleFacts {
    for await (let fact of facts) {
      if (isFactVariant(fact, OpenApiKind.BodyExample)) {
        yield fact;
      }
    }
  }

  static async *componentSchemaExamples(
    facts: AsyncIterable<IFact>
  ): ComponentSchemaExampleFacts {
    for await (let fact of facts) {
      if (isFactVariant(fact, OpenApiKind.ComponentSchemaExample)) {
        yield fact;
      }
    }
  }

  static async *bodyFacts(facts: AsyncIterable<IFact>): BodyFacts {
    for await (let fact of facts) {
      if (isFactVariant(fact, OpenApiKind.Body)) {
        yield fact;
      }
    }
  }

  static async *operationFacts(facts: AsyncIterable<IFact>): OperationFacts {
    for await (let fact of facts) {
      if (isFactVariant(fact, OpenApiKind.Operation)) {
        yield fact;
      }
    }
  }
}

export class SpecFactsIterable {
  static *fromOpenAPISpec(spec: OpenAPIV3.Document): SpecFactsIterable {
    const traverser = new OpenAPITraverser();
    traverser.traverse(spec);
    yield* traverser.facts();
  }
}

export class BodyExampleFacts {}
export class ComponentSchemaExampleFacts {}
export class OperationFacts {}
