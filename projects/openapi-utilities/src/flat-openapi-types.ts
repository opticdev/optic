/* tslint:disable:no-namespace no-empty-interface */

export enum HttpMethods {
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  DELETE = 'delete',
  OPTIONS = 'options',
  HEAD = 'head',
  PATCH = 'patch',
  TRACE = 'trace',
}

export namespace FlatOpenAPI {
  export type Document<T extends {} = {}> =
    | FlatOpenAPIV2.Document<T>
    | FlatOpenAPIV3.Document<T>
    | FlatOpenAPIV3_1.Document<T>;
  export type Operation<T extends {} = {}> =
    | FlatOpenAPIV2.OperationObject<T>
    | FlatOpenAPIV3.OperationObject<T>
    | FlatOpenAPIV3_1.OperationObject<T>;
  export type Parameter =
    | FlatOpenAPIV3_1.ParameterObject
    | FlatOpenAPIV3.ParameterObject
    | FlatOpenAPIV2.Parameter;
  export type Parameters =
    | FlatOpenAPIV3_1.ParameterObject[]
    | FlatOpenAPIV3.ParameterObject[]
    | FlatOpenAPIV2.Parameter[];

  export interface Request {
    body?: any;
    headers?: object;
    params?: object;
    query?: object;
  }
}

export namespace FlatOpenAPIV3_1 {
  type Modify<T, R> = Omit<T, keyof R> & R;

  type PathsWebhooksComponents<T extends {} = {}> = {
    paths: PathsObject<T>;
    webhooks: Record<string, PathItemObject>;
    components: ComponentsObject;
  };

  export type Document<T extends {} = {}> = Modify<
    Omit<FlatOpenAPIV3.Document<T>, 'paths' | 'components'>,
    {
      info: InfoObject;
      jsonSchemaDialect?: string;
      servers?: ServerObject[];
    } & (
      | (Pick<PathsWebhooksComponents<T>, 'paths'> &
          Omit<Partial<PathsWebhooksComponents<T>>, 'paths'>)
      | (Pick<PathsWebhooksComponents<T>, 'webhooks'> &
          Omit<Partial<PathsWebhooksComponents<T>>, 'webhooks'>)
      | (Pick<PathsWebhooksComponents<T>, 'components'> &
          Omit<Partial<PathsWebhooksComponents<T>>, 'components'>)
    )
  >;

  export type InfoObject = Modify<
    FlatOpenAPIV3.InfoObject,
    {
      summary?: string;
      license?: LicenseObject;
    }
  >;

  export type ContactObject = FlatOpenAPIV3.ContactObject;

  export type LicenseObject = Modify<
    FlatOpenAPIV3.LicenseObject,
    {
      identifier?: string;
    }
  >;

  export type ServerObject = Modify<
    FlatOpenAPIV3.ServerObject,
    {
      url: string;
      description?: string;
      variables?: Record<string, ServerVariableObject>;
    }
  >;

  export type ServerVariableObject = Modify<
    FlatOpenAPIV3.ServerVariableObject,
    {
      enum?: [string, ...string[]];
    }
  >;

  export type PathsObject<T extends {} = {}, P extends {} = {}> = Record<
    string,
    (PathItemObject<T> & P) | undefined
  >;

  export type PathItemObject<T extends {} = {}> = Modify<
    FlatOpenAPIV3.PathItemObject<T>,
    {
      servers?: ServerObject[];
      parameters?: ParameterObject[];
    }
  > & {
    [method in HttpMethods]?: OperationObject<T>;
  };

  export type OperationObject<T extends {} = {}> = Modify<
    FlatOpenAPIV3.OperationObject<T>,
    {
      parameters?: ParameterObject[];
      requestBody?: RequestBodyObject;
      responses?: ResponsesObject;
      callbacks?: Record<string, CallbackObject>;
      servers?: ServerObject[];
    }
  > &
    T;

  export type ExternalDocumentationObject =
    FlatOpenAPIV3.ExternalDocumentationObject;

  export type ParameterObject = FlatOpenAPIV3.ParameterObject;

  export type HeaderObject = FlatOpenAPIV3.HeaderObject;

