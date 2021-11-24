const { oas: oas } = require("@stoplight/spectral-rulesets");
const equals = _interopDefault(require("./functions/equals"));
const {
  truthy: truthy,
  enumeration: enumeration,
  pattern: pattern,
  xor: xor,
  schema: schema,
  falsy: falsy,
  casing: casing,
} = require("@stoplight/spectral-functions");
const assertObjectPath = _interopDefault(
  require("./functions/assertObjectPath")
);
const contains = _interopDefault(require("./functions/contains"));
const notContains = _interopDefault(require("./functions/notContains"));
const pathCasing = _interopDefault(require("./functions/pathCasing"));
const arrayObjectPattern = _interopDefault(
  require("./functions/arrayObjectPattern")
);
// prettier-ignore
export default {
  "extends": [[oas, "all"], {
    "rules": {
      // "jsonapi-response-content-type": {
      //   "description": "Responses must provide a JSON:API content type",
      //   "message": "JSON:API requires \"Content-Type: application/vnd.api+json\"",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/(openapi|sarif)(\\/.*)?$/))][*].responses[*].content",
      //   "then": {
      //     "field": "application/vnd.api+json",
      //     "function": truthy
      //   }
      // },
      // "jsonapi-get-post-response-data": {
      //   "description": "JSON:API response schema requires data property",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][?(@property.match(/get|post/))].responses[?(@property.match(/200|201/))].content['application/vnd.api+json']",
      //   "then": {
      //     "function": assertObjectPath,
      //     "functionOptions": {
      //       "path": ["schema", "properties", "data", "type"]
      //     }
      //   }
      // },
      // "jsonapi-response-jsonapi": {
      //   "description": "JSON:API response schema requires jsonapi property",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][?(!@property.match(/patch|delete/))].responses[?(@property.match(/200|201/))].content['application/vnd.api+json']",
      //   "then": {
      //     "function": assertObjectPath,
      //     "functionOptions": {
      //       "path": ["schema", "properties", "jsonapi", "type"]
      //     }
      //   }
      // },
      // "jsonapi-get-post-response-data-schema": {
      //   "description": "JSON:API response data schema",
      //   "message": "{{error}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][?(@property.match(/get|post/))].responses[?(@property.match(/200|201/))].content['application/vnd.api+json'].schema.properties",
      //   "then": {
      //     "field": "data",
      //     "function": schema,
      //     "functionOptions": {
      //       "schema": {
      //         "oneOf": [{
      //           "type": "object",
      //           "properties": {
      //             "type": {
      //               "type": "string",
      //               "enum": ["array"]
      //             },
      //             "items": {
      //               "type": "object",
      //               "properties": {
      //                 "properties": {
      //                   "type": "object",
      //                   "properties": {
      //                     "id": {
      //                       "type": "object",
      //                       "properties": {
      //                         "type": {
      //                           "type": "string",
      //                           "enum": ["string"]
      //                         },
      //                         "format": {
      //                           "type": "string",
      //                           "enum": ["uuid"]
      //                         }
      //                       },
      //                       "required": ["type", "format"]
      //                     },
      //                     "type": {
      //                       "type": "object",
      //                       "properties": {
      //                         "type": {
      //                           "type": "string",
      //                           "enum": ["string"]
      //                         }
      //                       },
      //                       "required": ["type"]
      //                     }
      //                   },
      //                   "required": ["id", "type"]
      //                 }
      //               },
      //               "required": ["properties"]
      //             }
      //           }
      //         }, {
      //           "type": "object",
      //           "properties": {
      //             "properties": {
      //               "type": "object",
      //               "properties": {
      //                 "id": {
      //                   "type": "object",
      //                   "properties": {
      //                     "type": {
      //                       "type": "string",
      //                       "enum": ["string"]
      //                     },
      //                     "format": {
      //                       "type": "string",
      //                       "enum": ["uuid"]
      //                     }
      //                   },
      //                   "required": ["type", "format"]
      //                 },
      //                 "type": {
      //                   "type": "object",
      //                   "properties": {
      //                     "type": {
      //                       "type": "string",
      //                       "enum": ["string"]
      //                     }
      //                   },
      //                   "required": ["type"]
      //                 }
      //               },
      //               "required": ["id", "type"]
      //             }
      //           },
      //           "required": ["properties"]
      //         }]
      //       }
      //     }
      //   }
      // },
      // "jsonapi-patch-response-data": {
      //   "description": "JSON:API patch 200 response requires a schema",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))].patch.responses.200",
      //   "then": {
      //     "function": assertObjectPath,
      //     "functionOptions": {
      //       "path": ["content", "application/vnd.api+json", "schema", "properties"]
      //     }
      //   }
      // },
      // "jsonapi-patch-response-200-schema": {
      //   "description": "JSON:API patch response data schema",
      //   "message": "{{error}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))].patch.responses.200.content['application/vnd.api+json'].schema",
      //   "then": {
      //     "field": "properties",
      //     "function": schema,
      //     "functionOptions": {
      //       "schema": {
      //         "oneOf": [{
      //           "type": "object",
      //           "properties": {
      //             "meta": {
      //               "type": "object"
      //             },
      //             "links": {
      //               "type": "object"
      //             }
      //           },
      //           "required": ["meta", "links"],
      //           "additionalProperties": false
      //         }, {
      //           "type": "object",
      //           "properties": {
      //             "data": {
      //               "type": "object"
      //             },
      //             "jsonapi": {
      //               "type": "object"
      //             },
      //             "links": {
      //               "type": "object"
      //             }
      //           },
      //           "required": ["data", "jsonapi", "links"],
      //           "additionalProperties": false
      //         }]
      //       }
      //     }
      //   }
      // },
      // "jsonapi-patch-response-204-schema": {
      //   "description": "JSON:API patch 204 response should not have content",
      //   "message": "{{error}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))].patch.responses.204",
      //   "then": {
      //     "field": "content",
      //     "function": falsy
      //   }
      // },
      // "jsonapi-post-response-201": {
      //   "description": "Post responses must respond with a 201 status code on success",
      //   "severity": "error",
      //   "given": "$.paths[*].post.responses",
      //   "then": {
      //     "field": "@key",
      //     "function": pattern,
      //     "functionOptions": {
      //       "match": "^201|[3-5][0-9]{2}$"
      //     }
      //   }
      // },
      // "jsonapi-4xx-response-codes": {
      //   "description": "Only 400, 401, 403, 404, 409, and 429 status codes can be returned in the 4xx.",
      //   "severity": "error",
      //   "given": "$.paths[*].*.responses",
      //   "then": {
      //     "field": "@key",
      //     "function": pattern,
      //     "functionOptions": {
      //       "match": "^(40[0|1|3|4|9]|429)|([2|3|5][0-9]{2})$"
      //     }
      //   }
      // },
      // "jsonapi-created-response-location": {
      //   "description": "Post responses must include a location header for the created resource",
      //   "severity": "error",
      //   "given": "$.paths[*].post.responses.201.headers",
      //   "then": {
      //     "field": "location",
      //     "function": truthy
      //   }
      // },
      // "jsonapi-created-response-self-link": {
      //   "description": "Post responses must include a self link for the created resource",
      //   "severity": "error",
      //   "given": "$.paths[*].post.responses.201.content['application/vnd.api+json'].schema.properties.data.properties.links.properties",
      //   "then": {
      //     "field": "self",
      //     "function": truthy
      //   }
      // },
      // "jsonapi-delete-response-statuses": {
      //   "description": "Delete endpoints can only use 200 or 204 status codes",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))].delete.responses",
      //   "then": {
      //     "field": "@key",
      //     "function": pattern,
      //     "functionOptions": {
      //       "match": "^20[0|4]|[3-5][0-9]{2}$"
      //     }
      //   }
      // },
      // "jsonapi-delete-response-200": {
      //   "description": "JSON:API delete 200 response data schema",
      //   "message": "{{error}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))].delete.responses.200.content['application/vnd.api+json'].schema",
      //   "then": {
      //     "field": "properties",
      //     "function": schema,
      //     "functionOptions": {
      //       "schema": {
      //         "type": "object",
      //         "properties": {
      //           "meta": {
      //             "type": "object"
      //           }
      //         },
      //         "required": ["meta"],
      //         "additionalProperties": false
      //       }
      //     }
      //   }
      // },
      // "jsonapi-delete-response-204": {
      //   "description": "JSON:API delete 204 response data schema",
      //   "message": "{{error}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))].delete.responses.204",
      //   "then": {
      //     "field": "content",
      //     "function": falsy
      //   }
      // },
      // "jsonapi-content-non-204": {
      //   "description": "Responses from non-204 statuses must have content",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].responses[?(@property !== '204')]",
      //   "then": {
      //     "field": "content",
      //     "function": truthy
      //   }
      // },
      // "jsonapi-pagination-collection-parameters": {
      //   "description": "Collection requests must include pagination parameters",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/) && !@property.match(/\\{[a-z]*?_?id\\}$/))].get.parameters",
      //   "then": {
      //     "function": contains,
      //     "functionOptions": {
      //       "field": "name",
      //       "values": ["starting_after", "ending_before", "limit"]
      //     }
      //   }
      // },
      // "jsonapi-pagination-collection-links": {
      //   "description": "Responses for collection requests must include pagination links",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/) && !@property.match(/\\{[a-z]*?_?id\\}$/))].get.responses.200.content['application/vnd.api+json'].schema.properties",
      //   "then": {
      //     "field": "links",
      //     "function": truthy
      //   }
      // },
      // "jsonapi-no-pagination-parameters": {
      //   "description": "Non-GET requests should not allow pagination parameters",
      //   "severity": "error",
      //   "given": "$.paths[*][?(@property.match(/post|patch|delete/))].parameters",
      //   "then": {
      //     "function": notContains,
      //     "functionOptions": {
      //       "field": "name",
      //       "values": ["starting_after", "ending_before", "limit"]
      //     }
      //   }
      // },
      // "jsonapi-self-links-get-patch": {
      //   "description": "Successful GET responses should include a top-level self link",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][?(@property.match(/get|patch/))].responses.200.content['application/vnd.api+json'].schema.properties",
      //   "then": {
      //     "function": assertObjectPath,
      //     "functionOptions": {
      //       "path": ["links", "properties", "self"]
      //     }
      //   }
      // },
      // "jsonapi-self-links-post": {
      //   "description": "Successful GET responses should include a top-level self link",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))].post.responses.201.content['application/vnd.api+json'].schema.properties",
      //   "then": {
      //     "function": assertObjectPath,
      //     "functionOptions": {
      //       "path": ["links", "properties", "self"]
      //     }
      //   }
      // },
      // "jsonapi-response-relationship-schema": {
      //   "description": "JSON:API response relationship schema",
      //   "message": "{{error}}",
      //   "severity": "error",
      //   "given": "$.paths.*.*.responses.*.content['application/vnd.api+json'].schema.properties.data.properties.relationships",
      //   "then": {
      //     "function": schema,
      //     "functionOptions": {
      //       "schema": {
      //         "type": "object",
      //         "properties": {
      //           "additionalProperties": {
      //             "type": "object",
      //             "properties": {
      //               "properties": {
      //                 "type": "object",
      //                 "properties": {
      //                   "data": {
      //                     "type": "object",
      //                     "properties": {
      //                       "properties": {
      //                         "type": "object",
      //                         "properties": {
      //                           "type": {
      //                             "type": "object",
      //                             "properties": {
      //                               "type": {
      //                                 "type": "string",
      //                                 "enum": ["string"]
      //                               }
      //                             },
      //                             "required": ["type"]
      //                           },
      //                           "id": {
      //                             "type": "object",
      //                             "properties": {
      //                               "type": {
      //                                 "type": "string",
      //                                 "enum": ["string"]
      //                               },
      //                               "format": {
      //                                 "type": "string",
      //                                 "enum": ["uuid"]
      //                               }
      //                             },
      //                             "required": ["type", "format"]
      //                           }
      //                         },
      //                         "required": ["type", "id"]
      //                       }
      //                     },
      //                     "required": ["properties"]
      //                   },
      //                   "links": {
      //                     "type": "object",
      //                     "properties": {
      //                       "properties": {
      //                         "type": "object",
      //                         "properties": {
      //                           "related": {
      //                             "type": "object",
      //                             "properties": {
      //                               "type": {
      //                                 "type": "string",
      //                                 "enum": ["string"]
      //                               }
      //                             }
      //                           }
      //                         },
      //                         "required": ["related"]
      //                       }
      //                     },
      //                     "required": ["properties"]
      //                   }
      //                 },
      //                 "required": ["data", "links"]
      //               }
      //             },
      //             "required": ["properties"]
      //           }
      //         }
      //       }
      //     }
      //   }
      // },
      // "jsonapi-no-compound-documents": {
      //   "description": "Compound documents are not allowed",
      //   "severity": "error",
      //   "given": "$.paths.*.*.responses[?(@property.match(/200|201/))].content['application/vnd.api+json'].schema.properties",
      //   "then": {
      //     "field": "included",
      //     "function": falsy
      //   }
      // }
    }
  }, {
    "rules": {
      "paths-snake-case": {
        "description": "Path elements must be snake_case.",
        "message": "{{error}}",
        "severity": "error",
        "given": "$.paths[*]~",
        "then": {
          "function": pathCasing
        }
      },
      // "parameter-names-snake-case": {
      //   "description": "Parameter names must be snake_case.",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$..parameters[*]",
      //   "then": {
      //     "field": "name",
      //     "function": casing,
      //     "functionOptions": {
      //       "type": "snake"
      //     }
      //   }
      // },
      "component-names-pascal-case": {
        "description": "Component names must be PascalCase (except responses).",
        "message": "{{description}}",
        "severity": "error",
        "given": "$..components[?(@property !== 'responses')][*]~",
        "then": {
          "field": "@key",
          "function": casing,
          "functionOptions": {
            "type": "pascal"
          }
        }
      },
      "component-response-names": {
        "description": "Response names must be PascalCase or a status code.",
        "message": "{{description}}",
        "severity": "error",
        "given": "$..components[?(@property === 'responses')][?(!@property.match(/^\\d+$/))]~",
        "then": {
          "field": "@key",
          "function": casing,
          "functionOptions": {
            "type": "pascal"
          }
        }
      }
    }
  }, {
    "rules": {
      // "response-request-id": {
      //   "description": "Responses must provide snyk-request-id",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[*][*].responses[*].headers",
      //   "then": {
      //     "field": "snyk-request-id",
      //     "function": truthy
      //   }
      // }
    }
  }, {
    "rules": {
      // "openapi-get-versions": {
      //   "description": "APIs must list the available versioned OpenAPI specifications.",
      //   "severity": "error",
      //   "given": "$.paths[/openapi]",
      //   "then": {
      //     "field": "get",
      //     "function": truthy
      //   }
      // },
      // "openapi-get-version": {
      //   "description": "APIs must provide versioned OpenAPI specifications.",
      //   "severity": "error",
      //   "given": "$.paths[/openapi/{version}]",
      //   "then": {
      //     "field": "get",
      //     "function": truthy
      //   }
      // },
      "openapi-arrays-types": {
        "description": "Array items must have a \"type\" field.",
        "severity": "error",
        "given": "$..[?(@.type === \"array\")].items",
        "then": {
          "field": "type",
          "function": truthy
        }
      }
    }
  }, {
    "rules": {
      // "requests-declare-parameters": {
      //   "description": "Requests must declare parameters",
      //   "message": "Missing request parameters",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*]",
      //   "then": {
      //     "field": "parameters",
      //     "function": truthy
      //   }
      // },
      // "version-request": {
      //   "description": "Requests must declare an API version query parameter",
      //   "message": "Missing request parameter \"version\"",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].parameters",
      //   "then": {
      //     "function": arrayObjectPattern,
      //     "functionOptions": {
      //       "field": "name",
      //       "match": "^version$"
      //     }
      //   }
      // },
      // "responses-declare-headers": {
      //   "description": "Responses must declare headers",
      //   "message": "Missing response headers",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].responses[*]",
      //   "then": {
      //     "field": "headers",
      //     "function": truthy
      //   }
      // },
      // "version-response-deprecation": {
      //   "description": "Responses must provide deprecation header",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].responses[*].headers",
      //   "then": {
      //     "field": "deprecation",
      //     "function": truthy
      //   }
      // },
      // "version-response-lifecycle-stage": {
      //   "description": "Responses must provide snyk-version-lifecycle-stage header",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].responses[*].headers",
      //   "then": {
      //     "field": "snyk-version-lifecycle-stage",
      //     "function": truthy
      //   }
      // },
      // "version-response-requested": {
      //   "description": "Responses must provide snyk-version-requested header",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].responses[*].headers",
      //   "then": {
      //     "field": "snyk-version-requested",
      //     "function": truthy
      //   }
      // },
      // "version-response-served": {
      //   "description": "Responses must provide snyk-version-served header",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].responses[*].headers",
      //   "then": {
      //     "field": "snyk-version-served",
      //     "function": truthy
      //   }
      // },
      // "version-response-sunset": {
      //   "description": "Responses must provide sunset header",
      //   "message": "{{description}}",
      //   "severity": "error",
      //   "given": "$.paths[?(!@property.match(/\\/openapi/))][*].responses[*].headers",
      //   "then": {
      //     "field": "sunset",
      //     "function": truthy
      //   }
      // }
    }
  }],
  "rules": {
    "openapi-tags": "off",
    "operation-tags": "off",
    "info-contact": "off",
    "info-description": "off",
    "info-license": "off",
    "license-url": "off",
    "openapi-get-versions": {
      "description": "APIs must list the available versioned OpenAPI specifications.",
      "severity": "error",
      "given": "$.paths[/openapi]",
      "then": {
        "field": "get",
        "function": truthy
      }
    },
    "openapi-get-version": {
      "description": "APIs must provide versioned OpenAPI specifications.",
      "severity": "error",
      "given": "$.paths[/openapi/{version}]",
      "then": {
        "field": "get",
        "function": truthy
      }
    },
    "apinext-route-tenant-uuids": {
      "description": "APIs must use UUIDs where org or group tenants are specified",
      "severity": "error",
      "given": "$.paths[*][*].parameters[?(@.name.match(/org_id|group_id/))].schema",
      "then": [{
        "field": "type",
        "function": enumeration,
        "functionOptions": {
          "values": ["string"]
        }
      }, {
        "field": "format",
        "function": truthy
      }, {
        "field": "format",
        "function": enumeration,
        "functionOptions": {
          "values": ["uuid"]
        }
      }]
    },
    "apinext-paths-tenants": {
      "description": "APIs must have an org or group tenant",
      "severity": "error",
      "given": "$.paths",
      "then": {
        "field": "@key",
        "function": pattern,
        "functionOptions": {
          "match": "^\\/(orgs\\/{org_id}|groups\\/{group_id})"
        }
      }
    },
    // TODO: convert this as it causes an error
    // "apinext-operation-response-array-examples": {
    //   "description": "Responses must have an enum or examples field and be non-empty",
    //   "severity": "error",
    //   "given": "$.paths[*][*].responses[*].content[*].schema.properties.data.items.properties.attributes..[properties][?(!@.type.match(/object|boolean/))]",
    //   "then": {
    //     "function": xor,
    //     "functionOptions": {
    //       "properties": ["enum", "example"]
    //     }
    //   }
    // },
    // TODO: convert this as it causes an error
    // "apinext-operation-response-single-examples": {
    //   "description": "Responses must have an enum or examples field and be non-empty",
    //   "severity": "error",
    //   "given": "$.paths[*][*].responses[*].content[*].schema.properties.data.properties.attributes..[properties][?(!@.type.match(/object|boolean/))]",
    //   "then": {
    //     "function": xor,
    //     "functionOptions": {
    //       "properties": ["enum", "example"]
    //     }
    //   }
    // },
    "apinext-date-property-formatting": {
      "description": "Date-time properties require correct date-time format",
      "severity": "error",
      "given": "$.paths[*][*].responses[*].content[*].schema..properties[?(@property.match(/created|updated|deleted/))]",
      "then": [{
        "field": "format",
        "function": equals,
        "functionOptions": {
          "value": "date-time"
        }
      }]
    },
    "apinext-tags-name-description": {
      "description": "Tags must have a name and description",
      "severity": "error",
      "given": "$.tags[*]",
      "then": [{
        "field": "name",
        "function": truthy
      }, {
        "field": "description",
        "function": truthy
      }]
    },
    // "apinext-operation-summary": {
    //   "description": "Path operations must include a summary",
    //   "severity": "error",
    //   "given": "$.paths[*][*]",
    //   "then": {
    //     "field": "summary",
    //     "function": truthy
    //   }
    // },
    // "apinext-operation-tags": {
    //   "description": "Path operations must include tags",
    //   "severity": "error",
    //   "given": "$.paths[*][*]",
    //   "then": {
    //     "field": "tags",
    //     "function": truthy
    //   }
    // }
  }
};
function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}
