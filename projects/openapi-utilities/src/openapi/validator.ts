import { OpenAPIV3, OpenAPI, OpenAPIV2, OpenAPIV3_1 } from 'openapi-types';
import ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  openapi3_1_json_schema,
  openapi3_0_json_schema,
  openapi2_0_schema_object,
} from './validation-schemas';
import {
  checkOpenAPIVersion,
  SupportedOpenAPIVersions,
} from './openapi-versions';

export default class OpenAPISchemaValidator {
  private v3_0Validator: ValidateFunction | undefined;
  private v3_1Validator: ValidateFunction | undefined;
  private v2_0Validator: ValidateFunction | undefined;

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

  public validate2_0(openapiDoc: OpenAPI.Document): {
    errors: ErrorObject[];
  } {
    if (!this.v2_0Validator) {
      const v = new ajv({ allErrors: true, strict: false });
      addFormats(v);
      v.addSchema(openapi2_0_schema_object);
      this.v2_0Validator = v.compile(openapi2_0_schema_object);
    }

    if (!this.v2_0Validator(openapiDoc) && this.v2_0Validator.errors) {
      return { errors: this.v2_0Validator.errors };
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

type OpenAPIDocumentUnwrap = {
  version: SupportedOpenAPIVersions;
  v3_1?: OpenAPIV3_1.Document;
  v3_0?: OpenAPIV3.Document;
  v2_0?: OpenAPIV2.Document;
  document: OpenAPI.Document;
};

export const validateOpenApiDocument = (
  spec: any,
  // these validators aren't cheap. if we're validating a lot in sequence we should inject a shared instance
  validator: OpenAPISchemaValidator = new OpenAPISchemaValidator()
): OpenAPIDocumentUnwrap => {
  let results:
    | {
        errors: ErrorObject[];
      }
    | undefined = undefined;
  // will throw for unsupported spec version before running
  const version = checkOpenAPIVersion(spec);

  if (version === '3.0.x') results = validator.validate3_0(spec);
  if (version === '3.1.x') results = validator.validate3_1(spec);
  if (version === '2.0.x') results = validator.validate2_0(spec);

  if (results && results.errors.length > 0) {
    const processedErrors = processValidatorErrors(spec, results.errors);

    throw new Error(JSON.stringify(processedErrors, null, 2));
  }

  switch (version) {
    case '2.0.x':
      return {
        v2_0: spec as OpenAPIV2.Document,
        version: '2.0.x',
        document: spec,
      };
    case '3.0.x':
      return {
        v3_0: spec as OpenAPIV3.Document,
        version: '3.0.x',
        document: spec,
      };
    case '3.1.x':
      return {
        v3_1: spec as OpenAPIV3_1.Document,
        version: '3.1.x',
        document: spec,
      };
  }
};
