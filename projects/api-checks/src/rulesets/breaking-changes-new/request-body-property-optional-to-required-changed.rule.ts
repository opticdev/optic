import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const requestBodyPropertyOptionalToRequired = check(
  'prevent changing optional to required'
)
  .implementation(({ bodyProperties }) => {
    const { expect } = require('chai');
    bodyProperties.changed.must(
      'not change from optional to required',
      (beforeProp, afterProp, context) => {
        if (context.isInRequest && !beforeProp.required && afterProp.required) {
          expect.fail('expected body property to be optional');
        }
      }
    );
  })
  .passingExample(
    scenario('changing required to optional').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
      (schema) => {
        schema.required = [];
        return schema;
      }
    )
  )
  .failingExample(
    scenario('changing optional to required').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: [],
      },
      (schema) => {
        schema.required = ['name'];
        return schema;
      }
    )
  );
