import {
  IChange,
  IFact,
  ILocation,
  OpenApiKind,
  FactVariant,
  ChangeVariant,
} from '../openapi3/sdk/types';
import {
  isChangeVariant,
  isFactOrChangeVariant,
  isFactVariant,
} from '../openapi3/sdk/isType';
import { compareChangesByPath } from './compare-changes-by-path';
import { ResultWithSourcemap } from '../types';
import { getEndpointId } from './id';

export type ContentType = string;
export type StatusCode = string;

export type BodyChange = {
  bodyChange: ChangeVariant<OpenApiKind.Body> | null;
  fieldChanges: ChangeVariant<OpenApiKind.Field>[];
  exampleChanges: ChangeVariant<OpenApiKind.BodyExample>[];
  hasRules: boolean;
  location: ILocation;
};

export type RequestChange = {
  change: ChangeVariant<OpenApiKind.Request> | null;
  hasRules: boolean;
  bodyChanges: Map<ContentType, BodyChange>;
};

export type ResponseChange = {
  headers: {
    hasRules: boolean;
    changes: Map<string, ChangeVariant<OpenApiKind.ResponseHeader>>;
  };
  statusCode: string;
  change: ChangeVariant<OpenApiKind.Response> | null;
  hasRules: boolean;
  contentTypes: Map<ContentType, BodyChange>; //content type
};

const createEmptyOpenApiChange = (endpoint: {
  method: string;
  path: string;
}): OpenApiEndpointChange => ({
  headers: { hasRules: false, changes: new Map() },
  pathParameters: { hasRules: false, changes: new Map() },
  queryParameters: { hasRules: false, changes: new Map() },
  cookieParameters: { hasRules: false, changes: new Map() },
  request: {
    change: null,
    hasRules: false,
    bodyChanges: new Map(),
  },
  responses: new Map(),
  hasRules: false,
  change: null,
  method: endpoint.method,
  path: endpoint.path,
});

const createEmptyResponseChange = (statusCode: string): ResponseChange => ({
  change: null,
  hasRules: false,
  contentTypes: new Map(),
  headers: { hasRules: false, changes: new Map() },
  statusCode,
});

const createEmptyBodyChange = (location: ILocation): BodyChange => ({
  bodyChange: null,
  hasRules: false,
  fieldChanges: [],
  exampleChanges: [],
  location,
});

function findFieldBodyFact(
  facts: IFact[],
  fieldLocation: Extract<
    ILocation,
    | { kind: OpenApiKind.Field }
    | { kind: OpenApiKind.BodyExample }
    | { kind: OpenApiKind.Body }
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
  headers: {
    hasRules: boolean;
    changes: Map<string, ChangeVariant<OpenApiKind.HeaderParameter>>;
  };
  pathParameters: {
    hasRules: boolean;
    changes: Map<string, ChangeVariant<OpenApiKind.PathParameter>>;
  };
  queryParameters: {
    hasRules: boolean;
    changes: Map<string, ChangeVariant<OpenApiKind.QueryParameter>>;
  };
  cookieParameters: {
    hasRules: boolean;
    changes: Map<string, ChangeVariant<OpenApiKind.CookieParameter>>;
  };
  request: RequestChange;
  responses: Map<StatusCode, ResponseChange>;
  change: ChangeVariant<OpenApiKind.Operation> | null;
  hasRules: boolean;
  method: string;
  path: string;
};

type GroupedChanges = Map<string, OpenApiEndpointChange>;

