import {
  OpenAPIDiffingQuestions,
  QueryParameterType,
  RequestBodyMatchType,
  ResponseMatchType,
} from './types';
import {
  BodyLocation,
  IFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiRequestParameterFact,
  OpenApiResponseFact,
  OpenAPITraverser,
  OpenAPIV3,
  QueryParameterLocation,
} from '@useoptic/openapi-utilities';
import { OpenApiBodyFact } from '@useoptic/openapi-utilities/build/openapi3/sdk/types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function openApiQueries(
  document: OpenAPIV3.Document
): OpenAPIDiffingQuestions {
  const traverser = new OpenAPITraverser();
  traverser.traverse(document, { legacyAccumulate: false });
  const facts = [...traverser.facts()];

  const operations = facts
    .filter((i) => i.location.kind === OpenApiKind.Operation)
    .map((operation) => {
      const operationFact = operation.value as OpenApiOperationFact;
      return {
        path: operationFact.pathPattern,
        method: operationFact.method.toLowerCase() as OpenAPIV3.HttpMethods,
        jsonPath: operation.location.jsonPath,
      };
    });

  const responses = facts.filter(
    (i) => i.location.kind === OpenApiKind.Response
  ) as IFact<OpenApiResponseFact>[];

  const paths = operations.map((i) => i.path).sort();

  return {
    operations() {
      return operations;
    },
    paths() {
      return paths;
    },
    queryParametersForOperation(
      method: OpenAPIV3.HttpMethods,
      path: string
    ): QueryParameterType[] {
      return facts
        .filter((fact) => {
          return (
            fact.location.kind === OpenApiKind.QueryParameter &&
            fact.location.conceptualLocation.path === path &&
            fact.location.conceptualLocation.method === method
          );
        })
        .map((fact) => {
          const queryParamFact = fact.value as OpenApiRequestParameterFact;

          const query: QueryParameterType = {
            jsonPath: fact.location.jsonPath,
            name: queryParamFact.name,
            required: queryParamFact.required,
            schema: queryParamFact.schema,
            location: fact.location
              .conceptualLocation as QueryParameterLocation,
          };
          return query;
        });
    },
    requestBodiesForOperation(
      method: OpenAPIV3.HttpMethods,
      path: string
    ): RequestBodyMatchType[] {
      const requestBodyFacts = facts.filter(
        (i) =>
          i.location.kind === OpenApiKind.Body &&
          'inRequest' in i.location.conceptualLocation &&
          i.location.conceptualLocation.inRequest &&
          i.location.conceptualLocation.path === path &&
          i.location.conceptualLocation.method === method
      ) as IFact<OpenApiBodyFact>[];

      return requestBodyFacts.map((body) => {
        const schema = jsonPointerHelpers.get(
          document,
          jsonPointerHelpers.append(body.location.jsonPath, 'schema')
        );

        return {
          contentType: body.value.contentType,
          schema: schema,
          location: body.location.conceptualLocation as BodyLocation,
          jsonPath: body.location.jsonPath,
        };
      });
    },
    responsesForOperation(
      method: OpenAPIV3.HttpMethods,
      path: string
    ): ResponseMatchType[] {
      const forOperation = responses.filter(
        (res) =>
          res.location.conceptualLocation.method === method &&
          res.location.conceptualLocation.path === path
      );

      return forOperation.map((res) => {
        const statusCodeMatcher = res.value.statusCode.toString();

        const contentTypes = (
          facts.filter(
            (i) =>
              i.location.kind === OpenApiKind.Body &&
              'inResponse' in i.location.conceptualLocation &&
              i.location.conceptualLocation.path === path &&
              i.location.conceptualLocation.method === method &&
              i.location.conceptualLocation.inResponse.statusCode ===
                statusCodeMatcher
          ) as IFact<OpenApiBodyFact>[]
        ).map((i) => {
          const schema = jsonPointerHelpers.get(
            document,
            jsonPointerHelpers.append(i.location.jsonPath, 'schema')
          );

          return {
            contentType: i.value.contentType,
            schema: schema,
            location: i.location.conceptualLocation as BodyLocation,
            jsonPath: i.location.jsonPath,
          };
        });

        return {
          statusCodeMatcher,
          contentTypes: contentTypes,
        };
      });
    },
  };
}
