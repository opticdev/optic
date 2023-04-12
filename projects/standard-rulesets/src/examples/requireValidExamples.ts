import {
  OperationRule,
  PropertyRule,
  RequestRule,
  ResponseRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { OpenAPIV3 } from 'openapi-types';
import Ajv from 'ajv/dist/2019';
import addFormats from 'ajv-formats';

type SchemaObject = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;

export function defaultAjv() {
  const validator = new Ajv({ strict: false, unevaluated: true });
  addFormats(validator);
  // override pattern keyword when invalid regex
  validator.removeKeyword('pattern');
  validator.addKeyword({
    keyword: 'pattern',
    type: 'string',
    schemaType: 'string',
    error: {
      message: (cxt) => {
        return `pattern not matched ${cxt.schema}`;
      },
    },
    compile: (pattern) => {
      let regex;
      try {
        regex = new RegExp(pattern);
      } catch (e) {
        return (data) => true;
      }
      return (data) => regex.test(data);
    },
  });
  return validator;
}

export function validateSchema(
  schema: SchemaObject,
  example: unknown,
  ajv: Ajv
): { pass: true } | { pass: false; error: string } {
  const schemaCopy: SchemaObject = JSON.parse(JSON.stringify(schema));
  prepareSchemaForValidation(schemaCopy);

  const schemaCompiled = ajv.compile(schemaCopy);

  const result = schemaCompiled(example);

  if (!result) {
    schemaCompiled.errors?.forEach((error) => {
      if (error.keyword === 'additionalProperties') {
        error.message = `must NOT have additional property '${error.params.additionalProperty}'`;
      }

      if (error.keyword === 'unevaluatedProperties') {
        error.message = `must NOT have additional property '${error.params.unevaluatedProperty}'`;
      }
    });

    const error = `  - ${ajv.errorsText(schemaCompiled.errors, {
      separator: '\n- ',
      dataVar: 'example ',
    })}`;

    return { pass: false, error };
  }

  return { pass: true };
}

// Sets all strict validation (no additional properties) and removes $refs which could be left behind in circular references
function prepareSchemaForValidation(
  schema: SchemaObject | undefined,
  opts?: { inAllOf?: boolean }
) {
  const inAllOf = opts?.inAllOf ?? false;
  if (Array.isArray(schema)) {
    schema.forEach((item) => prepareSchemaForValidation(item));
  } else if (typeof schema === 'object' && schema !== null) {
    // is an object
    if ('$ref' in schema) {
      //
    } else {
      // we should check for refs in `additionalProperties`
      // check for refs in items
      // allOf, oneOf, anyOf, not

      if (!inAllOf) {
        // make default false
        if (
          schema.hasOwnProperty('type') &&
          schema.type === 'object' &&
          !schema.hasOwnProperty('additionalProperties')
        ) {
          schema.additionalProperties = false;
        } else if (
          schema.allOf &&
          schema.type !== 'array' &&
          !schema.hasOwnProperty('additionalProperties') &&
          !schema.hasOwnProperty('unevaluatedProperties')
        ) {
          // Setting a JSON schema
          (schema as any).unevaluatedProperties = false;
          schema.allOf.forEach((s) => {
            prepareSchemaForValidation(s, { inAllOf: true });
          });
          return;
        }
      }

      Object.values(schema).forEach((s) => {
        prepareSchemaForValidation(s);
      });
    }
  }
}

export const requireValidRequestExamples = (ajv: Ajv) =>
  new RequestRule({
    name: 'request body examples must match schema',
    rule: (requestAssertions) => {
      requestAssertions.body.requirement((value) => {
        const { schema, examples, example } =
          value.raw as OpenAPIV3.MediaTypeObject;

        if (example) {
          const result = validateSchema(schema || {}, example, ajv);
          if (!result.pass) {
            throw new RuleError({
              message: `the example does not match the schema. \n${result.error} `,
            });
          }
        }

        if (examples) {
          Object.entries(examples).forEach((example) => {
            const [exampleName, exampleValue] = example as [
              string,
              OpenAPIV3.ExampleObject
            ];
            const result = validateSchema(
              schema || {},
              exampleValue.value,
              ajv
            );
            if (!result.pass) {
              throw new RuleError({
                message: `the example named '${exampleName}' does not match the schema. \n${result.error} `,
              });
            }
          });
        }
      });
    },
  });

export const requireValidResponseExamples = (ajv: Ajv) =>
  new ResponseRule({
    name: 'response body examples must match schemas',
    rule: (responseAssertions) => {
      responseAssertions.requirement((value) => {
        value.bodies.forEach((body) => {
          if (body.raw.example) {
            const result = validateSchema(
              body.raw.schema || {},
              body.raw.example,
              ajv
            );
            if (!result.pass) {
              throw new RuleError({
                message: `the example does not match the schema. \n${result.error} `,
              });
            }
          }

          if (body.raw.examples) {
            Object.entries(body.raw.examples).forEach((example) => {
              const [exampleName, exampleValue] = example as [
                string,
                OpenAPIV3.ExampleObject
              ];
              const result = validateSchema(
                body.raw.schema || {},
                exampleValue.value,
                ajv
              );
              if (!result.pass) {
                throw new RuleError({
                  message: `the example named '${exampleName}' does not match the schema. \n${result.error} `,
                });
              }
            });
          }
        });
      });
    },
  });

export const requireValidParameterExamples = (ajv: Ajv) =>
  new OperationRule({
    name: 'parameter examples must match schemas',
    rule: (operation) => {
      operation.headerParameter.requirement((header) => {
        if (header.raw.example) {
          const result = validateSchema(
            header.raw.schema || {},
            header.raw.example,
            ajv
          );
          if (!result.pass) {
            throw new RuleError({
              message: `header '${header.value.name}' example does not match the schema. \n${result.error} `,
            });
          }
        }
        if (header.raw.schema && 'example' in header.raw.schema) {
          const result = validateSchema(
            header.raw.schema || {},
            header.raw.schema.example,
            ajv
          );
          if (!result.pass) {
            throw new RuleError({
              message: `header '${header.value.name}' example does not match the schema. \n${result.error} `,
            });
          }
        }
      });
      operation.queryParameter.requirement((query) => {
        if (query.raw.example) {
          const result = validateSchema(
            query.raw.schema || {},
            query.raw.example,
            ajv
          );
          if (!result.pass) {
            throw new RuleError({
              message: `query parameter '${query.value.name}' example does not match the schema. \n${result.error} `,
            });
          }
        }
        if (query.raw.schema && 'example' in query.raw.schema) {
          const result = validateSchema(
            query.raw.schema || {},
            query.raw.schema.example,
            ajv
          );
          if (!result.pass) {
            throw new RuleError({
              message: `query parameter '${query.value.name}' example does not match the schema. \n${result.error} `,
            });
          }
        }
      });
      operation.cookieParameter.requirement((cookie) => {
        if (cookie.raw.example) {
          const result = validateSchema(
            cookie.raw.schema || {},
            cookie.raw.example,
            ajv
          );
          if (!result.pass) {
            throw new RuleError({
              message: `cookie '${cookie.value.name}' example does not match the schema. \n${result.error} `,
            });
          }
        }
        if (cookie.raw.schema && 'example' in cookie.raw.schema) {
          const result = validateSchema(
            cookie.raw.schema || {},
            cookie.raw.schema.example,
            ajv
          );
          if (!result.pass) {
            throw new RuleError({
              message: `cookie '${cookie.value.name}' example does not match the schema. \n${result.error} `,
            });
          }
        }
      });
    },
  });

export const requirePropertyExamplesMatchSchema = (ajv: Ajv) =>
  new PropertyRule({
    name: 'require property examples match schemas',
    rule: (property) => {
      property.requirement((property) => {
        const flatSchema = property.value.flatSchema;
        if (property.raw.example) {
          const result = validateSchema(
            flatSchema as SchemaObject,
            property.raw.example,
            ajv
          );
          if (!result.pass) {
            throw new RuleError({
              message: `'${property.value.key}' example does not match the schema. \n${result.error} `,
            });
          }
        }
      });
    },
  });
