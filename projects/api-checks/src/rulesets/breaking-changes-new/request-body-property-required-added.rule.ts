import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const requestBodyPropertyRequiredAdded = check(
  'prevent adding a required property'
)
  .passingExample(
    scenario('adding an optional property').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: [],
      },
      (schema) => {
        if (schema.properties) {
          schema.properties.email = { type: 'string' };
        }
        return schema;
      }
    )
  )
  .failingExample(
    scenario('adding a required property').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: [],
      },
      (schema) => {
        if (schema.properties) {
          schema.properties.email = { type: 'string' };
          schema.required = ['email'];
        }
        return schema;
      }
    )
  );