export const groupChangesAndRules = ({
  toFacts,
  changes,
  rules,
}: {
  toFacts: IFact[];
  changes: IChange[];
  rules: ResultWithSourcemap[];
}): {
  specification: {
    hasRules: boolean;
    changes: ChangeVariant<OpenApiKind.Specification>[];
  };
  changesByEndpoint: GroupedChanges;
} => {
  const sortedChanges = [...changes].sort(compareChangesByPath);
  const specification: {
    hasRules: boolean;
    changes: ChangeVariant<OpenApiKind.Specification>[];
  } = { changes: [], hasRules: false };
  const groupedChanges: GroupedChanges = new Map();
  for (const change of sortedChanges) {
    if (isChangeVariant(change, OpenApiKind.Specification)) {
      specification.changes.push(change);
      continue;
    }

    const path: string | undefined = (change.location.conceptualLocation as any)
      .path;
    const method: string | undefined = (
      change.location.conceptualLocation as any
    ).method;
    if (!path || !method) continue;
    const endpointId = getEndpointId({ path, method });
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
      endpointChange.pathParameters.changes.set(pathKey, change);
    } else if (isChangeVariant(change, OpenApiKind.QueryParameter)) {
      const queryKey = change.location.conceptualLocation.inRequest.query;
      endpointChange.queryParameters.changes.set(queryKey, change);
    } else if (isChangeVariant(change, OpenApiKind.CookieParameter)) {
      const cookieKey = change.location.conceptualLocation.inRequest.cookie;
      endpointChange.cookieParameters.changes.set(cookieKey, change);
    } else if (isChangeVariant(change, OpenApiKind.HeaderParameter)) {
      const headerKey = change.location.conceptualLocation.inRequest.header;
      endpointChange.headers.changes.set(headerKey, change);
    } else if (isChangeVariant(change, OpenApiKind.ResponseHeader)) {
      const { statusCode, header } =
        change.location.conceptualLocation.inResponse;
      const responseChange: ResponseChange =
        endpointChange.responses.get(statusCode) ||
        createEmptyResponseChange(statusCode);

      responseChange.headers.changes.set(header, change);
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

  for (const rule of rules) {
    if (isFactOrChangeVariant(rule.change, OpenApiKind.Specification)) {
      specification.hasRules = true;
      continue;
    }

    const path: string | undefined = (
      rule.change.location.conceptualLocation as any
    ).path;
    const method: string | undefined = (
      rule.change.location.conceptualLocation as any
    ).method;
    if (!path || !method) continue;
    const endpointId = getEndpointId({ path, method });
    const maybeEndpoint = groupedChanges.get(endpointId);
    const endpoint =
      maybeEndpoint || createEmptyOpenApiChange({ path, method });

    if (isFactOrChangeVariant(rule.change, OpenApiKind.Operation)) {
      endpoint.hasRules = true;
    } else if (isFactOrChangeVariant(rule.change, OpenApiKind.PathParameter)) {
      endpoint.pathParameters.hasRules = true;
    } else if (isFactOrChangeVariant(rule.change, OpenApiKind.QueryParameter)) {
      endpoint.queryParameters.hasRules = true;
    } else if (
      isFactOrChangeVariant(rule.change, OpenApiKind.CookieParameter)
    ) {
      endpoint.cookieParameters.hasRules = true;
    } else if (
      isFactOrChangeVariant(rule.change, OpenApiKind.HeaderParameter)
    ) {
      endpoint.headers.hasRules = true;
    } else if (isFactOrChangeVariant(rule.change, OpenApiKind.Request)) {
      endpoint.request.hasRules = true;
    } else if (isFactOrChangeVariant(rule.change, OpenApiKind.Response)) {
      const { statusCode } = rule.change.location.conceptualLocation.inResponse;
      const responseChange: ResponseChange =
        endpoint.responses.get(statusCode) ||
        createEmptyResponseChange(statusCode);

      responseChange.hasRules = true;

      endpoint.responses.set(statusCode, responseChange);
    } else if (isFactOrChangeVariant(rule.change, OpenApiKind.ResponseHeader)) {
      const { statusCode } = rule.change.location.conceptualLocation.inResponse;
      const responseChange: ResponseChange =
        endpoint.responses.get(statusCode) ||
        createEmptyResponseChange(statusCode);

      responseChange.headers.hasRules = true;
      endpoint.responses.set(statusCode, responseChange);
    } else if (
      isFactOrChangeVariant(rule.change, OpenApiKind.Field) ||
      isFactOrChangeVariant(rule.change, OpenApiKind.Body) ||
      isFactOrChangeVariant(rule.change, OpenApiKind.BodyExample)
    ) {
      if ('inResponse' in rule.change.location.conceptualLocation) {
        const {
          statusCode,
          body: { contentType },
        } = rule.change.location.conceptualLocation.inResponse;
        const responseChange: ResponseChange =
          endpoint.responses.get(statusCode) ||
          createEmptyResponseChange(statusCode);

        const responseBody =
          responseChange.contentTypes.get(contentType) ||
          createEmptyBodyChange(
            findFieldBodyFact(toFacts, rule.change.location)!.location
          );

        responseBody.hasRules = true;
        responseChange.contentTypes.set(contentType, responseBody);
        endpoint.responses.set(statusCode, responseChange);
      } else {
        const {
          body: { contentType },
        } = rule.change.location.conceptualLocation.inRequest;

        const requestBody =
          endpoint.request.bodyChanges.get(contentType) ||
          createEmptyBodyChange(
            findFieldBodyFact(toFacts, rule.change.location)!.location
          );

        requestBody.hasRules = true;

        endpoint.request.bodyChanges.set(contentType, requestBody);
      }
    }
  }

  return {
    specification,
    changesByEndpoint: groupedChanges,
  };
};
