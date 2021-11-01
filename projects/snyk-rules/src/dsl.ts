import { OpenApiEndpointFact } from "@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/OpenAPITraverser";
import { EntityRule } from "@useoptic/api-checks";

export interface SynkApiCheckContext {}

export interface ApiChangeLocationContext {
  inRequest: boolean;
  inResponse: boolean;
}

export interface SnykEntityRule<T>
  extends EntityRule<T, ApiChangeLocationContext, SynkApiCheckContext> {}

export interface SnykApiCheckDsl {
  operations: SnykEntityRule<OpenApiEndpointFact>;
}

const a = {} as SnykApiCheckDsl;

// a.operations.requirement.must("have a thing happen to them", (op) => {
//   op.
// });
