export const basic_swagger2_object = {
  $id: 'root_basic_swagger_object_schema',
  type: 'object',
  required: ['swagger', 'info', 'paths'],
  properties: {
    swagger: {
      type: 'string',
      enum: ['2.0'],
    },
    info: {
      type: 'object',
    },
    paths: {
      type: 'object',
      patternProperties: {
        '^/': {
          type: 'object',
          properties: {
            get: {
              $ref: '#/definitions/operation',
            },
            put: {
              $ref: '#/definitions/operation',
            },
            post: {
              $ref: '#/definitions/operation',
            },
            delete: {
              $ref: '#/definitions/operation',
            },
            options: {
              $ref: '#/definitions/operation',
            },
            head: {
              $ref: '#/definitions/operation',
            },
            patch: {
              $ref: '#/definitions/operation',
            },
          },
        },
      },
    },
  },
  definitions: {
    operation: {
      type: 'object',
      required: ['responses'],
      properties: {
        responses: {
          type: 'object',
          additionalProperties: {
            type: 'object',
          },
        },
      },
    },
  },
};

export const swagger2_schema_object = {
  title: 'A JSON Schema for Swagger 2.0 API.',
  $id: 'http://swagger.io/v2/schema.json#',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['swagger', 'info', 'paths'],
  additionalProperties: false,
  patternProperties: {
    '^x-': {
      $ref: '#/definitions/vendorExtension',
    },
  },
  properties: {
    swagger: {
      type: 'string',
      enum: ['2.0'],
      description: 'The Swagger version of this document.',
    },
    info: {
      $ref: '#/definitions/info',
    },
    host: {
      type: 'string',
      pattern: '^[^{}/ :\\\\]+(?::\\d+)?$',
      description: "The host (name or ip) of the API. Example: 'swagger.io'",
    },
    basePath: {
      type: 'string',
      pattern: '^/',
      description: "The base path to the API. Example: '/api'.",
    },
    schemes: {
      $ref: '#/definitions/schemesList',
    },
    consumes: {
      description: 'A list of MIME types accepted by the API.',
      $ref: '#/definitions/mediaTypeList',
    },
    produces: {
      description: 'A list of MIME types the API can produce.',
      $ref: '#/definitions/mediaTypeList',
    },
    paths: {
      $ref: '#/definitions/paths',
    },
    definitions: {
      $ref: '#/definitions/definitions',
    },
    parameters: {
      $ref: '#/definitions/parameterDefinitions',
    },
    responses: {
      $ref: '#/definitions/responseDefinitions',
    },
    security: {
      $ref: '#/definitions/security',
    },
    securityDefinitions: {
      $ref: '#/definitions/securityDefinitions',
    },
    tags: {
      type: 'array',
      items: {
        $ref: '#/definitions/tag',
      },
      uniqueItems: true,
    },
    externalDocs: {
      $ref: '#/definitions/externalDocs',
    },
  },
  definitions: {
    info: {
      type: 'object',
      description: 'General information about the API.',
      required: ['version', 'title'],
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        title: {
          type: 'string',
          description: 'A unique and precise title of the API.',
        },
        version: {
          type: 'string',
          description: 'A semantic version number of the API.',
        },
        description: {
          type: 'string',
          description:
            'A longer description of the API. Should be different from the title.  GitHub Flavored Markdown is allowed.',
        },
        termsOfService: {
          type: 'string',
          description: 'The terms of service for the API.',
        },
        contact: {
          $ref: '#/definitions/contact',
        },
        license: {
          $ref: '#/definitions/license',
        },
      },
    },
    contact: {
      type: 'object',
      description: 'Contact information for the owners of the API.',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
          description:
            'The identifying name of the contact person/organization.',
        },
        url: {
          type: 'string',
          description: 'The URL pointing to the contact information.',
          format: 'uri',
        },
        email: {
          type: 'string',
          description: 'The email address of the contact person/organization.',
          format: 'email',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    license: {
      type: 'object',
      required: ['name'],
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
          description:
            "The name of the license type. It's encouraged to use an OSI compatible license.",
        },
        url: {
          type: 'string',
          description: 'The URL pointing to the license.',
          format: 'uri',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    paths: {
      type: 'object',
      description:
        "Relative paths to the individual endpoints. They must be relative to the 'basePath'.",
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
        '^/': {
          $ref: '#/definitions/pathItem',
        },
      },
      additionalProperties: false,
    },
    definitions: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/schema',
      },
      description:
        'One or more JSON objects describing the schemas being consumed and produced by the API.',
    },
    parameterDefinitions: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/parameter',
      },
      description: 'One or more JSON representations for parameters',
    },
    responseDefinitions: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/response',
      },
      description: 'One or more JSON representations for parameters',
    },
    externalDocs: {
      type: 'object',
      additionalProperties: false,
      description: 'information about external documentation',
      required: ['url'],
      properties: {
        description: {
          type: 'string',
        },
        url: {
          type: 'string',
          format: 'uri',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    examples: {
      type: 'object',
      additionalProperties: true,
    },
    mimeType: {
      type: 'string',
      description: 'The MIME type of the HTTP message.',
    },
    operation: {
      type: 'object',
      required: ['responses'],
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          uniqueItems: true,
        },
        summary: {
          type: 'string',
          description: 'A brief summary of the operation.',
        },
        description: {
          type: 'string',
          description:
            'A longer description of the operation, GitHub Flavored Markdown is allowed.',
        },
        externalDocs: {
          $ref: '#/definitions/externalDocs',
        },
        operationId: {
          type: 'string',
          description: 'A unique identifier of the operation.',
        },
        produces: {
          description: 'A list of MIME types the API can produce.',
          $ref: '#/definitions/mediaTypeList',
        },
        consumes: {
          description: 'A list of MIME types the API can consume.',
          $ref: '#/definitions/mediaTypeList',
        },
        parameters: {
          $ref: '#/definitions/parametersList',
        },
        responses: {
          $ref: '#/definitions/responses',
        },
        schemes: {
          $ref: '#/definitions/schemesList',
        },
        deprecated: {
          type: 'boolean',
          default: false,
        },
        security: {
          $ref: '#/definitions/security',
        },
      },
    },
    pathItem: {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        $ref: {
          type: 'string',
        },
        get: {
          $ref: '#/definitions/operation',
        },
        put: {
          $ref: '#/definitions/operation',
        },
        post: {
          $ref: '#/definitions/operation',
        },
        delete: {
          $ref: '#/definitions/operation',
        },
        options: {
          $ref: '#/definitions/operation',
        },
        head: {
          $ref: '#/definitions/operation',
        },
        patch: {
          $ref: '#/definitions/operation',
        },
        parameters: {
          $ref: '#/definitions/parametersList',
        },
      },
    },
    responses: {
      type: 'object',
      description:
        "Response objects names can either be any valid HTTP status code or 'default'.",
      minProperties: 1,
      additionalProperties: false,
      patternProperties: {
        '^([0-9]{3})$|^(default)$': {
          $ref: '#/definitions/responseValue',
        },
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      not: {
        type: 'object',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/vendorExtension',
          },
        },
      },
    },
    responseValue: {
      oneOf: [
        {
          $ref: '#/definitions/response',
        },
        {
          $ref: '#/definitions/jsonReference',
        },
      ],
    },
    response: {
      type: 'object',
      required: ['description'],
      properties: {
        description: {
          type: 'string',
        },
        schema: {
          oneOf: [
            {
              $ref: '#/definitions/schema',
            },
            {
              $ref: '#/definitions/fileSchema',
            },
          ],
        },
        headers: {
          $ref: '#/definitions/headers',
        },
        examples: {
          $ref: '#/definitions/examples',
        },
      },
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    headers: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/header',
      },
    },
    header: {
      type: 'object',
      additionalProperties: false,
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: ['string', 'number', 'integer', 'boolean', 'array'],
        },
        format: {
          type: 'string',
        },
        items: {
          $ref: '#/definitions/primitivesItems',
        },
        collectionFormat: {
          $ref: '#/definitions/collectionFormat',
        },
        default: {
          $ref: '#/definitions/default',
        },
        maximum: {
          $ref: '#/definitions/maximum',
        },
        exclusiveMaximum: {
          $ref: '#/definitions/exclusiveMaximum',
        },
        minimum: {
          $ref: '#/definitions/minimum',
        },
        exclusiveMinimum: {
          $ref: '#/definitions/exclusiveMinimum',
        },
        maxLength: {
          $ref: '#/definitions/maxLength',
        },
        minLength: {
          $ref: '#/definitions/minLength',
        },
        pattern: {
          $ref: '#/definitions/pattern',
        },
        maxItems: {
          $ref: '#/definitions/maxItems',
        },
        minItems: {
          $ref: '#/definitions/minItems',
        },
        uniqueItems: {
          $ref: '#/definitions/uniqueItems',
        },
        enum: {
          $ref: '#/definitions/enum',
        },
        multipleOf: {
          $ref: '#/definitions/multipleOf',
        },
        description: {
          type: 'string',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    vendorExtension: {
      description: 'Any property starting with x- is valid.',
      additionalProperties: true,
      additionalItems: true,
    },
    bodyParameter: {
      type: 'object',
      required: ['name', 'in', 'schema'],
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        description: {
          type: 'string',
          description:
            'A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed.',
        },
        name: {
          type: 'string',
          description: 'The name of the parameter.',
        },
        in: {
          type: 'string',
          description: 'Determines the location of the parameter.',
          enum: ['body'],
        },
        required: {
          type: 'boolean',
          description:
            'Determines whether or not this parameter is required or optional.',
          default: false,
        },
        schema: {
          $ref: '#/definitions/schema',
        },
      },
      additionalProperties: false,
    },
    headerParameterSubSchema: {
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        required: {
          type: 'boolean',
          description:
            'Determines whether or not this parameter is required or optional.',
          default: false,
        },
        in: {
          type: 'string',
          description: 'Determines the location of the parameter.',
          enum: ['header'],
        },
        description: {
          type: 'string',
          description:
            'A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed.',
        },
        name: {
          type: 'string',
          description: 'The name of the parameter.',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'integer', 'array'],
        },
        format: {
          type: 'string',
        },
        items: {
          $ref: '#/definitions/primitivesItems',
        },
        collectionFormat: {
          $ref: '#/definitions/collectionFormat',
        },
        default: {
          $ref: '#/definitions/default',
        },
        maximum: {
          $ref: '#/definitions/maximum',
        },
        exclusiveMaximum: {
          $ref: '#/definitions/exclusiveMaximum',
        },
        minimum: {
          $ref: '#/definitions/minimum',
        },
        exclusiveMinimum: {
          $ref: '#/definitions/exclusiveMinimum',
        },
        maxLength: {
          $ref: '#/definitions/maxLength',
        },
        minLength: {
          $ref: '#/definitions/minLength',
        },
        pattern: {
          $ref: '#/definitions/pattern',
        },
        maxItems: {
          $ref: '#/definitions/maxItems',
        },
        minItems: {
          $ref: '#/definitions/minItems',
        },
        uniqueItems: {
          $ref: '#/definitions/uniqueItems',
        },
        enum: {
          $ref: '#/definitions/enum',
        },
        multipleOf: {
          $ref: '#/definitions/multipleOf',
        },
      },
    },
    queryParameterSubSchema: {
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        required: {
          type: 'boolean',
          description:
            'Determines whether or not this parameter is required or optional.',
          default: false,
        },
        in: {
          type: 'string',
          description: 'Determines the location of the parameter.',
          enum: ['query'],
        },
        description: {
          type: 'string',
          description:
            'A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed.',
        },
        name: {
          type: 'string',
          description: 'The name of the parameter.',
        },
        allowEmptyValue: {
          type: 'boolean',
          default: false,
          description:
            'allows sending a parameter by name only or with an empty value.',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'integer', 'array'],
        },
        format: {
          type: 'string',
        },
        items: {
          $ref: '#/definitions/primitivesItems',
        },
        collectionFormat: {
          $ref: '#/definitions/collectionFormatWithMulti',
        },
        default: {
          $ref: '#/definitions/default',
        },
        maximum: {
          $ref: '#/definitions/maximum',
        },
        exclusiveMaximum: {
          $ref: '#/definitions/exclusiveMaximum',
        },
        minimum: {
          $ref: '#/definitions/minimum',
        },
        exclusiveMinimum: {
          $ref: '#/definitions/exclusiveMinimum',
        },
        maxLength: {
          $ref: '#/definitions/maxLength',
        },
        minLength: {
          $ref: '#/definitions/minLength',
        },
        pattern: {
          $ref: '#/definitions/pattern',
        },
        maxItems: {
          $ref: '#/definitions/maxItems',
        },
        minItems: {
          $ref: '#/definitions/minItems',
        },
        uniqueItems: {
          $ref: '#/definitions/uniqueItems',
        },
        enum: {
          $ref: '#/definitions/enum',
        },
        multipleOf: {
          $ref: '#/definitions/multipleOf',
        },
      },
    },
    formDataParameterSubSchema: {
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        required: {
          type: 'boolean',
          description:
            'Determines whether or not this parameter is required or optional.',
          default: false,
        },
        in: {
          type: 'string',
          description: 'Determines the location of the parameter.',
          enum: ['formData'],
        },
        description: {
          type: 'string',
          description:
            'A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed.',
        },
        name: {
          type: 'string',
          description: 'The name of the parameter.',
        },
        allowEmptyValue: {
          type: 'boolean',
          default: false,
          description:
            'allows sending a parameter by name only or with an empty value.',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'integer', 'array', 'file'],
        },
        format: {
          type: 'string',
        },
        items: {
          $ref: '#/definitions/primitivesItems',
        },
        collectionFormat: {
          $ref: '#/definitions/collectionFormatWithMulti',
        },
        default: {
          $ref: '#/definitions/default',
        },
        maximum: {
          $ref: '#/definitions/maximum',
        },
        exclusiveMaximum: {
          $ref: '#/definitions/exclusiveMaximum',
        },
        minimum: {
          $ref: '#/definitions/minimum',
        },
        exclusiveMinimum: {
          $ref: '#/definitions/exclusiveMinimum',
        },
        maxLength: {
          $ref: '#/definitions/maxLength',
        },
        minLength: {
          $ref: '#/definitions/minLength',
        },
        pattern: {
          $ref: '#/definitions/pattern',
        },
        maxItems: {
          $ref: '#/definitions/maxItems',
        },
        minItems: {
          $ref: '#/definitions/minItems',
        },
        uniqueItems: {
          $ref: '#/definitions/uniqueItems',
        },
        enum: {
          $ref: '#/definitions/enum',
        },
        multipleOf: {
          $ref: '#/definitions/multipleOf',
        },
      },
    },
    pathParameterSubSchema: {
      additionalProperties: false,
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      required: ['required'],
      properties: {
        required: {
          type: 'boolean',
          enum: [true],
          description:
            'Determines whether or not this parameter is required or optional.',
        },
        in: {
          type: 'string',
          description: 'Determines the location of the parameter.',
          enum: ['path'],
        },
        description: {
          type: 'string',
          description:
            'A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed.',
        },
        name: {
          type: 'string',
          description: 'The name of the parameter.',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'integer', 'array'],
        },
        format: {
          type: 'string',
        },
        items: {
          $ref: '#/definitions/primitivesItems',
        },
        collectionFormat: {
          $ref: '#/definitions/collectionFormat',
        },
        default: {
          $ref: '#/definitions/default',
        },
        maximum: {
          $ref: '#/definitions/maximum',
        },
        exclusiveMaximum: {
          $ref: '#/definitions/exclusiveMaximum',
        },
        minimum: {
          $ref: '#/definitions/minimum',
        },
        exclusiveMinimum: {
          $ref: '#/definitions/exclusiveMinimum',
        },
        maxLength: {
          $ref: '#/definitions/maxLength',
        },
        minLength: {
          $ref: '#/definitions/minLength',
        },
        pattern: {
          $ref: '#/definitions/pattern',
        },
        maxItems: {
          $ref: '#/definitions/maxItems',
        },
        minItems: {
          $ref: '#/definitions/minItems',
        },
        uniqueItems: {
          $ref: '#/definitions/uniqueItems',
        },
        enum: {
          $ref: '#/definitions/enum',
        },
        multipleOf: {
          $ref: '#/definitions/multipleOf',
        },
      },
    },
    nonBodyParameter: {
      type: 'object',
      required: ['name', 'in', 'type'],
      oneOf: [
        {
          $ref: '#/definitions/headerParameterSubSchema',
        },
        {
          $ref: '#/definitions/formDataParameterSubSchema',
        },
        {
          $ref: '#/definitions/queryParameterSubSchema',
        },
        {
          $ref: '#/definitions/pathParameterSubSchema',
        },
      ],
    },
    parameter: {
      oneOf: [
        {
          $ref: '#/definitions/bodyParameter',
        },
        {
          $ref: '#/definitions/nonBodyParameter',
        },
      ],
    },
    schema: {
      type: 'object',
      description: 'A deterministic version of a JSON Schema object.',
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      properties: {
        $ref: {
          type: 'string',
        },
        format: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        default: true,
        multipleOf: {
          type: 'number',
          exclusiveMinimum: 0,
        },
        maximum: {
          type: 'number',
        },
        exclusiveMaximum: {
          type: 'number',
        },
        minimum: {
          type: 'number',
        },
        exclusiveMinimum: {
          type: 'number',
        },
        maxLength: {
          type: 'number',
          minimum: 0,
        },
        minLength: {
          allOf: [{ type: 'number', minimum: 0 }, { default: 0 }],
        },
        pattern: {
          type: 'string',
          format: 'regex',
        },
        maxItems: {
          type: 'number',
          minimum: 0,
        },
        minItems: {
          allOf: [{ type: 'number', minimum: 0 }, { default: 0 }],
        },
        uniqueItems: {
          type: 'boolean',
          default: false,
        },
        maxProperties: {
          type: 'number',
          minimum: 0,
        },
        minProperties: {
          allOf: [{ type: 'number', minimum: 0 }, { default: 0 }],
        },
        required: {
          type: 'array',
          items: {
            type: 'string',
          },
          uniqueItems: true,
          default: [],
        },
        enum: {
          type: 'array',
          items: true,
          minItems: 1,
          uniqueItems: true,
        },
        additionalProperties: {
          anyOf: [
            {
              $ref: '#/definitions/schema',
            },
            {
              type: 'boolean',
            },
          ],
          default: {},
        },
        type: {
          anyOf: [
            {
              enum: [
                'array',
                'boolean',
                'integer',
                'null',
                'number',
                'object',
                'string',
              ],
            },
            {
              type: 'array',
              items: {
                enum: [
                  'array',
                  'boolean',
                  'integer',
                  'null',
                  'number',
                  'object',
                  'string',
                ],
              },
              minItems: 1,
              uniqueItems: true,
            },
          ],
        },
        items: {
          anyOf: [
            {
              $ref: '#/definitions/schema',
            },
            {
              type: 'array',
              minItems: 1,
              items: {
                $ref: '#/definitions/schema',
              },
            },
          ],
          default: {},
        },
        allOf: {
          type: 'array',
          minItems: 1,
          items: {
            $ref: '#/definitions/schema',
          },
        },
        properties: {
          type: 'object',
          additionalProperties: {
            $ref: '#/definitions/schema',
          },
          default: {},
        },
        discriminator: {
          type: 'string',
        },
        readOnly: {
          type: 'boolean',
          default: false,
        },
        xml: {
          $ref: '#/definitions/xml',
        },
        externalDocs: {
          $ref: '#/definitions/externalDocs',
        },
        example: {},
      },
      additionalProperties: false,
    },
    fileSchema: {
      type: 'object',
      description: 'A deterministic version of a JSON Schema object.',
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
      required: ['type'],
      properties: {
        format: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        default: true,
        required: {
          type: 'array',
          items: {
            type: 'string',
          },
          uniqueItems: true,
          default: [],
        },
        type: {
          type: 'string',
          enum: ['file'],
        },
        readOnly: {
          type: 'boolean',
          default: false,
        },
        externalDocs: {
          $ref: '#/definitions/externalDocs',
        },
        example: {},
      },
      additionalProperties: false,
    },
    primitivesItems: {
      type: 'object',
      additionalProperties: false,
      properties: {
        type: {
          type: 'string',
          enum: ['string', 'number', 'integer', 'boolean', 'array'],
        },
        format: {
          type: 'string',
        },
        items: {
          $ref: '#/definitions/primitivesItems',
        },
        collectionFormat: {
          $ref: '#/definitions/collectionFormat',
        },
        default: {
          $ref: '#/definitions/default',
        },
        maximum: {
          $ref: '#/definitions/maximum',
        },
        exclusiveMaximum: {
          $ref: '#/definitions/exclusiveMaximum',
        },
        minimum: {
          $ref: '#/definitions/minimum',
        },
        exclusiveMinimum: {
          $ref: '#/definitions/exclusiveMinimum',
        },
        maxLength: {
          $ref: '#/definitions/maxLength',
        },
        minLength: {
          $ref: '#/definitions/minLength',
        },
        pattern: {
          $ref: '#/definitions/pattern',
        },
        maxItems: {
          $ref: '#/definitions/maxItems',
        },
        minItems: {
          $ref: '#/definitions/minItems',
        },
        uniqueItems: {
          $ref: '#/definitions/uniqueItems',
        },
        enum: {
          $ref: '#/definitions/enum',
        },
        multipleOf: {
          $ref: '#/definitions/multipleOf',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    security: {
      type: 'array',
      items: {
        $ref: '#/definitions/securityRequirement',
      },
      uniqueItems: true,
    },
    securityRequirement: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
        uniqueItems: true,
      },
    },
    xml: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
        },
        namespace: {
          type: 'string',
        },
        prefix: {
          type: 'string',
        },
        attribute: {
          type: 'boolean',
          default: false,
        },
        wrapped: {
          type: 'boolean',
          default: false,
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    tag: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        externalDocs: {
          $ref: '#/definitions/externalDocs',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    securityDefinitions: {
      type: 'object',
      additionalProperties: {
        oneOf: [
          {
            $ref: '#/definitions/basicAuthenticationSecurity',
          },
          {
            $ref: '#/definitions/apiKeySecurity',
          },
          {
            $ref: '#/definitions/oauth2ImplicitSecurity',
          },
          {
            $ref: '#/definitions/oauth2PasswordSecurity',
          },
          {
            $ref: '#/definitions/oauth2ApplicationSecurity',
          },
          {
            $ref: '#/definitions/oauth2AccessCodeSecurity',
          },
        ],
      },
    },
    basicAuthenticationSecurity: {
      type: 'object',
      additionalProperties: false,
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: ['basic'],
        },
        description: {
          type: 'string',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    apiKeySecurity: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'name', 'in'],
      properties: {
        type: {
          type: 'string',
          enum: ['apiKey'],
        },
        name: {
          type: 'string',
        },
        in: {
          type: 'string',
          enum: ['header', 'query'],
        },
        description: {
          type: 'string',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    oauth2ImplicitSecurity: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'flow', 'authorizationUrl'],
      properties: {
        type: {
          type: 'string',
          enum: ['oauth2'],
        },
        flow: {
          type: 'string',
          enum: ['implicit'],
        },
        scopes: {
          $ref: '#/definitions/oauth2Scopes',
        },
        authorizationUrl: {
          type: 'string',
          format: 'uri',
        },
        description: {
          type: 'string',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    oauth2PasswordSecurity: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'flow', 'tokenUrl'],
      properties: {
        type: {
          type: 'string',
          enum: ['oauth2'],
        },
        flow: {
          type: 'string',
          enum: ['password'],
        },
        scopes: {
          $ref: '#/definitions/oauth2Scopes',
        },
        tokenUrl: {
          type: 'string',
          format: 'uri',
        },
        description: {
          type: 'string',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    oauth2ApplicationSecurity: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'flow', 'tokenUrl'],
      properties: {
        type: {
          type: 'string',
          enum: ['oauth2'],
        },
        flow: {
          type: 'string',
          enum: ['application'],
        },
        scopes: {
          $ref: '#/definitions/oauth2Scopes',
        },
        tokenUrl: {
          type: 'string',
          format: 'uri',
        },
        description: {
          type: 'string',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    oauth2AccessCodeSecurity: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'flow', 'authorizationUrl', 'tokenUrl'],
      properties: {
        type: {
          type: 'string',
          enum: ['oauth2'],
        },
        flow: {
          type: 'string',
          enum: ['accessCode'],
        },
        scopes: {
          $ref: '#/definitions/oauth2Scopes',
        },
        authorizationUrl: {
          type: 'string',
          format: 'uri',
        },
        tokenUrl: {
          type: 'string',
          format: 'uri',
        },
        description: {
          type: 'string',
        },
      },
      patternProperties: {
        '^x-': {
          $ref: '#/definitions/vendorExtension',
        },
      },
    },
    oauth2Scopes: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
    mediaTypeList: {
      type: 'array',
      items: {
        $ref: '#/definitions/mimeType',
      },
      uniqueItems: true,
    },
    parametersList: {
      type: 'array',
      description: 'The parameters needed to send a valid API call.',
      additionalItems: false,
      items: {
        oneOf: [
          {
            $ref: '#/definitions/parameter',
          },
          {
            $ref: '#/definitions/jsonReference',
          },
        ],
      },
      uniqueItems: true,
    },
    schemesList: {
      type: 'array',
      description: 'The transfer protocol of the API.',
      items: {
        type: 'string',
        enum: ['http', 'https', 'ws', 'wss'],
      },
      uniqueItems: true,
    },
    collectionFormat: {
      type: 'string',
      enum: ['csv', 'ssv', 'tsv', 'pipes'],
      default: 'csv',
    },
    collectionFormatWithMulti: {
      type: 'string',
      enum: ['csv', 'ssv', 'tsv', 'pipes', 'multi'],
      default: 'csv',
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    default: true,
    multipleOf: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    maximum: {
      type: 'number',
    },
    exclusiveMaximum: {
      type: 'number',
    },
    minimum: {
      type: 'number',
    },
    exclusiveMinimum: {
      type: 'number',
    },
    maxLength: {
      type: 'number',
      minimum: 0,
    },
    minLength: {
      allOf: [{ type: 'number', minimum: 0 }, { default: 0 }],
    },
    pattern: {
      type: 'string',
      format: 'regex',
    },
    maxItems: {
      type: 'number',
      minimum: 0,
    },
    minItems: {
      allOf: [{ type: 'number', minimum: 0 }, { default: 0 }],
    },
    uniqueItems: {
      type: 'boolean',
      default: false,
    },
    enum: {
      type: 'array',
      items: true,
      minItems: 1,
      uniqueItems: true,
    },
    jsonReference: {
      type: 'object',
      required: ['$ref'],
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
      },
    },
  },
};

const openapi3_0_schema_object = {
  type: 'object',
  'x-custom-validator': 'validateSchema',
  description:
    'The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is an extended subset of the JSON Schema Specification Wright Draft 00.  For more information about the properties, see JSON Schema Core and JSON Schema Validation. Unless stated otherwise, the property definitions follow the JSON Schema.',
  additionalProperties: true,
  patternProperties: {
    '^x-': {},
  },
  properties: {
    nullable: {
      type: 'boolean',
    },
    discriminator: {
      $ref: '#/definitions/discriminator',
    },
    readOnly: {
      type: 'boolean',
    },
    writeOnly: {
      type: 'boolean',
    },
    xml: {},
    externalDocs: {},
    example: {},
    deprecated: {
      type: 'boolean',
    },
    title: {
      type: 'string',
    },
    multipleOf: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    maximum: {
      type: 'number',
    },
    exclusiveMaximum: {
      type: 'boolean',
      default: false,
    },
    minimum: {
      type: 'number',
    },
    exclusiveMinimum: {
      type: 'boolean',
      default: false,
    },
    maxLength: {
      type: 'integer',
      minimum: 0,
    },
    minLength: {
      type: 'integer',
      minimum: 0,
      default: 0,
    },
    pattern: {
      type: 'string',
      format: 'regex',
    },
    maxItems: {
      type: 'integer',
      minimum: 0,
    },
    minItems: {
      type: 'integer',
      minimum: 0,
      default: 0,
    },
    uniqueItems: {
      type: 'boolean',
      default: false,
    },
    maxProperties: {
      type: 'integer',
      minimum: 0,
    },
    minProperties: {
      type: 'integer',
      minimum: 0,
      default: 0,
    },
    required: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      uniqueItems: true,
    },
    enum: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
    },
    type: {
      type: 'string',
      enum: ['string', 'number', 'integer', 'object', 'array', 'boolean'],
    },
    allOf: {
      type: 'array',
      items: {
        $ref: '#/definitions/schemaOrReference',
      },
      minItems: 1,
    },
    oneOf: {
      type: 'array',
      items: {
        $ref: '#/definitions/schemaOrReference',
      },
      minItems: 1,
    },
    anyOf: {
      type: 'array',
      items: {
        $ref: '#/definitions/schemaOrReference',
      },
      minItems: 1,
    },
    not: {
      $ref: '#/definitions/schema',
    },
    items: {
      anyOf: [
        {
          $ref: '#/definitions/schemaOrReference',
        },
        {
          type: 'array',
          items: {
            $ref: '#/definitions/schemaOrReference',
          },
          minItems: 1,
        },
      ],
    },
    properties: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/schemaOrReference',
      },
    },
    additionalProperties: {
      anyOf: [
        {
          $ref: '#/definitions/schemaOrReference',
        },
        {
          type: 'boolean',
        },
      ],
    },
    default: {
      $ref: '#/definitions/defaultType',
    },
    description: {
      type: 'string',
    },
    summary: {
      type: 'string',
    },
    format: {
      type: 'string',
    },
  },
};

