import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getParameterKey, ojp } from './utils';

import {
  normalizeOpenApiPath,
  type FlatOpenAPIV3,
} from '@useoptic/openapi-utilities';
import {
  UnnamedPolymorphic,
  type InternalSpec,
  type InternalSpecContent,
  type InternalSpecEndpoint,
  type InternalSpecParameter,
  type InternalSpecRequestBody,
  type InternalSpecResponse,
  type InternalSpecSchema,
  type InternalSpecSchemaField,
} from './types';
import { getOperationId } from './operationId';

function getRestFromSchema(schema: any) {
  const {
    anyOf,
    oneOf,
    allOf,
    not,
    type,
    properties,
    items,
    example,
    additionalProperties,
    title,
    description,
    nullable,
    required,
    ...rest
  } = schema;
  return rest;
}

function schemaToInternal(
  schema: FlatOpenAPIV3.SchemaObject,
  schemaPath: string
): InternalSpecSchema {
  // If schema.type isn't set, but there's properties we can infer it's a object type
  if (!schema.type && schema.properties) schema.type = 'object';

  const rest = getRestFromSchema(schema);
  const examples: any[] = [];
  if (schema.example) examples.push(schema.example);
  const polymorphic = schema.anyOf || schema.oneOf;
  const common = {
    title: schema.title,
    description: schema.description,
    examples,
    misc: rest,
  };

  const nullableVariant = schema.nullable
    ? schemaToInternal(
        {
          type: 'null' as any,
        },
        schemaPath
      )
    : null;
  // Assumption is we've flattened allOf variants
  if (polymorphic) {
    const polymorphicKey = schema.anyOf ? 'anyOf' : 'oneOf';
    const schemas = [
      ...polymorphic.map((s, i) =>
        schemaToInternal(
          s,
          jsonPointerHelpers.append(schemaPath, polymorphicKey, String(i))
        )
      ),
    ];
    if (nullableVariant) {
      schemas.push(nullableVariant);
    }
    return {
      ...common,
      polymorphicKey,
      schemas,
      [ojp]: schemaPath,
    };
  } else {
    let baseSchema: InternalSpecSchema;
    if (schema.type === 'array') {
      baseSchema = {
        ...common,
        polymorphicKey: null,
        type: 'array',
        value: 'array',
        items: schemaToInternal(
          schema.items ?? {},
          jsonPointerHelpers.append(schemaPath, 'items')
        ),
        [ojp]: schemaPath,
      };
    } else if (schema.type === 'object') {
      const properties: Record<string, InternalSpecSchemaField> = {};
      for (const [key, value] of Object.entries(schema.properties ?? {})) {
        const internalSchema = schemaToInternal(
          value ?? {},
          jsonPointerHelpers.append(schemaPath, 'properties', key)
        );
        properties[key] = {
          key,
          required: schema.required?.includes(key) ?? false,
          ...internalSchema,
        };
      }
      baseSchema = {
        ...common,
        polymorphicKey: null,
        type: 'object',
        value: 'object',
        properties,
        [ojp]: schemaPath,
        additionalProperties:
          schema.additionalProperties === undefined ||
          typeof schema.additionalProperties === 'boolean'
            ? schema.additionalProperties
            : schemaToInternal(
                schema.additionalProperties,
                jsonPointerHelpers.append(schemaPath, 'additionalProperties')
              ),
      };
    } else {
      baseSchema = {
        ...common,
        polymorphicKey: null,
        type: 'primitive',
        value: schema.type ?? 'any',
        [ojp]: schemaPath,
      };
    }
    if (nullableVariant) {
      return {
        examples: [],
        misc: {},
        polymorphicKey: UnnamedPolymorphic,
        schemas: [baseSchema, nullableVariant],
        [ojp]: schemaPath,
      };
    } else {
      return baseSchema;
    }
  }
}

// Accepts FlatOpenAPIV3.ParameterObject or FlatOpenAPIV3.MediaTypeObject
function mediaObjectToInternal(
  mediaObject: {
    schema?: FlatOpenAPIV3.SchemaObject;
    example?: any;
    examples?: { [media: string]: any };
  },
  originalPath: string
) {
  const maybeInternalSchema = mediaObject.schema
    ? schemaToInternal(
        mediaObject.schema,
        jsonPointerHelpers.append(originalPath, 'schema')
      )
    : mediaObject.schema;
  // For bodies, examples can live both on the schema level and the body level in OAS3
  if (maybeInternalSchema) {
    if (mediaObject.example)
      maybeInternalSchema.examples.push(mediaObject.example);
    if (mediaObject.examples) {
      for (const example of Object.values(mediaObject.examples))
        maybeInternalSchema.examples.push(example);
    }
  }
  return maybeInternalSchema;
}

