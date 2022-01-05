import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const requestBodyPropertyTypeChanged = check('prevent changing property type')
  .implementation(({ bodyProperties }) => {
    const { expect } = require('chai');
    bodyProperties.changed.must(
      'not allow changing types',
      (beforeProperty, afterProperty, context) => {
        if (
          context.isInRequest &&
          beforeProperty.flatSchema.type !== afterProperty.flatSchema.type
        ) {
          expect.fail('expected property to not change type');
        }
      }
    );
  })
  .failingExample(
    scenario('changing type').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: [],
      },
      (schema) => {
        if (schema.properties && !('$ref' in schema.properties.name)) {
          schema.properties.name.type = 'number';
        }
        return schema;
      }
    )
  );