  export type ParameterBaseObject = FlatOpenAPIV3.ParameterBaseObject;

  export type NonArraySchemaObjectType =
    | FlatOpenAPIV3.NonArraySchemaObjectType
    | 'null';

  export type ArraySchemaObjectType = FlatOpenAPIV3.ArraySchemaObjectType;

  /**
   * There is no way to tell typescript to require items when type is either 'array' or array containing 'array' type
   * 'items' will be always visible as optional
   * Casting schema object to ArraySchemaObject or NonArraySchemaObject will work fine
   */
  export type SchemaObject =
    | ArraySchemaObject
    | NonArraySchemaObject
    | MixedSchemaObject;

  export interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType;
    items: SchemaObject;
  }

  export interface NonArraySchemaObject extends BaseSchemaObject {
    type?: NonArraySchemaObjectType;
  }

  interface MixedSchemaObject extends BaseSchemaObject {
    type?: (ArraySchemaObjectType | NonArraySchemaObjectType)[];
    items?: SchemaObject;
  }

  export type BaseSchemaObject = Modify<
    Omit<FlatOpenAPIV3.BaseSchemaObject, 'nullable'>,
    {
      examples?: FlatOpenAPIV3.BaseSchemaObject['example'][];
      exclusiveMinimum?: boolean | number;
      exclusiveMaximum?: boolean | number;
      contentMediaType?: string;
      $schema?: string;
      additionalProperties?: boolean | SchemaObject;
      properties?: {
        [name: string]: SchemaObject;
      };
      allOf?: SchemaObject[];
      oneOf?: SchemaObject[];
      anyOf?: SchemaObject[];
      not?: SchemaObject;
      discriminator?: DiscriminatorObject;
      externalDocs?: ExternalDocumentationObject;
      xml?: XMLObject;
      const?: any;
    }
  >;

  export type DiscriminatorObject = FlatOpenAPIV3.DiscriminatorObject;

  export type XMLObject = FlatOpenAPIV3.XMLObject;

  export type ExampleObject = FlatOpenAPIV3.ExampleObject;

  export type MediaTypeObject = Modify<
    FlatOpenAPIV3.MediaTypeObject,
    {
      schema?: SchemaObject;
      examples?: Record<string, ExampleObject>;
    }
  >;

  export type EncodingObject = FlatOpenAPIV3.EncodingObject;

  export type RequestBodyObject = Modify<
    FlatOpenAPIV3.RequestBodyObject,
    {
      content: { [media: string]: MediaTypeObject };
    }
  >;

  export type ResponsesObject = Record<string, ResponseObject>;

  export type ResponseObject = Modify<
    FlatOpenAPIV3.ResponseObject,
    {
      headers?: { [header: string]: HeaderObject };
      content?: { [media: string]: MediaTypeObject };
      links?: { [link: string]: LinkObject };
    }
  >;

  export type LinkObject = Modify<
    FlatOpenAPIV3.LinkObject,
    {
      server?: ServerObject;
    }
  >;

  export type CallbackObject = Record<string, PathItemObject>;

  export type SecurityRequirementObject =
    FlatOpenAPIV3.SecurityRequirementObject;

  export type ComponentsObject = Modify<
    FlatOpenAPIV3.ComponentsObject,
    {
      schemas?: Record<string, SchemaObject>;
      responses?: Record<string, ResponseObject>;
      parameters?: Record<string, ParameterObject>;
      examples?: Record<string, ExampleObject>;
      requestBodies?: Record<string, RequestBodyObject>;
      headers?: Record<string, HeaderObject>;
      securitySchemes?: Record<string, SecuritySchemeObject>;
      links?: Record<string, LinkObject>;
      callbacks?: Record<string, CallbackObject>;
      pathItems?: Record<string, PathItemObject>;
    }
  >;

  export type SecuritySchemeObject = FlatOpenAPIV3.SecuritySchemeObject;

  export type HttpSecurityScheme = FlatOpenAPIV3.HttpSecurityScheme;

  export type ApiKeySecurityScheme = FlatOpenAPIV3.ApiKeySecurityScheme;

  export type OAuth2SecurityScheme = FlatOpenAPIV3.OAuth2SecurityScheme;

  export type OpenIdSecurityScheme = FlatOpenAPIV3.OpenIdSecurityScheme;

  export type TagObject = FlatOpenAPIV3.TagObject;
}

