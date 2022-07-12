import { OpenAPIV3, OpenAPI } from 'openapi-types';
import ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  openapi3_1_json_schema,
  openapi3_0_json_schema,
} from './validation-schemas';
import { checkOpenAPIVersion } from './openapi-versions';

export default class OpenAPISchemaValidator {
  private v3_0Validator: ValidateFunction | undefined;
  private v3_1Validator: ValidateFunction | undefined;

  public validate3_0(openapiDoc: OpenAPI.Document): {
    errors: ErrorObject[];
  } {
    if (!this.v3_0Validator) {
      const v = new ajv({ allErrors: true, strict: false });
      addFormats(v);
      v.addSchema(openapi3_0_json_schema);
      this.v3_0Validator = v.compile(openapi3_0_json_schema);
    }

    if (!this.v3_0Validator(openapiDoc) && this.v3_0Validator.errors) {
      return { errors: this.v3_0Validator.errors };
    } else {
      return { errors: [] };
    }
  }
  public validate3_1(openapiDoc: OpenAPI.Document): {
    errors: ErrorObject[];
  } {
    if (!this.v3_1Validator) {
      const v = new ajv({ allErrors: true, strict: false });
      addFormats(v);
      v.addSchema(openapi3_1_json_schema);
      this.v3_1Validator = v.compile(openapi3_1_json_schema);
    }

    if (!this.v3_1Validator(openapiDoc) && this.v3_1Validator.errors) {
      return { errors: this.v3_1Validator.errors };
    } else {
      return { errors: [] };
    }
  }
}

export const processValidatorErrors = (
  spec: any,
  errors: ErrorObject[]
): { message: string; instancePath: string; value: any }[] => {
  const sortedErrorsByLength = errors.sort(
    (a, b) => b.instancePath.length - a.instancePath.length
  );
  const pathsWithErrors: string[] = [];
  for (const error of sortedErrorsByLength) {
    // We want to only render the root of the error message
    if (
      pathsWithErrors.every(
        (addedError) => !addedError.startsWith(error.instancePath)
      )
    ) {
      pathsWithErrors.push(error.instancePath);
    }
  }

  const processedErrors = [];
  for (const path of pathsWithErrors) {
    try {
      processedErrors.push({
        message: 'Invalid value at instancePath',
        instancePath: path,
        value: jsonPointerHelpers.get(spec, path),
      });
    } catch (e) {
      processedErrors.push({
        message: 'Invalid value at instancePath',
        instancePath: path,
        value: 'could not get value at path',
      });
    }
  }

  return processedErrors;
};

export const validateOpenApiV3Document = (
  spec: any,
  // these validators aren't cheap. if we're validating a lot in sequence we should inject a shared instance
  validator: OpenAPISchemaValidator = new OpenAPISchemaValidator()
): OpenAPIV3.Document => {
  let results:
    | {
        errors: ErrorObject[];
      }
    | undefined = undefined;
  // will throw for unsupported spec version before running
  const version = checkOpenAPIVersion(spec);

  if (version === '3.0.x') results = validator.validate3_0(spec);
  if (version === '3.1.x') results = validator.validate3_1(spec);

  if (results && results.errors.length > 0) {
    const processedErrors = processValidatorErrors(spec, results.errors);

    throw new Error(JSON.stringify(processedErrors, null, 2));
  }

  return spec as OpenAPIV3.Document;
};