const openapi3_1_schema_object = {
  type: 'object',
  'x-custom-validator': 'validateSchema',
  description:
    'The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is an extended subset of the JSON Schema Specification Wright Draft 00.  For more information about the properties, see JSON Schema Core and JSON Schema Validation. Unless stated otherwise, the property definitions follow the JSON Schema.',
  additionalProperties: true,
  patternProperties: {
    '^x-': {
      $ref: '#/definitions/specificationExtension',
    },
  },
  properties: {
    discriminator: {
      $ref: '#/definitions/discriminator',
    },
    contentMediaType: {
      type: 'string',
    },
    $schema: {
      type: 'string',
    },
    readOnly: {
      type: 'boolean',
    },
    writeOnly: {
      type: 'boolean',
    },
    xml: {
      $ref: '#/definitions/xml',
    },
    externalDocs: {
      $ref: '#/definitions/externalDocs',
    },
    examples: {
      type: 'array',
      items: { $ref: '#/definitions/any' },
    },
    deprecated: {
      type: 'boolean',
    },
    title: {
      type: 'string',
    },
    multipleOf: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    maximum: {
      type: 'number',
    },
    exclusiveMaximum: {
      type: 'number',
    },
    minimum: {
      type: 'number',
    },
    exclusiveMinimum: {
      type: 'number',
    },
    maxLength: {
      type: 'integer',
      minimum: 0,
    },
    minLength: {
      type: 'integer',
      minimum: 0,
      default: 0,
    },
    pattern: {
      type: 'string',
      format: 'regex',
    },
    maxItems: {
      type: 'integer',
      minimum: 0,
    },
    minItems: {
      type: 'integer',
      minimum: 0,
      default: 0,
    },
    uniqueItems: {
      type: 'boolean',
      default: false,
    },
    maxProperties: {
      type: 'integer',
      minimum: 0,
    },
    minProperties: {
      type: 'integer',
      minimum: 0,
      default: 0,
    },
    required: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
      default: [],
    },
    enum: {
      type: 'array',
      items: true,
      minItems: 1,
      uniqueItems: true,
    },
    const: {},
    propertyNames: {
      $ref: '#/definitions/schema',
    },
    unevaluatedProperties: {
      type: 'boolean',
    },
    type: {
      oneOf: [
        {
          type: 'string',
          enum: [
            'string',
            'number',
            'integer',
            'object',
            'array',
            'boolean',
            'null',
          ],
        },
        {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'string',
                enum: [
                  'string',
                  'number',
                  'integer',
                  'object',
                  'array',
                  'boolean',
                  'null',
                ],
              },
            ],
          },
        },
      ],
    },
    allOf: {
      type: 'array',
      items: {
        $ref: '#/definitions/schemaOrReference',
      },
      minItems: 1,
    },
    oneOf: {
      type: 'array',
      items: {
        $ref: '#/definitions/schemaOrReference',
      },
      minItems: 1,
    },
    anyOf: {
      type: 'array',
      items: {
        $ref: '#/definitions/schemaOrReference',
      },
      minItems: 1,
    },
    not: {
      $ref: '#/definitions/schema',
    },
    items: {
      anyOf: [
        {
          $ref: '#/definitions/schemaOrReference',
        },
        {
          type: 'array',
          items: {
            $ref: '#/definitions/schemaOrReference',
          },
          minItems: 1,
        },
      ],
    },
    properties: {
      type: 'object',
      additionalProperties: {
        $ref: '#/definitions/schemaOrReference',
      },
    },
    additionalProperties: {
      oneOf: [
        {
          $ref: '#/definitions/schemaOrReference',
        },
        {
          type: 'boolean',
        },
      ],
    },
    default: {
      $ref: '#/definitions/defaultType',
    },
    description: {
      type: 'string',
    },
    summary: {
      type: 'string',
    },
    format: {
      type: 'string',
    },
    example: {},
  },
};

