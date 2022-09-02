# Data shapes

## RuleContext

RuleContext contains the specification and operation as well as custom context data. Details on how to pass in custom context [here](./Reference.md#custom-context).

```javascript
type RuleContext = {
  specification: Specification & {},
  operation: Operation & {},
  custom: any,
};
```

## Specification

The specification object describes the root document object of the OpenAPI file. This corresponds to the [open api object](https://swagger.io/specification/#openapi-object).

The specification object has the following data structure

[OpenApiSpecificationFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
type Specification = {
  value: OpenApiSpecificationFact,
  raw: any, // The original OpenAPI Spec
};
```

## Operation

The operation object describes an [operation](https://swagger.io/specification/#operation-object) and has the following data structure.

[OpenApiOperationFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
type Operation = {
  value: OpenApiOperationFact,
  raw: any, // The original operation object from the OpenAPI Spec
  path: string,
  method: string,
  queryParameters: Map<string, QueryParameter>, // keyed by parameter name
  pathParameters: Map<string, PathParameter>, // keyed by parameter name
  headerParameters: Map<string, HeaderParameter>, // keyed by parameter name
  cookieParameters: Map<string, CookieParameter>, // keyed by parameter name
  requests: RequestBody[],
  responses: Map<string, Response>, // keyed by status code
};
```

## QueryParameter / PathParameter / HeaderParameter / CookieParameter

The request parameter objects describe a [parameter object](https://swagger.io/specification/#parameter-object) and has the following data structure

[OpenApiRequestParameterFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
// QueryParameter, PathParameter, HeaderParameter, CookieParameter all have the same shape
type QueryParameter = {
  value: OpenApiRequestParameterFact,
  raw: any, // The original parameter object from the OpenAPI Spec
};
```

## RequestBody

The request body object describes a [media type object](https://swagger.io/specification/#media-type-object) in a request body and has the following data structure

[OpenApiBodyFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
type RequestBody = {
  value: OpenApiBodyFact,
  raw: any, // The original operation object from the OpenAPI Spec
  contentType: string,
  properties: Map<string, Field>, // keyed by jsonPath
};
```

## Response

The response object describes a [response object](https://swagger.io/specification/#responses-object) and has the following data structure

[OpenApiResponseFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
type Response = {
  value: OpenApiResponseFact,
  raw: any, // The original operation object from the OpenAPI Spec
  statusCode: string,
  headers: Map<string, FactVariantWithRaw<OpenApiKind.ResponseHeader>>, // keyed by response header name
  bodies: ResponseBody[],
};
```

## ResponseHeader

The response header object describes a [response header object](https://swagger.io/specification/#header-object) and has the following data structure

[OpenApiHeaderFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
type ResponseHeader = {
  value: OpenApiHeaderFact,
  raw: any, // The original parameter object from the OpenAPI Spec
};
```

## ResponseBody

The response body object describes a [media type object](https://swagger.io/specification/#media-type-object) in a response and has the following data structure

[OpenApiBodyFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
type ResponseBody = {
  value: OpenApiBodyFact,
  raw: any, // The original operation object from the OpenAPI Spec
  contentType: string,
  statusCode: string,
  contentType: string,
  properties: Map<string, Field>, // keyed by jsonPath
};
```

## Property

The property object describes a [body property](https://swagger.io/specification/#schema-object) and has the following data structure

[PropertyFact details can be found here](../../openapi-utilities/src/openapi/sdk/types/index.ts)

```javascript
type Property = {
  value: OpenApiFieldFact,
  raw: any, // The original operation object from the OpenAPI Spec
};
```
