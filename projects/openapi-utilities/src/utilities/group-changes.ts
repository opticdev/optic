import {
  IChange,
  IFact,
  ILocation,
  OpenApiKind,
  FactVariant,
  ChangeVariant,
} from '../openapi3/sdk/types';
import { isChangeVariant, isFactVariant } from '../openapi3/sdk/isType';
import { compareChangesByPath } from './compare-changes-by-path';

function getEndpointId(endpoint: { pathId: string; method: string }) {
  const { pathId, method } = endpoint;
  return `${pathId}.${method.toUpperCase()}`;
}

export type ContentType = string;
export type StatusCode = string;

export type BodyChange = {
  bodyChange: ChangeVariant<OpenApiKind.Body> | null;
  fieldChanges: ChangeVariant<OpenApiKind.Field>[];
  exampleChanges: ChangeVariant<OpenApiKind.BodyExample>[];
  location: ILocation;
};

export type RequestChange = {
  change: ChangeVariant<OpenApiKind.Request> | null;
  bodyChanges: Map<ContentType, BodyChange>;
};

export type ResponseChange = {
  headers: Map<string, ChangeVariant<OpenApiKind.ResponseHeader>>;
  statusCode: string;
  change: ChangeVariant<OpenApiKind.Response> | null;
  contentTypes: Map<ContentType, BodyChange>; //content type
};

const createEmptyOpenApiChange = (endpoint: {
  method: string;
  path: string;
}): OpenApiEndpointChange => ({
  headers: new Map(),
  pathParameters: new Map(),
  queryParameters: new Map(),
  cookieParameters: new Map(),
  request: {
    change: null,
    bodyChanges: new Map(),
  },
  responses: new Map(new Map()),
  change: null,
  method: endpoint.method,
  path: endpoint.path,
});

const createEmptyResponseChange = (statusCode: string): ResponseChange => ({
  change: null,
  contentTypes: new Map(),
  headers: new Map(),
  statusCode,
});

const createEmptyBodyChange = (location: ILocation): BodyChange => ({
  bodyChange: null,
  fieldChanges: [],
  exampleChanges: [],
  location,
});

function findFieldBodyFact(
  facts: IFact[],
  fieldLocation: Extract<
    ILocation,
    { kind: OpenApiKind.Field } | { kind: OpenApiKind.BodyExample }
  >
): FactVariant<OpenApiKind.Body> | undefined {
  const { path, method } = fieldLocation.conceptualLocation;
  if ('inRequest' in fieldLocation.conceptualLocation) {
    const { contentType } = fieldLocation.conceptualLocation.inRequest.body;

    return facts.find((fact) => {
      const isBodyFact = isFactVariant(fact, OpenApiKind.Body);
      const isMatchingOperation =
        'path' in fact.location.conceptualLocation &&
        fact.location.conceptualLocation.path === path &&
        fact.location.conceptualLocation.method === method;
      if (!isBodyFact || !isMatchingOperation) {
        return false;
      }
      const conceptualLocation = fact.location.conceptualLocation;

      return (
        'inRequest' in conceptualLocation &&
        conceptualLocation.inRequest.body.contentType === contentType
      );
    }) as FactVariant<OpenApiKind.Body>;
  } else {
    // in the response
    const {
      statusCode,
      body: { contentType },
    } = fieldLocation.conceptualLocation.inResponse;
    return facts.find((fact) => {
      const isBodyFact = isFactVariant(fact, OpenApiKind.Body);
      const isMatchingOperation =
        'path' in fact.location.conceptualLocation &&
        fact.location.conceptualLocation.path === path &&
        fact.location.conceptualLocation.method === method;
      if (!isBodyFact || !isMatchingOperation) {
        return false;
      }
      const conceptualLocation = fact.location.conceptualLocation;

      return (
        'inResponse' in conceptualLocation &&
        conceptualLocation.inResponse.body.contentType === contentType &&
        conceptualLocation.inResponse.statusCode === statusCode
      );
    }) as FactVariant<OpenApiKind.Body>;
  }
}

export type OpenApiEndpointChange = {
  headers: Map<string, ChangeVariant<OpenApiKind.HeaderParameter>>;
  pathParameters: Map<string, ChangeVariant<OpenApiKind.PathParameter>>;
  queryParameters: Map<string, ChangeVariant<OpenApiKind.QueryParameter>>;
  cookieParameters: Map<string, ChangeVariant<OpenApiKind.CookieParameter>>;
  request: RequestChange;
  responses: Map<StatusCode, ResponseChange>;
  change: ChangeVariant<OpenApiKind.Operation> | null;
  method: string;
  path: string;
};

type GroupedChanges = Map<string, OpenApiEndpointChange>;

