import {
  IFact,
  IChange,
  ChangeVariant,
  FactVariant,
  OpenApiKind,
  isFactVariant,
  isChangeVariant,
} from '@useoptic/openapi-utilities';

type NodeDetail<T extends OpenApiKind> = {
  before: FactVariant<T> | null;
  after: FactVariant<T> | null;
  change: ChangeVariant<T> | null;
};

type ContentType = string;
type StatusCode = string;

type HeaderParameter = NodeDetail<OpenApiKind.HeaderParameter>;
type PathParameter = NodeDetail<OpenApiKind.PathParameter>;
type QueryParameter = NodeDetail<OpenApiKind.QueryParameter>;

type Request = NodeDetail<OpenApiKind.Request> & {
  bodies: Map<ContentType, Body>;
};

type Response = NodeDetail<OpenApiKind.Response> & {
  statusCode: string;
  headers: Map<string, NodeDetail<OpenApiKind.ResponseHeader>>;
  bodies: Map<ContentType, Body>;
};

type Body = NodeDetail<OpenApiKind.Body> & {
  fields: Map<string, NodeDetail<OpenApiKind.Field>>;
};

type Endpoint = NodeDetail<OpenApiKind.Operation> & {
  method: string;
  path: string;

  headerParameters: Map<string, HeaderParameter>;
  pathParameters: Map<string, PathParameter>;
  queryParameters: Map<string, QueryParameter>;
  request: Request;
  responses: Map<StatusCode, Response>;
};

type OpenApiDocument = {
  specification: NodeDetail<OpenApiKind.Specification>;
  endpoints: Map<string, Endpoint>;
};

const getEndpointKey = ({ path, method }: { path: string; method: string }) =>
  `${method} ${path}`;

const createEmptyNodeDetail = () => ({
  before: null,
  after: null,
  change: null,
});

const createEmptyResponse = ({
  statusCode,
}: {
  statusCode: string;
}): Response => ({
  ...createEmptyNodeDetail(),
  statusCode,
  headers: new Map(),
  bodies: new Map(),
});

const createEmptyBody = (): Body => ({
  ...createEmptyNodeDetail(),
  fields: new Map(),
});

const createEndpoint = ({
  path,
  method,
}: {
  path: string;
  method: string;
}): Endpoint => ({
  ...createEmptyNodeDetail(),
  headerParameters: new Map(),
  pathParameters: new Map(),
  queryParameters: new Map(),
  request: {
    ...createEmptyNodeDetail(),
    bodies: new Map(),
  },
  responses: new Map(new Map()),
  method: method,
  path: path,
});