export namespace FlatOpenAPIV3 {
  export interface Document<T extends {} = {}> {
    openapi: string;
    info: InfoObject;
    servers?: ServerObject[];
    paths: PathsObject<T>;
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject;
    'x-express-openapi-additional-middleware'?: (
      | ((request: any, response: any, next: any) => Promise<void>)
      | ((request: any, response: any, next: any) => void)
    )[];
    'x-express-openapi-validation-strict'?: boolean;
  }

  export interface InfoObject {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
  }

  export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
  }

  export interface LicenseObject {
    name: string;
    url?: string;
  }

  export interface ServerObject {
    url: string;
    description?: string;
    variables?: { [variable: string]: ServerVariableObject };
  }

  export interface ServerVariableObject {
    enum?: string[];
    default: string;
    description?: string;
  }

  export interface PathsObject<T extends {} = {}, P extends {} = {}> {
    [pattern: string]: (PathItemObject<T> & P) | undefined;
  }

  // All HTTP methods allowed by OpenAPI 3 spec
  // See https://swagger.io/specification/#path-item-object
  // You can use keys or values from it in TypeScript code like this:
  //     for (const method of Object.values(OpenAPIV3.HttpMethods)) { … }
  export type PathItemObject<T extends {} = {}> = {
    summary?: string;
    description?: string;
    servers?: ServerObject[];
    parameters?: ParameterObject[];
  } & {
    [method in HttpMethods]?: OperationObject<T>;
  };

  export type OperationObject<T extends {} = {}> = {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    parameters?: ParameterObject[];
    requestBody?: RequestBodyObject;
    responses: ResponsesObject;
    callbacks?: { [callback: string]: CallbackObject };
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
  } & T;

  export interface ExternalDocumentationObject {
    description?: string;
    url: string;
  }

  export interface ParameterObject extends ParameterBaseObject {
    name: string;
    in: string;
  }

  export interface HeaderObject extends ParameterBaseObject {}

  export interface ParameterBaseObject {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: SchemaObject;
    example?: any;
    examples?: { [media: string]: ExampleObject };
    content?: { [media: string]: MediaTypeObject };
  }
  export type NonArraySchemaObjectType =
    | 'boolean'
    | 'object'
    | 'number'
    | 'string'
    | 'integer';
  export type ArraySchemaObjectType = 'array';
  export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

  export interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType;
    items: SchemaObject;
  }

  export interface NonArraySchemaObject extends BaseSchemaObject {
    type?: NonArraySchemaObjectType;
  }

  export interface BaseSchemaObject {
    // JSON schema allowed properties, adjusted for OpenAPI
    title?: string;
    description?: string;
    format?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    additionalProperties?: boolean | SchemaObject;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
    properties?: {
      [name: string]: SchemaObject;
    };
    allOf?: SchemaObject[];
    oneOf?: SchemaObject[];
    anyOf?: SchemaObject[];
    not?: SchemaObject;

    // OpenAPI-specific properties
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XMLObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    deprecated?: boolean;
  }

  export interface DiscriminatorObject {
    propertyName: string;
    mapping?: { [value: string]: string };
  }

  export interface XMLObject {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
  }

  export interface ExampleObject {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
  }

  export interface MediaTypeObject {
    schema?: SchemaObject;
    example?: any;
    examples?: { [media: string]: ExampleObject };
    encoding?: { [media: string]: EncodingObject };
  }

  export interface EncodingObject {
    contentType?: string;
    headers?: { [header: string]: HeaderObject };
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
  }

  export interface RequestBodyObject {
    description?: string;
    content: { [media: string]: MediaTypeObject };
    required?: boolean;
  }

  export interface ResponsesObject {
    [code: string]: ResponseObject;
  }

  export interface ResponseObject {
    description: string;
    headers?: { [header: string]: HeaderObject };
    content?: { [media: string]: MediaTypeObject };
    links?: { [link: string]: LinkObject };
  }

  export interface LinkObject {
    operationRef?: string;
    operationId?: string;
    parameters?: { [parameter: string]: any };
    requestBody?: any;
    description?: string;
    server?: ServerObject;
  }

  export interface CallbackObject {
    [url: string]: PathItemObject;
  }

  export interface SecurityRequirementObject {
    [name: string]: string[];
  }

  export interface ComponentsObject {
    schemas?: { [key: string]: SchemaObject };
    responses?: { [key: string]: ResponseObject };
    parameters?: { [key: string]: ParameterObject };
    examples?: { [key: string]: ExampleObject };
    requestBodies?: { [key: string]: RequestBodyObject };
    headers?: { [key: string]: HeaderObject };
    securitySchemes?: { [key: string]: SecuritySchemeObject };
    links?: { [key: string]: LinkObject };
    callbacks?: { [key: string]: CallbackObject };
  }

  export type SecuritySchemeObject =
    | HttpSecurityScheme
    | ApiKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdSecurityScheme;

  export interface HttpSecurityScheme {
    type: 'http';
    description?: string;
    scheme: string;
    bearerFormat?: string;
  }

  export interface ApiKeySecurityScheme {
    type: 'apiKey';
    description?: string;
    name: string;
    in: string;
  }

  export interface OAuth2SecurityScheme {
    type: 'oauth2';
    description?: string;
    flows: {
      implicit?: {
        authorizationUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
      password?: {
        tokenUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
      clientCredentials?: {
        tokenUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
      authorizationCode?: {
        authorizationUrl: string;
        tokenUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
    };
  }

  export interface OpenIdSecurityScheme {
    type: 'openIdConnect';
    description?: string;
    openIdConnectUrl: string;
  }

  export interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
  }
}

export namespace FlatOpenAPIV2 {
  export interface Document<T extends {} = {}> {
    basePath?: string;
    consumes?: MimeTypes;
    definitions?: DefinitionsObject;
    externalDocs?: ExternalDocumentationObject;
    host?: string;
    info: InfoObject;
    parameters?: ParametersDefinitionsObject;
    paths: PathsObject<T>;
    produces?: MimeTypes;
    responses?: ResponsesDefinitionsObject;
    schemes?: string[];
    security?: SecurityRequirementObject[];
    securityDefinitions?: SecurityDefinitionsObject;
    swagger: string;
    tags?: TagObject[];
    'x-express-openapi-additional-middleware'?: (
      | ((request: any, response: any, next: any) => Promise<void>)
      | ((request: any, response: any, next: any) => void)
    )[];
    'x-express-openapi-validation-strict'?: boolean;
  }

  export interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
  }

  export interface SecuritySchemeObjectBase {
    type: 'basic' | 'apiKey' | 'oauth2';
    description?: string;
  }

  export interface SecuritySchemeBasic extends SecuritySchemeObjectBase {
    type: 'basic';
  }

  export interface SecuritySchemeApiKey extends SecuritySchemeObjectBase {
    type: 'apiKey';
    name: string;
    in: string;
  }

  export type SecuritySchemeOauth2 =
    | SecuritySchemeOauth2Implicit
    | SecuritySchemeOauth2AccessCode
    | SecuritySchemeOauth2Password
    | SecuritySchemeOauth2Application;

  export interface ScopesObject {
    [index: string]: any;
  }

  export interface SecuritySchemeOauth2Base extends SecuritySchemeObjectBase {
    type: 'oauth2';
    flow: 'implicit' | 'password' | 'application' | 'accessCode';
    scopes: ScopesObject;
  }

  export interface SecuritySchemeOauth2Implicit
    extends SecuritySchemeOauth2Base {
    flow: 'implicit';
    authorizationUrl: string;
  }

  export interface SecuritySchemeOauth2AccessCode
    extends SecuritySchemeOauth2Base {
    flow: 'accessCode';
    authorizationUrl: string;
    tokenUrl: string;
  }

  export interface SecuritySchemeOauth2Password
    extends SecuritySchemeOauth2Base {
    flow: 'password';
    tokenUrl: string;
  }

  export interface SecuritySchemeOauth2Application
    extends SecuritySchemeOauth2Base {
    flow: 'application';
    tokenUrl: string;
  }

  export type SecuritySchemeObject =
    | SecuritySchemeBasic
    | SecuritySchemeApiKey
    | SecuritySchemeOauth2;

  export interface SecurityDefinitionsObject {
    [index: string]: SecuritySchemeObject;
  }

  export interface SecurityRequirementObject {
    [index: string]: string[];
  }

  export type Response = ResponseObject;

  export interface ResponsesDefinitionsObject {
    [index: string]: ResponseObject;
  }

  export type Schema = SchemaObject;

  export interface ResponseObject {
    description: string;
    schema?: Schema;
    headers?: HeadersObject;
    examples?: ExampleObject;
  }

  export interface HeadersObject {
    [index: string]: HeaderObject;
  }

  export interface HeaderObject extends ItemsObject {}

  export interface ExampleObject {
    [index: string]: any;
  }

  export interface ResponseObject {
    description: string;
    schema?: Schema;
    headers?: HeadersObject;
    examples?: ExampleObject;
  }

  export type OperationObject<T extends {} = {}> = {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    consumes?: MimeTypes;
    produces?: MimeTypes;
    parameters?: Parameters;
    responses: ResponsesObject;
    schemes?: string[];
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
  } & T;

  export interface ResponsesObject {
    [index: string]: Response | undefined;
    default?: Response;
  }

  export type Parameters = Parameter[];

  export type Parameter = InBodyParameterObject | GeneralParameterObject;

  export interface InBodyParameterObject extends ParameterObject {
    schema: Schema;
  }

  export interface GeneralParameterObject extends ParameterObject, ItemsObject {
    allowEmptyValue?: boolean;
  }

  // All HTTP methods allowed by OpenAPI 2 spec
  // See https://swagger.io/specification/v2#path-item-object
  // You can use keys or values from it in TypeScript code like this:
  //     for (const method of Object.values(OpenAPIV2.HttpMethods)) { … }
  export enum HttpMethods {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    DELETE = 'delete',
    OPTIONS = 'options',
    HEAD = 'head',
    PATCH = 'patch',
  }

  export type PathItemObject<T extends {} = {}> = {
    parameters?: Parameters;
  } & {
    [method in HttpMethods]?: OperationObject<T>;
  };

  export interface PathsObject<T extends {} = {}> {
    [index: string]: PathItemObject<T>;
  }

  export interface ParametersDefinitionsObject {
    [index: string]: ParameterObject;
  }

  export interface ParameterObject {
    name: string;
    in: string;
    description?: string;
    required?: boolean;
    [index: string]: any;
  }

  export type MimeTypes = string[];

  export interface DefinitionsObject {
    [index: string]: SchemaObject;
  }

  export interface SchemaObject extends IJsonSchema {
    [index: string]: any;
    discriminator?: string;
    readOnly?: boolean;
    xml?: XMLObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    default?: any;
    items?: ItemsObject;
    properties?: {
      [name: string]: SchemaObject;
    };
  }

  export interface ExternalDocumentationObject {
    [index: string]: any;
    description?: string;
    url: string;
  }

  export interface ItemsObject {
    type: string;
    format?: string;
    items?: ItemsObject;
    collectionFormat?: string;
    default?: any;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    enum?: any[];
    multipleOf?: number;
  }

  export interface XMLObject {
    [index: string]: any;
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
  }

  export interface InfoObject {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
  }

  export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
  }

  export interface LicenseObject {
    name: string;
    url?: string;
  }
}

export interface IJsonSchema {
  id?: string;
  $schema?: string;
  title?: string;
  description?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  additionalItems?: boolean | IJsonSchema;
  items?: IJsonSchema | IJsonSchema[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: boolean | IJsonSchema;
  definitions?: {
    [name: string]: IJsonSchema;
  };
  properties?: {
    [name: string]: IJsonSchema;
  };
  patternProperties?: {
    [name: string]: IJsonSchema;
  };
  dependencies?: {
    [name: string]: IJsonSchema | string[];
  };
  enum?: any[];
  type?: string | string[];
  allOf?: IJsonSchema[];
  anyOf?: IJsonSchema[];
  oneOf?: IJsonSchema[];
  not?: IJsonSchema;
}