const createOpenAPIValidationSchema = (schema: any, version: '3.0' | '3.1') => {
  const license =
    version === '3.0'
      ? {
          type: 'object',
          description: 'License information for the exposed API.',
          required: ['name'],
          additionalProperties: false,
          patternProperties: {
            '^x-': {
              $ref: '#/definitions/specificationExtension',
            },
          },
          properties: {
            name: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
          },
        }
      : {
          type: 'object',
          description: 'License information for the exposed API.',
          required: ['name'],
          additionalProperties: false,
          patternProperties: {
            '^x-': {
              $ref: '#/definitions/specificationExtension',
            },
          },
          properties: {
            name: {
              type: 'string',
            },
            identifier: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
          },
        };

  return {
    $id: 'http://openapis.org/v3/schema.json#',
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    description: 'This is the root document object of the OpenAPI document.',
    required: ['openapi', 'info', 'paths'],
    additionalProperties: false,
    patternProperties: {
      '^x-': {
        $ref: '#/definitions/specificationExtension',
      },
    },
    properties: {
      openapi: {
        type: 'string',
      },
      info: {
        $ref: '#/definitions/info',
      },
      servers: {
        type: 'array',
        items: {
          $ref: '#/definitions/server',
        },
        uniqueItems: true,
      },
      paths: {
        $ref: '#/definitions/paths',
      },
      webhooks: {
        additionalProperties: {
          type: 'object',
          properties: {
            get: {
              $ref: '#/definitions/operation',
            },
            put: {
              $ref: '#/definitions/operation',
            },
            post: {
              $ref: '#/definitions/operation',
            },
            delete: {
              $ref: '#/definitions/operation',
            },
            options: {
              $ref: '#/definitions/operation',
            },
            head: {
              $ref: '#/definitions/operation',
            },
            patch: {
              $ref: '#/definitions/operation',
            },
            trace: {
              $ref: '#/definitions/operation',
            },
          },
        },
      },
      components: {
        $ref: '#/definitions/components',
      },
      security: {
        type: 'array',
        items: {
          $ref: '#/definitions/securityRequirement',
        },
        uniqueItems: true,
      },
      tags: {
        type: 'array',
        items: {
          $ref: '#/definitions/tag',
        },
        uniqueItems: true,
      },
      externalDocs: {
        $ref: '#/definitions/externalDocs',
      },
    },
    definitions: {
      info: {
        type: 'object',
        description:
          'The object provides metadata about the API. The metadata MAY be used by the clients if needed, and MAY be presented in editing or documentation generation tools for convenience.',
        required: ['title', 'version'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          termsOfService: {
            type: 'string',
          },
          contact: {
            $ref: '#/definitions/contact',
          },
          license: {
            $ref: '#/definitions/license',
          },
          version: {
            type: 'string',
          },
          summary: {
            type: 'string',
          },
        },
      },
      contact: {
        type: 'object',
        description: 'Contact information for the exposed API.',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          name: {
            type: 'string',
          },
          url: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
        },
      },
      license,
      server: {
        type: 'object',
        description: 'An object representing a Server.',
        required: ['url'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          url: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          variables: {
            $ref: '#/definitions/serverVariables',
          },
        },
      },
      serverVariable: {
        type: 'object',
        description:
          'An object representing a Server Variable for server URL template substitution.',
        required: ['default'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          enum: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
          default: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
        },
      },
      components: {
        type: 'object',
        description:
          'Holds a set of reusable objects for different aspects of the OAS. All objects defined within the components object will have no effect on the API unless they are explicitly referenced from properties outside the components object.',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          schemas: {
            $ref: '#/definitions/schemasOrReferences',
          },
          responses: {
            $ref: '#/definitions/responsesOrReferences',
          },
          parameters: {
            $ref: '#/definitions/parametersOrReferences',
          },
          examples: {
            $ref: '#/definitions/examplesOrReferences',
          },
          requestBodies: {
            $ref: '#/definitions/requestBodiesOrReferences',
          },
          headers: {
            $ref: '#/definitions/headersOrReferences',
          },
          securitySchemes: {
            $ref: '#/definitions/securitySchemesOrReferences',
          },
          links: {
            $ref: '#/definitions/linksOrReferences',
          },
          callbacks: {
            $ref: '#/definitions/callbacksOrReferences',
          },
        },
      },
      paths: {
        type: 'object',
        description:
          'Holds the relative paths to the individual endpoints and their operations. The path is appended to the URL from the `Server Object` in order to construct the full URL.  The Paths MAY be empty, due to ACL constraints.',
        additionalProperties: false,
        patternProperties: {
          '^/': {
            $ref: '#/definitions/pathItem',
          },
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
      },
      pathItem: {
        type: 'object',
        description:
          'Describes the operations available on a single path. A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          $ref: {
            type: 'string',
          },
          summary: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          get: {
            $ref: '#/definitions/operation',
          },
          put: {
            $ref: '#/definitions/operation',
          },
          post: {
            $ref: '#/definitions/operation',
          },
          delete: {
            $ref: '#/definitions/operation',
          },
          options: {
            $ref: '#/definitions/operation',
          },
          head: {
            $ref: '#/definitions/operation',
          },
          patch: {
            $ref: '#/definitions/operation',
          },
          trace: {
            $ref: '#/definitions/operation',
          },
          servers: {
            type: 'array',
            items: {
              $ref: '#/definitions/server',
            },
            uniqueItems: true,
          },
          parameters: {
            type: 'array',
            items: {
              $ref: '#/definitions/parameterOrReference',
            },
            uniqueItems: true,
          },
        },
      },
      operation: {
        type: 'object',
        description: 'Describes a single API operation on a path.',
        required: ['responses'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
          summary: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          externalDocs: {
            $ref: '#/definitions/externalDocs',
          },
          operationId: {
            type: 'string',
          },
          parameters: {
            type: 'array',
            items: {
              $ref: '#/definitions/parameterOrReference',
            },
            uniqueItems: true,
          },
          requestBody: {
            $ref: '#/definitions/requestBodyOrReference',
          },
          responses: {
            $ref: '#/definitions/responses',
          },
          callbacks: {
            $ref: '#/definitions/callbacksOrReferences',
          },
          deprecated: {
            type: 'boolean',
          },
          security: {
            type: 'array',
            items: {
              $ref: '#/definitions/securityRequirement',
            },
            uniqueItems: true,
          },
          servers: {
            type: 'array',
            items: {
              $ref: '#/definitions/server',
            },
            uniqueItems: true,
          },
        },
      },
      externalDocs: {
        type: 'object',
        description:
          'Allows referencing an external resource for extended documentation.',
        required: ['url'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          description: {
            type: 'string',
          },
          url: {
            type: 'string',
          },
        },
      },
      parameter: {
        type: 'object',
        description:
          'Describes a single operation parameter.  A unique parameter is defined by a combination of a name and location.',
        required: ['name', 'in'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          name: {
            type: 'string',
          },
          in: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          required: {
            type: 'boolean',
          },
          deprecated: {
            type: 'boolean',
          },
          allowEmptyValue: {
            type: 'boolean',
          },
          style: {
            type: 'string',
          },
          explode: {
            type: 'boolean',
          },
          allowReserved: {
            type: 'boolean',
          },
          schema: {
            $ref: '#/definitions/schemaOrReference',
          },
          example: {
            $ref: '#/definitions/any',
          },
          examples: {
            $ref: '#/definitions/examplesOrReferences',
          },
          content: {
            $ref: '#/definitions/mediaTypes',
          },
        },
      },
      requestBody: {
        type: 'object',
        description: 'Describes a single request body.',
        required: ['content'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          description: {
            type: 'string',
          },
          content: {
            $ref: '#/definitions/mediaTypes',
          },
          required: {
            type: 'boolean',
          },
        },
      },
      mediaType: {
        type: 'object',
        description:
          'Each Media Type Object provides schema and examples for the media type identified by its key.',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          schema: {
            $ref: '#/definitions/schemaOrReference',
          },
          example: {
            $ref: '#/definitions/any',
          },
          examples: {
            $ref: '#/definitions/examplesOrReferences',
          },
          encoding: {
            $ref: '#/definitions/encodings',
          },
        },
      },
      encoding: {
        type: 'object',
        description:
          'A single encoding definition applied to a single schema property.',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          contentType: {
            type: 'string',
          },
          headers: {
            $ref: '#/definitions/headersOrReferences',
          },
          style: {
            type: 'string',
          },
          explode: {
            type: 'boolean',
          },
          allowReserved: {
            type: 'boolean',
          },
        },
      },
      responses: {
        type: 'object',
        description:
          'A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.  The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.  The `default` MAY be used as a default response object for all HTTP codes  that are not covered individually by the specification.  The `Responses Object` MUST contain at least one response code, and it  SHOULD be the response for a successful operation call.',
        additionalProperties: false,
        patternProperties: {
          '^([0-9X]{3})$': {
            $ref: '#/definitions/responseOrReference',
          },
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          default: {
            $ref: '#/definitions/responseOrReference',
          },
        },
      },
      response: {
        type: 'object',
        description:
          'Describes a single response from an API Operation, including design-time, static  `links` to operations based on the response.',
        required: ['description'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          description: {
            type: 'string',
          },
          headers: {
            $ref: '#/definitions/headersOrReferences',
          },
          content: {
            $ref: '#/definitions/mediaTypes',
          },
          links: {
            $ref: '#/definitions/linksOrReferences',
          },
        },
      },
      callback: {
        type: 'object',
        description:
          'A map of possible out-of band callbacks related to the parent operation. Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses. The key value used to identify the callback object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.',
        additionalProperties: false,
        patternProperties: {
          '^': {
            $ref: '#/definitions/pathItem',
          },
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
      },
      example: {
        type: 'object',
        description: '',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          summary: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          value: {
            $ref: '#/definitions/any',
          },
          externalValue: {
            type: 'string',
          },
        },
      },
      link: {
        type: 'object',
        description:
          "The `Link object` represents a possible design-time link for a response. The presence of a link does not guarantee the caller's ability to successfully invoke it, rather it provides a known relationship and traversal mechanism between responses and other operations.  Unlike _dynamic_ links (i.e. links provided **in** the response payload), the OAS linking mechanism does not require link information in the runtime response.  For computing links, and providing instructions to execute them, a runtime expression is used for accessing values in an operation and using them as parameters while invoking the linked operation.",
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          operationRef: {
            type: 'string',
          },
          operationId: {
            type: 'string',
          },
          parameters: {
            $ref: '#/definitions/anysOrExpressions',
          },
          requestBody: {
            $ref: '#/definitions/anyOrExpression',
          },
          description: {
            type: 'string',
          },
          server: {
            $ref: '#/definitions/server',
          },
        },
      },
      header: {
        type: 'object',
        description:
          'The Header Object follows the structure of the Parameter Object with the following changes:  1. `name` MUST NOT be specified, it is given in the corresponding `headers` map. 1. `in` MUST NOT be specified, it is implicitly in `header`. 1. All traits that are affected by the location MUST be applicable to a location of `header` (for example, `style`).',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          description: {
            type: 'string',
          },
          required: {
            type: 'boolean',
          },
          deprecated: {
            type: 'boolean',
          },
          allowEmptyValue: {
            type: 'boolean',
          },
          style: {
            type: 'string',
          },
          explode: {
            type: 'boolean',
          },
          allowReserved: {
            type: 'boolean',
          },
          schema: {
            $ref: '#/definitions/schemaOrReference',
          },
          example: {
            $ref: '#/definitions/any',
          },
          examples: {
            $ref: '#/definitions/examplesOrReferences',
          },
          content: {
            $ref: '#/definitions/mediaTypes',
          },
        },
      },
      tag: {
        type: 'object',
        description:
          'Adds metadata to a single tag that is used by the Operation Object. It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.',
        required: ['name'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          externalDocs: {
            $ref: '#/definitions/externalDocs',
          },
        },
      },
      examples: {
        type: 'object',
        description: '',
        additionalProperties: false,
      },
      reference: {
        type: 'object',
        description:
          'A simple object to allow referencing other components in the specification, internally and externally.  The Reference Object is defined by JSON Reference and follows the same structure, behavior and rules.   For this specification, reference resolution is accomplished as defined by the JSON Reference specification and not by the JSON Schema specification.',
        required: ['$ref'],
        additionalProperties: false,
        properties: {
          $ref: {
            type: 'string',
          },
        },
      },
      schema,
      discriminator: {
        type: 'object',
        description:
          'When request bodies or response payloads may be one of a number of different schemas, a `discriminator` object can be used to aid in serialization, deserialization, and validation.  The discriminator is a specific object in a schema which is used to inform the consumer of the specification of an alternative schema based on the value associated with it.  When using the discriminator, _inline_ schemas will not be considered.',
        required: ['propertyName'],
        additionalProperties: false,
        properties: {
          propertyName: {
            type: 'string',
          },
          mapping: {
            $ref: '#/definitions/strings',
          },
        },
      },
      xml: {
        type: 'object',
        description:
          'A metadata object that allows for more fine-tuned XML model definitions.  When using arrays, XML element names are *not* inferred (for singular/plural forms) and the `name` property SHOULD be used to add that information. See examples for expected behavior.',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          name: {
            type: 'string',
          },
          namespace: {
            type: 'string',
          },
          prefix: {
            type: 'string',
          },
          attribute: {
            type: 'boolean',
          },
          wrapped: {
            type: 'boolean',
          },
        },
      },
      securityScheme: {
        type: 'object',
        description:
          "Defines a security scheme that can be used by the operations. Supported schemes are HTTP authentication, an API key (either as a header or as a query parameter), OAuth2's common flows (implicit, password, application and access code) as defined in RFC6749, and OpenID Connect Discovery.",
        required: ['type'],
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          type: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          in: {
            type: 'string',
          },
          scheme: {
            type: 'string',
          },
          bearerFormat: {
            type: 'string',
          },
          flows: {
            $ref: '#/definitions/oauthFlows',
          },
          openIdConnectUrl: {
            type: 'string',
          },
        },
      },
      oauthFlows: {
        type: 'object',
        description: 'Allows configuration of the supported OAuth Flows.',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          implicit: {
            $ref: '#/definitions/oauthFlow',
          },
          password: {
            $ref: '#/definitions/oauthFlow',
          },
          clientCredentials: {
            $ref: '#/definitions/oauthFlow',
          },
          authorizationCode: {
            $ref: '#/definitions/oauthFlow',
          },
        },
      },
      oauthFlow: {
        type: 'object',
        description: 'Configuration details for a supported OAuth Flow',
        additionalProperties: false,
        patternProperties: {
          '^x-': {
            $ref: '#/definitions/specificationExtension',
          },
        },
        properties: {
          authorizationUrl: {
            type: 'string',
          },
          tokenUrl: {
            type: 'string',
          },
          refreshUrl: {
            type: 'string',
          },
          scopes: {
            $ref: '#/definitions/strings',
          },
        },
      },
      securityRequirement: {
        type: 'object',
        description:
          'Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.  Security Requirement Objects that contain multiple schemes require that all schemes MUST be satisfied for a request to be authorized. This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.  When a list of Security Requirement Objects is defined on the Open API object or Operation Object, only one of Security Requirement Objects in the list needs to be satisfied to authorize the request.',
        additionalProperties: false,
        patternProperties: {
          '^[a-zA-Z0-9\\.\\-_]+$': {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
        },
      },
      anyOrExpression: {
        oneOf: [
          {
            $ref: '#/definitions/any',
          },
          {
            $ref: '#/definitions/expression',
          },
        ],
      },
      callbackOrReference: {
        oneOf: [
          {
            $ref: '#/definitions/callback',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      exampleOrReference: {
        oneOf: [
          {
            $ref: '#/definitions/example',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      headerOrReference: {
        oneOf: [
          {
            $ref: '#/definitions/header',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      linkOrReference: {
        oneOf: [
          {
            $ref: '#/definitions/link',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      parameterOrReference: {
        oneOf: [
          {
            $ref: '#/definitions/parameter',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      requestBodyOrReference: {
        oneOf: [
          {
            $ref: '#/definitions/requestBody',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      responseOrReference: {
        oneOf: [
          {
            $ref: '#/definitions/response',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      schemaOrReference: {
        anyOf: [
          {
            $ref: '#/definitions/schema',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      securitySchemeOrReference: {
        anyOf: [
          {
            $ref: '#/definitions/securityScheme',
          },
          {
            $ref: '#/definitions/reference',
          },
        ],
      },
      anysOrExpressions: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/anyOrExpression',
        },
      },
      callbacksOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/callbackOrReference',
        },
      },
      encodings: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/encoding',
        },
      },
      examplesOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/exampleOrReference',
        },
      },
      headersOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/headerOrReference',
        },
      },
      linksOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/linkOrReference',
        },
      },
      mediaTypes: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/mediaType',
        },
      },
      parametersOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/parameterOrReference',
        },
      },
      requestBodiesOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/requestBodyOrReference',
        },
      },
      responsesOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/responseOrReference',
        },
      },
      schemasOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/schemaOrReference',
        },
      },
      securitySchemesOrReferences: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/securitySchemeOrReference',
        },
      },
      serverVariables: {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/serverVariable',
        },
      },
      strings: {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      },
      object: {
        type: 'object',
        additionalProperties: true,
      },
      any: {
        additionalProperties: true,
      },
      expression: {
        type: 'object',
        additionalProperties: true,
      },
      specificationExtension: {
        description: 'Any property starting with x- is valid.',
        oneOf: [
          {
            type: 'null',
          },
          {
            type: 'number',
          },
          {
            type: 'boolean',
          },
          {
            type: 'string',
          },
          {
            type: 'object',
          },
          {
            type: 'array',
          },
        ],
      },
      defaultType: {
        oneOf: [
          {
            type: 'null',
          },
          {
            type: 'array',
          },
          {
            type: 'object',
          },
          {
            type: 'number',
          },
          {
            type: 'boolean',
          },
          {
            type: 'string',
          },
        ],
      },
    },
  };
};

