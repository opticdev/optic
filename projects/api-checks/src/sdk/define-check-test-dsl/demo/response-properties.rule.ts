import { check } from '../define-check';
import { scenario } from '../scenarios';
import { expect } from 'chai';

check('required properties in response should not be removed')
  .implementation(({ bodyProperties }) => {
    const { expect } = require('chai');
    bodyProperties.removed.must(
      'not be required in response bodies',
      (property, context) => {
        if (context.isInResponse && property.required)
          expect.fail(
            `removing required property ${property.key} from response is a breaking change!!`
          );
      }
    );
  })
  .failingExample(
    scenario('removing required property').responseBodySchema.changed(
      {
        type: 'object',
        required: ['lookAtMe'],
        properties: {
          lookAtMe: { type: 'string' },
        },
      },
      (schema) => {
        schema.required = [];
        schema.properties = {};
        return schema;
      }
    )
  )
  .passingExample(
    scenario('removing optional property').responseBodySchema.changed(
      {
        type: 'object',
        properties: {
          lookAtMe: { type: 'string' },
        },
      },
      (schema) => {
        schema.required = [];
        schema.properties = {};
        return schema;
      }
    )
  );
