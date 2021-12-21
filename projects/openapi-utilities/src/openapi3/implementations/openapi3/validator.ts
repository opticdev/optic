import { OpenAPIV3 } from 'openapi-types';
import OpenAPISchemaValidator from 'openapi-schema-validator';

const validator = new OpenAPISchemaValidator({
  version: 3,
  extensions: {
    additionalProperties: true,
  },
});

export const validateOpenApiV3Document = (spec: any): OpenAPIV3.Document => {
  const results = validator.validate(spec);

  if (results.errors.length > 0) {
    throw new Error(JSON.stringify(results.errors));
  }

  return spec as OpenAPIV3.Document;
};