export const basic3openapi_schema = {
  $id: 'http://openapis.org/v3/schema.json#',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['openapi', 'info', 'paths'],
  properties: {
    openapi: {
      type: 'string',
    },
    info: {
      type: 'object',
    },
    paths: {
      type: 'object',
      patternProperties: {
        '^/': {
          type: 'object',
          properties: {
            get: {
              $ref: '#/definitions/operation',
            },
            put: {
              $ref: '#/definitions/operation',
            },
            post: {
              $ref: '#/definitions/operation',
            },
            delete: {
              $ref: '#/definitions/operation',
            },
            options: {
              $ref: '#/definitions/operation',
            },
            head: {
              $ref: '#/definitions/operation',
            },
            patch: {
              $ref: '#/definitions/operation',
            },
            trace: {
              $ref: '#/definitions/operation',
            },
          },
        },
      },
    },
  },
  definitions: {
    operation: {
      type: 'object',
      required: ['responses'],
      properties: {
        responses: {
          type: 'object',
          additionalProperties: {
            type: 'object',
          },
        },
      },
    },
  },
};

export const openapi3_0_json_schema = createOpenAPIValidationSchema(
  openapi3_0_schema_object,
  '3.0'
);
export const openapi3_1_json_schema = createOpenAPIValidationSchema(
  openapi3_1_schema_object,
  '3.1'
);
