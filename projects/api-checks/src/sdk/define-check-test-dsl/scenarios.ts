import { OpenAPIV3 } from 'openapi-types';
const HttpMethods = OpenAPIV3.HttpMethods;
export type BeforeAndAfter = [OpenAPIV3.Document, OpenAPIV3.Document];
export const copy = (obj: any) => JSON.parse(JSON.stringify(obj));

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

const defaultWithSchema = (
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

export function scenario(name: string) {
  return {
    responseSchema: {
      added: (schema: OpenAPIV3.SchemaObject): BeforeAndAfter => {
        return [defaultWithoutSchema(), defaultWithSchema(schema)];
      },
      changed: (
        beforeSchema: OpenAPIV3.SchemaObject,
        afterSchema: OpenAPIV3.SchemaObject
      ): BeforeAndAfter => {
        return [
          defaultWithSchema(beforeSchema),
          defaultWithSchema(afterSchema),
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
        return [spec, spec];
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
        return [defaultEmpty(), copied];
      },
      removed: (
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
        return [copied, defaultEmpty()];
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
        return [before, after];
      },
    },
  };
}
