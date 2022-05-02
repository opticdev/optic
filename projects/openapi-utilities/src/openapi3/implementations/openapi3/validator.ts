import { OpenAPIV3 } from 'openapi-types';
import OpenAPISchemaValidator, {
  OpenAPISchemaValidatorResult,
} from 'openapi-schema-validator';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

const validator = new OpenAPISchemaValidator({
  version: 3,
  extensions: {
    additionalProperties: true,
  },
});

export const processValidatorErrors = (
  spec: any,
  errors: OpenAPISchemaValidatorResult['errors']
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

export const validateOpenApiV3Document = (spec: any): OpenAPIV3.Document => {
  const results = validator.validate(spec);

  if (results.errors.length > 0) {
    const processedErrors = processValidatorErrors(spec, results.errors);

    throw new Error(JSON.stringify(processedErrors, null, 2));
  }

  return spec as OpenAPIV3.Document;
};
