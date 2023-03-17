import {
  OperationRule,
  PropertyRule,
  RequestRule,
  ResponseRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { OpenAPIV3 } from 'openapi-types';
import Ajv, { SchemaObject } from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import { iso4217 } from './constants';

const ajv = (() => {
  const validator = new Ajv({ strict: false, unevaluated: true });
  addFormats(validator);

  validator.addFormat('iso-4217', (value) => {
    return iso4217.has(value);
  });
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
})();

export function validateSchema(
  schema: SchemaObject,
  example: unknown
): { pass: true } | { pass: false; error: string } {
  const copy = JSON.parse(JSON.stringify(schema));
  strictAdditionalProperties(copy);
  const schemaCompiled = ajv.compile(copy);

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

function strictAdditionalProperties(schema: any, inAllOf: boolean = false) {
  if (Array.isArray(schema)) {
    schema.forEach((item) => strictAdditionalProperties(item));
    return;
  }

  if (typeof schema === 'object' && schema !== null) {
    if (!inAllOf) {
      // make default false
      if (
        schema.hasOwnProperty('type') &&
        schema.type === 'object' &&
        !schema.hasOwnProperty('additionalProperties')
      ) {
        schema.additionalProperties = false;
      } else if (
        schema.hasOwnProperty('allOf') &&
        !schema.hasOwnProperty('additionalProperties') &&
        !schema.hasOwnProperty('unevaluatedProperties')
      ) {
        schema.unevaluatedProperties = false;
        schema.allOf.forEach((s) => {
          strictAdditionalProperties(s, true);
        });
        return;
      }
    } else if (
      schema.hasOwnProperty('type') &&
      schema.type === 'object' &&
      !schema.hasOwnProperty('unevaluatedProperties')
    ) {
      // schema.unevaluatedProperties = false;
    }

    Object.values(schema).forEach((s) => {
      strictAdditionalProperties(s, false);
    });
  }
}

export const requireValidRequestExamples = new RequestRule({
  name: 'request body examples must match schema',
  rule: (requestAssertions) => {
    requestAssertions.body.requirement((value) => {
      const { schema, examples, example } =
        value.raw as OpenAPIV3.MediaTypeObject;

      if (example) {
        const result = validateSchema(schema || {}, example);
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
          const result = validateSchema(schema || {}, exampleValue.value);
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

export const requireValidResponseExamples = new ResponseRule({
  name: 'response body examples must match schemas',
  rule: (responseAssertions) => {
    responseAssertions.requirement((value) => {
      value.bodies.forEach((body) => {
        if (body.raw.example) {
          const result = validateSchema(
            body.raw.schema || {},
            body.raw.example
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
              exampleValue.value
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

export const requireValidParameterExamples = new OperationRule({
  name: 'parameter examples must match schemas',
  rule: (operation) => {
    operation.headerParameter.requirement((header) => {
      if (header.raw.example) {
        const result = validateSchema(
          header.raw.schema || {},
          header.raw.example
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
          header.raw.schema.example
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
          query.raw.example
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
          query.raw.schema.example
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
          cookie.raw.example
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
          cookie.raw.schema.example
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

export const requirePropertyExamplesMatchSchema = new PropertyRule({
  name: 'require property examples match schemas',
  rule: (property) => {
    property.requirement((property) => {
      const flatSchema = property.value.flatSchema;
      if (property.raw.example) {
        const result = validateSchema(flatSchema, property.raw.example);
        if (!result.pass) {
          throw new RuleError({
            message: `'${property.value.key}' example does not match the schema. \n${result.error} `,
          });
        }
      }
    });
  },
});
