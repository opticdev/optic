import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

export default check('prevent adding a required property')
  .implementation(({ bodyProperties }) => {
    const { expect } = require('chai');
    bodyProperties.added.must('not be required', (property, context) => {
      if (context.operationAdded) return; // rule doesn't apply for new operations
      if (context.isInRequest && property.required) {
        expect.fail('expected request body property to not be required');
      }
    });
  })
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