export const groupChanges = ({
  toFacts,
  changes,
}: {
  toFacts: IFact[];
  changes: IChange[];
}): {
  specificationChanges: ChangeVariant<OpenApiKind.Specification>[];
  changesByEndpoint: GroupedChanges;
} => {
  const sortedChanges = changes.sort(compareChangesByPath);
  const specificationChanges: ChangeVariant<OpenApiKind.Specification>[] = [];
  const groupedChanges: GroupedChanges = new Map();
  for (const change of sortedChanges) {
    if (isChangeVariant(change, OpenApiKind.Specification)) {
      specificationChanges.push(change);
      continue;
    }

    const path: string | undefined = (change.location.conceptualLocation as any)
      .path;
    const method: string | undefined = (
      change.location.conceptualLocation as any
    ).method;
    if (!path || !method) continue;
    const endpointId = getEndpointId({ pathId: path, method });
    const maybeEndpointChange = groupedChanges.get(endpointId);
    const endpointChange =
      maybeEndpointChange || createEmptyOpenApiChange({ path, method });

    if (isChangeVariant(change, OpenApiKind.Operation)) {
      endpointChange.change = change;
    } else if (isChangeVariant(change, OpenApiKind.Body)) {
      if ('inResponse' in change.location.conceptualLocation) {
        const {
          statusCode,
          body: { contentType },
        } = change.location.conceptualLocation.inResponse;

        const responseChange: ResponseChange =
          endpointChange.responses.get(statusCode) ||
          createEmptyResponseChange(statusCode);
        const responseBody =
          responseChange.contentTypes.get(contentType) ||
          createEmptyBodyChange(change.location);

        responseBody.bodyChange = change;

        responseChange.contentTypes.set(contentType, responseBody);
        endpointChange.responses.set(statusCode, responseChange);
      } else {
        // this is a request body
        const {
          body: { contentType },
        } = change.location.conceptualLocation.inRequest;
        const requestBody =
          endpointChange.request.bodyChanges.get(contentType) ||
          createEmptyBodyChange(change.location);
        requestBody.bodyChange = change;

        endpointChange.request.bodyChanges.set(contentType, requestBody);
      }
    } else if (isChangeVariant(change, OpenApiKind.PathParameter)) {
      const pathKey = change.location.conceptualLocation.inRequest.path;
      endpointChange.pathParameters.set(pathKey, change);
    } else if (isChangeVariant(change, OpenApiKind.QueryParameter)) {
      const queryKey = change.location.conceptualLocation.inRequest.query;
      endpointChange.queryParameters.set(queryKey, change);
    } else if (isChangeVariant(change, OpenApiKind.CookieParameter)) {
      const cookieKey = change.location.conceptualLocation.inRequest.cookie;
      endpointChange.cookieParameters.set(cookieKey, change);
    } else if (isChangeVariant(change, OpenApiKind.HeaderParameter)) {
      const headerKey = change.location.conceptualLocation.inRequest.header;
      endpointChange.headers.set(headerKey, change);
    } else if (isChangeVariant(change, OpenApiKind.ResponseHeader)) {
      const { statusCode, header } =
        change.location.conceptualLocation.inResponse;
      const responseChange: ResponseChange =
        endpointChange.responses.get(statusCode) ||
        createEmptyResponseChange(statusCode);

      responseChange.headers.set(header, change);
      endpointChange.responses.set(statusCode, responseChange);
    } else if (isChangeVariant(change, OpenApiKind.Response)) {
      const { statusCode } = change.location.conceptualLocation.inResponse;
      const responseChange: ResponseChange =
        endpointChange.responses.get(statusCode) ||
        createEmptyResponseChange(statusCode);

      responseChange.change = change;

      endpointChange.responses.set(statusCode, responseChange);
    } else if (isChangeVariant(change, OpenApiKind.Field)) {
      if ('inResponse' in change.location.conceptualLocation) {
        const {
          statusCode,
          body: { contentType },
        } = change.location.conceptualLocation.inResponse;

        const responseChange: ResponseChange =
          endpointChange.responses.get(statusCode) ||
          createEmptyResponseChange(statusCode);

        const responseBody =
          responseChange.contentTypes.get(contentType) ||
          createEmptyBodyChange(
            findFieldBodyFact(toFacts, change.location)!.location
          );

        responseBody.fieldChanges.push(change);

        responseChange.contentTypes.set(contentType, responseBody);
        endpointChange.responses.set(statusCode, responseChange);
      } else {
        const {
          body: { contentType },
        } = change.location.conceptualLocation.inRequest;

        const requestBody =
          endpointChange.request.bodyChanges.get(contentType) ||
          createEmptyBodyChange(
            findFieldBodyFact(toFacts, change.location)!.location
          );

        requestBody.fieldChanges.push(change);

        endpointChange.request.bodyChanges.set(contentType, requestBody);
      }
    } else if (isChangeVariant(change, OpenApiKind.Request)) {
      endpointChange.request.change = change;
    } else if (isChangeVariant(change, OpenApiKind.BodyExample)) {
      if ('inResponse' in change.location.conceptualLocation) {
        const {
          statusCode,
          body: { contentType },
        } = change.location.conceptualLocation.inResponse;
        const responseChange: ResponseChange =
          endpointChange.responses.get(statusCode) ||
          createEmptyResponseChange(statusCode);

        const responseBody =
          responseChange.contentTypes.get(contentType) ||
          createEmptyBodyChange(
            findFieldBodyFact(toFacts, change.location)!.location
          );
        responseBody.exampleChanges.push(change);

        responseChange.contentTypes.set(contentType, responseBody);
        endpointChange.responses.set(statusCode, responseChange);
      } else {
        const {
          body: { contentType },
        } = change.location.conceptualLocation.inRequest;

        const requestBody =
          endpointChange.request.bodyChanges.get(contentType) ||
          createEmptyBodyChange(
            findFieldBodyFact(toFacts, change.location)!.location
          );

        requestBody.exampleChanges.push(change);

        endpointChange.request.bodyChanges.set(contentType, requestBody);
      }
    }
    groupedChanges.set(endpointId, endpointChange);
  }
  return {
    specificationChanges,
    changesByEndpoint: groupedChanges,
  };
};
