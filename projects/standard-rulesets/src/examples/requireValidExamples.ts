import {
  OperationRule,
  PropertyRule,
  RequestRule,
  ResponseRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { OpenAPIV3 } from 'openapi-types';
import Ajv, { SchemaObject } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = (() => {
  const validator = new Ajv({ strict: false });
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
})();

export function validateSchema(
  schema: SchemaObject,
  example: unknown
): { pass: true } | { pass: false; error: string } {
  const schemaCompiled = ajv.compile(schema);

  const result = schemaCompiled(example);

  if (!result) {
    const error = `- ${ajv.errorsText(schemaCompiled.errors, {
      separator: '\n- ',
    })}`;

    return { pass: false, error };
  }

  return { pass: true };
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