const useFactToUpdate = (
  fact: IFact,
  key: 'before' | 'after',
  groupedFacts: OpenApiDocument
) => {
  if (isFactVariant(fact, OpenApiKind.Specification)) {
    groupedFacts.specification[key] = fact;
    return;
  }
  const path: string | undefined = (fact.location.conceptualLocation as any)
    .path;
  const method: string | undefined = (fact.location.conceptualLocation as any)
    .method;
  if (!path || !method) return;
  const endpointId = getEndpointKey({ path, method });
  const endpoint =
    groupedFacts.endpoints.get(endpointId) || createEndpoint({ path, method });

  if (isFactVariant(fact, OpenApiKind.Operation)) {
    endpoint[key] = fact;
  } else if (isFactVariant(fact, OpenApiKind.Body)) {
    if ('inResponse' in fact.location.conceptualLocation) {
      const {
        statusCode,
        body: { contentType },
      } = fact.location.conceptualLocation.inResponse;

      const responseChange: Response =
        endpoint.responses.get(statusCode) ||
        createEmptyResponse({ statusCode });
      const responseBody =
        responseChange.bodies.get(contentType) || createEmptyBody();

      responseBody[key] = fact;

      responseChange.bodies.set(contentType, responseBody);
      endpoint.responses.set(statusCode, responseChange);
    } else {
      // this is a request body
      const {
        body: { contentType },
      } = fact.location.conceptualLocation.inRequest;
      const requestBody =
        endpoint.request.bodies.get(contentType) || createEmptyBody();
      requestBody[key] = fact;

      endpoint.request.bodies.set(contentType, requestBody);
    }
  } else if (isFactVariant(fact, OpenApiKind.PathParameter)) {
    const pathKey = fact.location.conceptualLocation.inRequest.path;
    const pathParameter =
      endpoint.pathParameters.get(pathKey) || createEmptyNodeDetail();
    pathParameter[key] = fact;
    endpoint.pathParameters.set(pathKey, pathParameter);
  } else if (isFactVariant(fact, OpenApiKind.QueryParameter)) {
    const queryKey = fact.location.conceptualLocation.inRequest.query;
    const queryParameter =
      endpoint.queryParameters.get(queryKey) || createEmptyNodeDetail();
    queryParameter[key] = fact;
    endpoint.queryParameters.set(queryKey, queryParameter);
  } else if (isFactVariant(fact, OpenApiKind.HeaderParameter)) {
    const headerKey = fact.location.conceptualLocation.inRequest.header;
    const headerParameter =
      endpoint.headerParameters.get(headerKey) || createEmptyNodeDetail();
    headerParameter[key] = fact;
    endpoint.headerParameters.set(headerKey, headerParameter);
  } else if (isFactVariant(fact, OpenApiKind.ResponseHeader)) {
    const { statusCode, header } = fact.location.conceptualLocation.inResponse;
    const responseChange: Response =
      endpoint.responses.get(statusCode) || createEmptyResponse({ statusCode });

    const headerParameter =
      responseChange.headers.get(header) || createEmptyNodeDetail();
    headerParameter[key] = fact;
    responseChange.headers.set(header, headerParameter);
    endpoint.responses.set(statusCode, responseChange);
  } else if (isFactVariant(fact, OpenApiKind.Response)) {
    const { statusCode } = fact.location.conceptualLocation.inResponse;
    const responseChange: Response =
      endpoint.responses.get(statusCode) || createEmptyResponse({ statusCode });

    responseChange[key] = fact;

    endpoint.responses.set(statusCode, responseChange);
  } else if (isFactVariant(fact, OpenApiKind.Field)) {
    const jsonPath = fact.location.jsonPath;
    if ('inResponse' in fact.location.conceptualLocation) {
      const {
        statusCode,
        body: { contentType },
      } = fact.location.conceptualLocation.inResponse;

      const responseChange: Response =
        endpoint.responses.get(statusCode) ||
        createEmptyResponse({ statusCode });

      const responseBody =
        responseChange.bodies.get(contentType) || createEmptyBody();

      const field =
        responseBody.fields.get(jsonPath) || createEmptyNodeDetail();
      field[key] = fact;
      responseBody.fields.set(jsonPath, field);
      responseChange.bodies.set(contentType, responseBody);
      endpoint.responses.set(statusCode, responseChange);
    } else {
      const {
        body: { contentType },
      } = fact.location.conceptualLocation.inRequest;

      const requestBody =
        endpoint.request.bodies.get(contentType) || createEmptyBody();

      const field = requestBody.fields.get(jsonPath) || createEmptyNodeDetail();
      field[key] = fact;
      requestBody.fields.set(jsonPath, field);

      endpoint.request.bodies.set(contentType, requestBody);
    }
  } else if (isFactVariant(fact, OpenApiKind.Request)) {
    endpoint.request[key] = fact;
  }
  groupedFacts.endpoints.set(endpointId, endpoint);
};

