import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';

const responseBodyPropertyRequiredToOptional = check(
  'prevent changing required to optional'
)
  .implementation(({ bodyProperties }) => {
    const { expect } = require('chai');
    bodyProperties.changed.must(
      'not change from optional to required',
      (beforeProp, afterProp, context) => {
        if (
          context.isInResponse &&
          beforeProp.required &&
          !afterProp.required
        ) {
          expect.fail('expected body property to be optional');
        }
      }
    );
  })
  .passingExample(
    scenario('changing optional to required').responseBodySchema.changed(
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
  )
  .failingExample(
    scenario('changing required to optional').responseBodySchema.changed(
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
  );