export function endpointToInternal(
  oas3Endpoint: FlatOpenAPIV3.OperationObject,
  { path, method }: { path: string; method: string }
): InternalSpecEndpoint {
  const { summary, description, parameters, responses, requestBody, ...rest } =
    oas3Endpoint;
  const internalParameters: Record<string, InternalSpecParameter> = {};
  const internalResponses: Record<string, InternalSpecResponse> = {};
  let internalRequestBody: InternalSpecRequestBody | undefined = undefined;
  const baseEndpointPath = jsonPointerHelpers.compile(['paths', path, method]);

  for (let i = 0; i < (parameters?.length ?? 0); i++) {
    const parameter = (parameters ?? [])[i];
    const {
      name,
      in: paramIn,
      required,
      description,
      example,
      examples,
      schema,
      content,
      ...rest
    } = parameter;
    const parameterPath = jsonPointerHelpers.append(
      baseEndpointPath,
      'parameters',
      String(i)
    );

    const key = getParameterKey(name, paramIn);
    internalParameters[key] = {
      name,
      in: paramIn,
      description,
      required: required ?? false,
      schema: mediaObjectToInternal(
        {
          schema,
          example,
          examples,
        },
        parameterPath
      ),
      misc: rest,
      [ojp]: parameterPath,
    };
  }

  if (requestBody) {
    const { required, content, description, ...rest } = requestBody;
    const internalContent: InternalSpecContent = {};
    const requestBodyPath = jsonPointerHelpers.append(
      baseEndpointPath,
      'requestBody'
    );

    for (const [contentType, body] of Object.entries(content ?? {})) {
      const { schema, example, examples, encoding } = body;
      const internalSchema = mediaObjectToInternal(
        {
          schema,
          example,
          examples,
        },
        jsonPointerHelpers.append(requestBodyPath, 'content', contentType)
      );
      if (internalSchema) {
        if (encoding) internalSchema.misc.encoding = encoding;
        internalContent[contentType] = internalSchema;
      }
    }

    internalRequestBody = {
      required: required ?? false,
      description,
      content: internalContent,
      misc: rest,
      [ojp]: requestBodyPath,
    };
  }

  for (const [statusCode, response] of Object.entries(responses ?? {})) {
    const { content, headers, description, ...rest } = response;
    const internalContent: InternalSpecContent = {};
    const internalHeaders: Record<string, InternalSpecParameter> = {};
    const baseResponsePath = jsonPointerHelpers.append(
      baseEndpointPath,
      'responses',
      statusCode
    );

    for (const [name, header] of Object.entries(headers ?? {})) {
      const { required, schema, example, examples, description, ...rest } =
        header;
      const headerPath = jsonPointerHelpers.append(
        baseResponsePath,
        'headers',
        name
      );
      internalHeaders[name] = {
        name,
        in: 'header',
        description,
        required: required ?? false,
        schema: mediaObjectToInternal(
          {
            schema,
            example,
            examples,
          },
          headerPath
        ),
        [ojp]: headerPath,
        misc: rest,
      };
    }

    for (const [contentType, body] of Object.entries(content ?? {})) {
      const { schema, example, examples, encoding } = body;
      const internalSchema = mediaObjectToInternal(
        {
          schema,
          example,
          examples,
        },
        jsonPointerHelpers.append(baseResponsePath, 'content', contentType)
      );
      if (internalSchema) {
        if (encoding) internalSchema.misc.encoding = encoding;
        internalContent[contentType] = internalSchema;
      }
    }

    internalResponses[statusCode] = {
      description,
      content: internalContent,
      headers: internalHeaders,
      misc: rest,
      [ojp]: baseResponsePath,
    };
  }

  return {
    path,
    method,
    summary,
    description,
    parameters: internalParameters,
    requestBody: internalRequestBody,
    responses: internalResponses,
    misc: rest,
    [ojp]: baseEndpointPath,
  };
}

export function specToInternal(oas3Spec: FlatOpenAPIV3.Document): InternalSpec {
  const {
    servers,
    paths,
    components,
    openapi,
    info,
    tags,
    externalDocs,
    security,
    'x-optic-ci-empty-spec': _,
    ...rest
  } = oas3Spec as FlatOpenAPIV3.Document & { 'x-optic-ci-empty-spec'?: string };
  const internalServers: Record<string, any> = {};
  for (const server of servers ?? []) {
    internalServers[server.url] = server;
  }

  const metadata: InternalSpec['metadata'] = {
    version: openapi,
    servers: internalServers,
    info,
    tags,
    externalDocs,
    security,
    misc: rest,
    [ojp]: jsonPointerHelpers.compile(['/']),
  };
  const endpoints: InternalSpec['endpoints'] = {};
  for (const [path, pathObj] of Object.entries(paths ?? {})) {
    for (const method of Object.values(OpenAPIV3.HttpMethods)) {
      const endpoint = pathObj?.[method];
      const normalized = normalizeOpenApiPath(path);
      if (endpoint) {
        endpoints[getOperationId({ method, pathPattern: normalized })] =
          endpointToInternal(endpoint, { path, method });
      }
    }
  }
  return { endpoints, metadata };
}