// This is almost identical to the above - split out into two functions for better typescripting
const useChangeToUpdate = (change: IChange, groupedFacts: OpenApiDocument) => {
  const key = 'change';
  if (isChangeVariant(change, OpenApiKind.Specification)) {
    groupedFacts.specification[key] = change;
    return;
  }
  const path: string | undefined = (change.location.conceptualLocation as any)
    .path;
  const method: string | undefined = (change.location.conceptualLocation as any)
    .method;
  if (!path || !method) return;
  const endpointId = getEndpointKey({ path, method });
  const endpoint =
    groupedFacts.endpoints.get(endpointId) || createEndpoint({ path, method });

  if (isChangeVariant(change, OpenApiKind.Operation)) {
    endpoint[key] = change;
  } else if (isChangeVariant(change, OpenApiKind.Body)) {
    if ('inResponse' in change.location.conceptualLocation) {
      const {
        statusCode,
        body: { contentType },
      } = change.location.conceptualLocation.inResponse;

      const responseChange: Response =
        endpoint.responses.get(statusCode) ||
        createEmptyResponse({ statusCode });
      const responseBody =
        responseChange.bodies.get(contentType) || createEmptyBody();

      responseBody[key] = change;

      responseChange.bodies.set(contentType, responseBody);
      endpoint.responses.set(statusCode, responseChange);
    } else {
      // this is a request body
      const {
        body: { contentType },
      } = change.location.conceptualLocation.inRequest;
      const requestBody =
        endpoint.request.bodies.get(contentType) || createEmptyBody();
      requestBody[key] = change;

      endpoint.request.bodies.set(contentType, requestBody);
    }
  } else if (isChangeVariant(change, OpenApiKind.PathParameter)) {
    const pathKey = change.location.conceptualLocation.inRequest.path;
    const pathParameter =
      endpoint.pathParameters.get(pathKey) || createEmptyNodeDetail();
    pathParameter[key] = change;
    endpoint.pathParameters.set(pathKey, pathParameter);
  } else if (isChangeVariant(change, OpenApiKind.QueryParameter)) {
    const queryKey = change.location.conceptualLocation.inRequest.query;
    const queryParameter =
      endpoint.queryParameters.get(queryKey) || createEmptyNodeDetail();
    queryParameter[key] = change;
    endpoint.queryParameters.set(queryKey, queryParameter);
  } else if (isChangeVariant(change, OpenApiKind.HeaderParameter)) {
    const headerKey = change.location.conceptualLocation.inRequest.header;
    const headerParameter =
      endpoint.headerParameters.get(headerKey) || createEmptyNodeDetail();
    headerParameter[key] = change;
    endpoint.headerParameters.set(headerKey, headerParameter);
  } else if (isChangeVariant(change, OpenApiKind.ResponseHeader)) {
    const { statusCode, header } =
      change.location.conceptualLocation.inResponse;
    const responseChange: Response =
      endpoint.responses.get(statusCode) || createEmptyResponse({ statusCode });

    const headerParameter =
      responseChange.headers.get(header) || createEmptyNodeDetail();
    headerParameter[key] = change;
    responseChange.headers.set(header, headerParameter);
    endpoint.responses.set(statusCode, responseChange);
  } else if (isChangeVariant(change, OpenApiKind.Response)) {
    const { statusCode } = change.location.conceptualLocation.inResponse;
    const responseChange: Response =
      endpoint.responses.get(statusCode) || createEmptyResponse({ statusCode });

    responseChange[key] = change;

    endpoint.responses.set(statusCode, responseChange);
  } else if (isChangeVariant(change, OpenApiKind.Field)) {
    const jsonPath = change.location.jsonPath;
    if ('inResponse' in change.location.conceptualLocation) {
      const {
        statusCode,
        body: { contentType },
      } = change.location.conceptualLocation.inResponse;

      const responseChange: Response =
        endpoint.responses.get(statusCode) ||
        createEmptyResponse({ statusCode });

      const responseBody =
        responseChange.bodies.get(contentType) || createEmptyBody();

      const field =
        responseBody.fields.get(jsonPath) || createEmptyNodeDetail();
      field[key] = change;
      responseBody.fields.set(jsonPath, field);
      responseChange.bodies.set(contentType, responseBody);
      endpoint.responses.set(statusCode, responseChange);
    } else {
      const {
        body: { contentType },
      } = change.location.conceptualLocation.inRequest;

      const requestBody =
        endpoint.request.bodies.get(contentType) || createEmptyBody();

      const field = requestBody.fields.get(jsonPath) || createEmptyNodeDetail();
      field[key] = change;
      requestBody.fields.set(jsonPath, field);

      endpoint.request.bodies.set(contentType, requestBody);
    }
  } else if (isChangeVariant(change, OpenApiKind.Request)) {
    endpoint.request[key] = change;
  }
  groupedFacts.endpoints.set(endpointId, endpoint);
};

export const groupFacts = ({
  beforeFacts,
  afterFacts,
  changes,
}: {
  beforeFacts: IFact[];
  afterFacts: IFact[];
  changes: IChange[];
}): OpenApiDocument => {
  const groupedFacts: OpenApiDocument = {
    specification: createEmptyNodeDetail(),
    endpoints: new Map(),
  };

  for (const beforeFact of beforeFacts) {
    useFactToUpdate(beforeFact, 'before', groupedFacts);
  }

  for (const afterFact of afterFacts) {
    useFactToUpdate(afterFact, 'after', groupedFacts);
  }

  for (const change of changes) {
    useChangeToUpdate(change, groupedFacts);
  }

  return groupedFacts;
};
