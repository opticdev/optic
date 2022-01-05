import { check } from '../define-check';
import { scenario } from '../scenarios';
import { expect } from 'chai';

check('required properties in response should not be removed')
  .description(
    'removing a required property will break clients that expect it to be there'
  )
  .implementation(({ bodyProperties }) => {
    const { expect } = require('chai');
    bodyProperties.removed.must(
      'not be removed from response bodies if required ',
      (property, context) => {
        console.log(property);
        if ('inResponse' in context && property.required)
          expect.fail(
            `removing required property '${property.key}' is a breaking change`
          );
      }
    );
  })
  .failingExample(
    scenario('removing required property').responseSchema.changed(
      {
        type: 'object',
        required: ['lookAtMe'],
        properties: {
          lookAtMe: { type: 'string' },
        },
      },
      {
        type: 'object',
        properties: {},
      }
    )
  )
  .passingExample(
    scenario('removing optional property').responseSchema.changed(
      {
        type: 'object',
        properties: {
          lookAtMe: { type: 'string' },
        },
      },
      {
        type: 'object',
        properties: {},
      }
    )
  );
