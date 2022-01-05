import { OpenAPIV3 } from 'openapi-types';
const HttpMethods = OpenAPIV3.HttpMethods;
type ScenarioName = string;
export type BeforeAndAfter = [
  OpenAPIV3.Document,
  OpenAPIV3.Document,
  ScenarioName
];
export const copy = (obj: any) => JSON.parse(JSON.stringify(obj));
export type Editable<T> = (item: T) => T;

const defaultEmpty = (): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  info: {
    version: '0.1.0',
    title: '',
  },
  paths: {},
});

const defaultWithoutSchema = (): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  info: {
    version: '0.1.0',
    title: '',
  },
  paths: {
    '/example': {
      get: {
        responses: {
          '200': {
            description: '',
          },
        },
      },
    },
  },
});

const defaultWithResponseBodySchema = (
  schema: OpenAPIV3.SchemaObject
): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  info: {
    version: '0.1.0',
    title: '',
  },
  paths: {
    '/example': {
      get: {
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: schema,
              },
            },
          },
        },
      },
    },
  },
});

const defaultWithQueryParameters = (
  parameters: OpenAPIV3.ParameterObject[]
): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  info: {
    version: '0.1.0',
    title: '',
  },
  paths: {
    '/example': {
      get: {
        parameters,
        responses: {
          '200': {
            description: '',
          },
        },
      },
    },
  },
});

const defaultWithRequestBodySchema = (
  schema: OpenAPIV3.SchemaObject
): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  info: {
    version: '0.1.0',
    title: '',
  },
  paths: {
    '/example': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema,
            },
          },
        },
        responses: {
          '201': {
            description: '',
          },
        },
      },
    },
  },
});

const baseParam = { in: 'query', name: 'exampleParam' };

export function scenario(name: string) {
  return {
    // responseSchema: {
    //   added: (schema: OpenAPIV3.SchemaObject): BeforeAndAfter => {
    //     return [defaultWithoutSchema(), defaultWithResponseBodySchema(schema)];
    //   },
    //   changed: (
    //     beforeSchema: OpenAPIV3.SchemaObject,
    //     afterSchema: OpenAPIV3.SchemaObject
    //   ): BeforeAndAfter => {
    //     return [
    //       defaultWithResponseBodySchema(beforeSchema),
    //       defaultWithResponseBodySchema(afterSchema),
    //     ];
    //   },
    // },
    paths: {
      changed: (
        pathsBefore: OpenAPIV3.PathsObject,
        editPaths: Editable<OpenAPIV3.PathsObject>
      ): BeforeAndAfter => {
        return [
          { ...defaultEmpty(), paths: pathsBefore },
          { ...defaultEmpty(), paths: editPaths(copy(pathsBefore)) },
          name,
        ];
      },
    },
    operation: {
      requirement: (
        operation: OpenAPIV3.OperationObject,
        method: OpenAPIV3.HttpMethods = HttpMethods.GET,
        pathPattern: string = '/example'
      ): BeforeAndAfter => {
        const spec: OpenAPIV3.Document = defaultEmpty();
        spec.paths = {
          [pathPattern]: {
            [method]: operation,
          },
        };
        return [spec, spec, name];
      },
      added: (
        operation: OpenAPIV3.OperationObject,
        method: OpenAPIV3.HttpMethods = HttpMethods.GET,
        pathPattern: string = '/example'
      ): BeforeAndAfter => {
        const copied: OpenAPIV3.Document = defaultEmpty();
        copied.paths = {
          [pathPattern]: {
            [method]: operation,
          },
        };
        return [defaultEmpty(), copied, name];
      },
      removed: (
        method: OpenAPIV3.HttpMethods = HttpMethods.GET,
        pathPattern: string = '/example'
      ): BeforeAndAfter => {
        const copied: OpenAPIV3.Document = defaultEmpty();
        delete copied.paths[pathPattern]?.[method];
        return [copied, defaultEmpty(), name];
      },
      changed: (
        operationBefore: OpenAPIV3.OperationObject,
        operationAfter: (
          before: OpenAPIV3.OperationObject
        ) => OpenAPIV3.OperationObject,
        method: OpenAPIV3.HttpMethods = HttpMethods.GET,
        pathPattern: string = '/example'
      ): BeforeAndAfter => {
        const before: OpenAPIV3.Document = defaultEmpty();
        before.paths = {
          [pathPattern]: {
            [method]: operationBefore,
          },
        };
        const after: OpenAPIV3.Document = defaultEmpty();
        after.paths = {
          [pathPattern]: {
            [method]: operationAfter(copy(operationBefore)),
          },
        };
        return [before, after, name];
      },
    },
    queryParameter: {
      added: (parameterToAdded: OpenAPIV3.ParameterObject): BeforeAndAfter => {
        return [
          defaultWithQueryParameters([]),
          defaultWithQueryParameters([parameterToAdded]),
          name,
        ];
      },
      changed: (
        parameterBefore: OpenAPIV3.ParameterObject,
        editParameter: Editable<OpenAPIV3.ParameterObject>
      ): BeforeAndAfter => {
        return [
          defaultWithQueryParameters([parameterBefore]),
          defaultWithQueryParameters([editParameter(copy(parameterBefore))]),
          name,
        ];
      },
    },
    requestBodySchema: {
      changed: (
        schemaBefore: OpenAPIV3.SchemaObject,
        editSchema: Editable<OpenAPIV3.SchemaObject>
      ): BeforeAndAfter => {
        return [
          defaultWithRequestBodySchema(schemaBefore),
          defaultWithRequestBodySchema(editSchema(copy(schemaBefore))),
          name,
        ];
      },
    },
    responseBodySchema: {
      changed: (
        schemaBefore: OpenAPIV3.SchemaObject,
        editSchema: Editable<OpenAPIV3.SchemaObject>
      ): BeforeAndAfter => {
        return [
          defaultWithResponseBodySchema(schemaBefore),
          defaultWithResponseBodySchema(editSchema(copy(schemaBefore))),
          name,
        ];
      },
    },
  };
}
