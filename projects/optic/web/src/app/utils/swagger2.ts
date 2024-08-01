import {
  normalizeOpenApiPath,
  type FlatOpenAPIV2,
} from '@useoptic/openapi-utilities';
import type { IJsonSchema } from '@useoptic/openapi-utilities/build/flat-openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import type {
  InternalSpec,
  InternalSpecContent,
  InternalSpecEndpoint,
  InternalSpecMetadata,
  InternalSpecParameter,
  InternalSpecRequestBody,
  InternalSpecResponse,
  InternalSpecSchema,
  InternalSpecSchemaField,
} from './types';
import { getParameterKey, ojp } from './utils';
import { getOperationId } from './operationId';

const SWAGGER2_HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
] as const;

const FORM_CONTENT_TYPES = new Set([
  'application/x-www-form-urlencoded',
  'multipart/form-data',
]);

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
    discriminator,
    required,
    ...rest
  } = schema;
  return rest;
}
function schemaToInternal<T extends IJsonSchema>(
  schema: T,
  schemaPath: string
): InternalSpecSchema {
  // If schema.type isn't set, but there's properties we can infer it's a object type
  if (!schema.type && schema.properties) schema.type = 'object';
  const rest = getRestFromSchema(schema);
  const examples: any[] = [];
  if ('example' in schema) examples.push(schema.example);
  const common = {
    title: 'title' in schema ? schema.title : undefined,
    description: 'description' in schema ? schema.description : undefined,
    examples,
    misc: rest,
  };

  if ('allOf' in schema && schema.allOf) {
    const polymorphicKey =
      'discriminator' in schema
        ? `allOf (discriminator ${schema.discriminator})`
        : 'allOf';

    return {
      ...common,
      polymorphicKey,
      schemas: schema.allOf.map((s, i) =>
        schemaToInternal(
          s,
          jsonPointerHelpers.append(schemaPath, polymorphicKey, String(i))
        )
      ),
      [ojp]: schemaPath,
    };
  } else {
    if (schema.type === 'array') {
      const items = Array.isArray(schema.items)
        ? schema.items[0]
        : schema.items ?? {};
      return {
        ...common,
        polymorphicKey: null,
        type: 'array',
        value: 'array',
        items: schemaToInternal(
          items,
          jsonPointerHelpers.append(schemaPath, 'items')
        ),
        [ojp]: schemaPath,
      };
    } else if (schema.type === 'object') {
      const properties: Record<string, InternalSpecSchemaField> = {};
      for (const [key, value] of Object.entries(schema.properties ?? {})) {
        const internalSchema = schemaToInternal(
          value,
          jsonPointerHelpers.append(schemaPath, 'properties', key)
        );
        properties[key] = {
          key,
          required: schema.required?.includes(key) ?? false,
          ...internalSchema,
        };
      }
      return {
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
      return {
        ...common,
        polymorphicKey: null,
        type: 'primitive',
        value: Array.isArray(schema.type)
          ? schema.type.join(', ')
          : schema.type ?? 'any',
        [ojp]: schemaPath,
      };
    }
  }
}

export function endpointToInternal(
  swaggerEndpoint: FlatOpenAPIV2.OperationObject,
  { path, method }: { path: string; method: string }
): InternalSpecEndpoint {
  let {
    produces,
    consumes,
    parameters,
    summary,
    description,
    responses,
    ...rest
  } = swaggerEndpoint;
  parameters = parameters ?? [];
  produces = produces ?? [];
  consumes = consumes ?? [];

  const internalParameters: Record<string, InternalSpecParameter> = {};
  const internalResponses: Record<string, InternalSpecResponse> = {};
  let internalRequestBody: InternalSpecRequestBody | undefined = undefined;
  const baseEndpointPath = jsonPointerHelpers.compile(['paths', path, method]);

  // Handle regular paramters
  const formParams: [number, FlatOpenAPIV2.Parameter][] = [];
  for (let i = 0; i < parameters.length; i++) {
    let parameter = parameters[i];
    const parameterPath = jsonPointerHelpers.append(
      baseEndpointPath,
      'parameters',
      String(i)
    );
    if (parameter.in === 'body') {
      parameter = parameter as FlatOpenAPIV2.InBodyParameterObject;
      const { in: paramIn, description, schema, ...rest } = parameter;
      const internalSchema = schemaToInternal(
        schema,
        jsonPointerHelpers.append(parameterPath, 'schema')
      );
      const internalContent: InternalSpecContent = {};
      for (const contentType of consumes.filter(
        (c) => !FORM_CONTENT_TYPES.has(c)
      ))
        internalContent[contentType] = internalSchema;
      internalRequestBody = {
        required: parameter.required ?? false,
        description,
        content: internalContent,
        misc: rest,
        [ojp]: parameterPath,
      };
    } else if (parameter.in === 'formData') {
      // This is handled elsewhere since we need to collect all form types
      formParams.push([i, parameter]);
      continue;
    } else {
      parameter = parameter as FlatOpenAPIV2.GeneralParameterObject;

      const {
        in: paramIn,
        description,
        required,
        name,
        type,
        items,
        ...rest
      } = parameter;
      const schema = {
        type,
        items,
      };
      const key = getParameterKey(name, paramIn);
      internalParameters[key] = {
        name,
        in: paramIn,
        description,
        required: required ?? false,
        schema: schemaToInternal(schema, parameterPath),
        misc: rest,
        [ojp]: parameterPath,
      };
    }
  }
  // Handle form parameters - need to collect all form parameters to make a single schema
  if (formParams.length > 0) {
    const parametersPath = jsonPointerHelpers.append(
      baseEndpointPath,
      'parameters'
    );
    const formSchema: Extract<
      InternalSpecSchema,
      { polymorphicKey: null; type: 'object' }
    > = {
      polymorphicKey: null,
      type: 'object',
      value: 'object',
      examples: [],
      properties: {},
      misc: {},
      [ojp]: parametersPath,
    };
    for (const [idx, formParam] of formParams) {
      const { in: paramIn, name, required, type, items, ...rest } = formParam;
      const internalSchema = schemaToInternal(
        {
          type,
          items,
        },
        jsonPointerHelpers.append(parametersPath, String(idx))
      );
      formSchema.properties[name] = {
        key: name,
        required: required ?? false,
        ...internalSchema,
        misc: {
          ...internalSchema.misc,
          ...rest,
        },
      };
    }
    if (!internalRequestBody) {
      internalRequestBody = {
        required: formParams.some(([, p]) => p.required),
        description,
        content: {},
        misc: rest,
        [ojp]: parametersPath,
      };
    }
    for (const contentType of consumes.filter((c) => FORM_CONTENT_TYPES.has(c)))
      internalRequestBody.content[contentType] = formSchema;
  }

  for (const [statusCode, response] of Object.entries(responses ?? {})) {
    if (response) {
      const baseResponsePath = jsonPointerHelpers.append(
        baseEndpointPath,
        'responses',
        statusCode
      );
      const { headers, description, schema, examples, ...rest } = response;
      const internalHeaders: InternalSpecResponse['headers'] = {};
      const internalContent: InternalSpecContent = {};

      for (const [name, header] of Object.entries(headers ?? {})) {
        const jsonPath = jsonPointerHelpers.append(
          baseResponsePath,
          'headers',
          name
        );

        internalHeaders[name] = {
          name,
          required: false,
          schema: schemaToInternal(header, jsonPath),
          in: 'header',
          [ojp]: jsonPath,
          misc: {},
        };
      }

      if (schema) {
        const internalSchema = schemaToInternal(
          schema,
          jsonPointerHelpers.append(baseResponsePath, 'schema')
        );
        if (examples) {
          internalSchema.examples.push(...Object.values(examples));
        }
        for (const contentType of produces)
          internalContent[contentType] = internalSchema;
      }

      internalResponses[statusCode] = {
        description,
        content: internalContent,
        headers: internalHeaders,
        misc: rest,
        [ojp]: baseResponsePath,
      };
    }
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

export function specToInternal(
  swaggerSpec: FlatOpenAPIV2.Document
): InternalSpec {
  const {
    paths,
    parameters,
    responses,
    definitions,
    produces,
    consumes,
    swagger,
    info,
    tags,
    host,
    basePath,
    externalDocs,
    security,
    'x-optic-ci-empty-spec': _,
    ...rest
  } = swaggerSpec as FlatOpenAPIV2.Document & {
    'x-optic-ci-empty-spec'?: string;
  };
  const metadata: InternalSpecMetadata = {
    version: swagger,
    servers: {},
    info,
    tags,
    externalDocs,
    security,
    [ojp]: jsonPointerHelpers.compile(['/']),
    misc: rest,
  };
  if (host || basePath) {
    const url = (host || basePath)!;
    metadata.servers[url] = {
      host,
      basePath,
    };
  }

  const endpoints: InternalSpec['endpoints'] = {};
  for (const [path, pathObj] of Object.entries(paths ?? {})) {
    for (const method of SWAGGER2_HTTP_METHODS) {
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
